/*
MIT License
Copyright (c) 2026 Grimfilerino 
*/

import { Component, OnInit, ViewChild, TemplateRef, ElementRef, ChangeDetectorRef, computed, signal, AfterViewInit, OnDestroy, effect, input, output, viewChild, viewChildren } from '@angular/core';
import { DateTime } from "luxon";
import { CalendarEvent, CalendarEventClicked, CalendarResource, CalendarResourceGroup, CalendarSettings, CalendarDragEvent } from '../../interfaces/calendar';
import { CommonModule } from '@angular/common';
import { FormatTimeSlotPipe } from '../../pipes/format';
import { TimeSlot } from '../../types';

export const MINUTES_IN_A_DAY = 1440;

interface ExtendedCalendarEvent extends CalendarEvent {
    lane: number,
    style: {},
}

@Component({
    selector: 'ngx-epochx-day-calendar',
    imports: [CommonModule, FormatTimeSlotPipe],
    standalone: true,
    templateUrl: './ngx-epochx-day-calendar.html',
    styleUrls: ['./ngx-epochx-day-calendar.css']
})
export class NgxEpochxDayCalendar implements OnInit, AfterViewInit, OnDestroy {
    // === Observers === //
    private resizeObserver!:    ResizeObserver;

    // === Private signals === //
    private _timeLineHeight  = computed(() => this._timeslotsHeight() - this._resourceLabelHeight());
	private _timeLineOffset  = signal(0);
    private _timeslotsHeight = signal(0);
    private _timeslotAmount  = signal(0);

    private _resourceLabelHeight    = signal(0);
    private _resourceElementHeight  = signal(0);
    private _resourceAmount         = signal(0);
    private _resourceLabelText      = signal("");

    private eventsAtCurrentDate = signal<ExtendedCalendarEvent[]>([]);

    private _times = signal<TimeSlot[]>([]);

    private _hasRendered = signal(false);


    // === Public signals === //
    public readonly timeLineHeight			= this._timeLineHeight;
    public readonly timeLineOffset			= this._timeLineOffset.asReadonly();
    public readonly times					= this._times.asReadonly();

    public readonly resourceElementHeight	= this._resourceElementHeight.asReadonly();
    public readonly resourceLabelHeight		= this._resourceLabelHeight.asReadonly();
    public readonly resourceLabelText		= this._resourceLabelText.asReadonly();

    // === Inputs === //
	date				= input.required<Date>();
	calendarSettings	= input.required<CalendarSettings>();
    resources			= input.required<CalendarResource[]>();

    events				= input<CalendarEvent[]>([]);
	resourceGroups		= input<CalendarResourceGroup[]>([]);


    // === Templates === //
	eventTemplate = input<TemplateRef<any> | null>(null);
	resourceTemplate = input<TemplateRef<any> | null>(null);


    // === Outputs === //
	resourceGroupToggled	= output<Record<string, boolean>>();
	eventClicked			= output<CalendarEventClicked>();
	eventDragged			= output<CalendarDragEvent>();


    // === View Childs === //
	timeslots		 = viewChild.required<ElementRef<HTMLDivElement>>('timeslots');
	timeline		 = viewChild.required<ElementRef<HTMLDivElement>>('timeline');
	resourceTitle	 = viewChild.required<ElementRef<HTMLDivElement>>('resourceTitle');

	eventsUngrouped = viewChildren<ElementRef<HTMLDivElement>>('eventUngrouped');
	eventsGrouped   = viewChildren<ElementRef<HTMLDivElement>>('eventGrouped');


    constructor(private cdr: ChangeDetectorRef) {
        effect(() => {
            if(this.date() && this.events() &&  this._hasRendered()) {
                this.eventsAtCurrentDate.set(this.events().filter(
                    (event: CalendarEvent) => {
                        return DateTime.fromJSDate(event.startDate).hasSame(DateTime.fromJSDate(this.date()), "day")
                            || DateTime.fromJSDate(event.endDate).hasSame(DateTime.fromJSDate(this.date()), "day");
                    })
                    .map((event)=> Object.assign({}, event, {lane: 0}, {style : this.getEventStyle(event)})));
            }
        });
    }

    // === Angular Render Cycle === //

    ngOnInit(): void {
        if(this.calendarSettings()) {
            if(!this.calendarSettings().timeslotInterval) {
                this.calendarSettings().timeslotInterval = 30;
            }

			if(!this.calendarSettings().timeslotLabelInterval) {
				this.calendarSettings().timeslotLabelInterval = 30;
			}

            this._resourceLabelText.set(this.calendarSettings()?.resourceLabelText ?? "Resources");
            this._resourceAmount.set(this.resourceGroups().length);

            for(let group of this.resourceGroups()) {
                if(group.expanded == undefined) {
                    group.expanded = true;
                }
            }

            this.generateTimeslots();
        }
    }

    ngAfterViewInit(): void {
        this._hasRendered.set(true);
        this._timeslotsHeight.set(this.timeslots().nativeElement.clientHeight);
        this._resourceLabelHeight.set(this.resourceTitle().nativeElement.clientHeight);

        this.resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
            for(let entry of entries) {
                if(entry.target.isSameNode(this.resourceTitle().nativeElement)) {
                    this._resourceLabelHeight.set(this.resourceTitle().nativeElement.clientHeight);
                }

                if(entry.target.isSameNode(this.timeslots().nativeElement)) {
                    this._timeslotsHeight.set(this.timeslots().nativeElement.clientHeight);
					this._timeLineOffset.set(this.currentTimeInPixels);
                }
            }
        });

        this.resizeObserver.observe(this.resourceTitle().nativeElement);
        this.resizeObserver.observe(this.timeslots().nativeElement);

    }

    ngOnDestroy(): void {
        this.resizeObserver.disconnect();
    }

    // === Private Functions === //

    private assignLanes(events: ExtendedCalendarEvent[]) : { events: ExtendedCalendarEvent[], lanes : any[] }  {
        const lanes: any[] = [];

        let overlaps = (a: ExtendedCalendarEvent, b: ExtendedCalendarEvent): boolean => {
            const aStart = DateTime.fromJSDate(a.startDate);
            const aEnd   = DateTime.fromJSDate(a.endDate);
            const bStart = DateTime.fromJSDate(b.startDate);
            const bEnd   = DateTime.fromJSDate(b.endDate);
            return (aStart < bEnd && aEnd > bStart);
        }

        for (const event of events) {
            event.lane = 0;
            let placed = false;

            for (let i: number = 0; i < lanes.length; i++) {
                if (!overlaps(event, lanes[i][lanes[i].length - 1])) {
                    lanes[i].push(event);
                    event.lane = i + 1;
                    placed = true;
                    break;
                }
            }

            if (!placed) {
                lanes.push([event]);
                event.lane = lanes.length;
            }
        }

        return {
            events,
            lanes
        };
    }

    // === Public Functions === //

    public get currentTimeInPixels(): number {
        const width		= this.timeslots().nativeElement.scrollWidth;
        const minutes   = DateTime.now().diff(DateTime.now().startOf('day'), 'minutes').minutes;
        const pxPerMin  = width / MINUTES_IN_A_DAY;

        return Math.ceil(minutes * pxPerMin + this.resourceTitle().nativeElement.clientWidth);
    }

    public getEventGridStyle(calendarWidth: number, resourceWidth: number, resourceId: string, eventType: "GROUPED" | "UNGROUPED" = "UNGROUPED"){
        let height = 48; //default

		const events = eventType === "GROUPED" ? this.eventsGrouped() : this.eventsUngrouped();

		for (const event of events) {
			const element = event.nativeElement;

			if (element.getAttribute('data-resource-id') !== resourceId) {
				continue;
			}

			if (element.clientHeight > height) {
				height = element.clientHeight;
			}
		}


		var totalWidth = calendarWidth - resourceWidth;

        return {
            gridTemplateColumns: `repeat(${MINUTES_IN_A_DAY}, ${totalWidth/MINUTES_IN_A_DAY}px)`,
            gridTemplateRows:    `repeat(auto-fill,${height}px)`,
        }
    }


    public getEventStyle(event: CalendarEvent): {} {
        const offset = 1;
        const startMinutes = DateTime.fromJSDate(event.startDate).diff(DateTime.fromJSDate(event.startDate).startOf('day'), 'minutes').minutes;
        const endMinutes   = DateTime.fromJSDate(event.endDate).diff(DateTime.fromJSDate(event.endDate).startOf('day'), 'minutes').minutes;

        return {
            gridColumnStart: `${(startMinutes + offset)}`,
            gridColumnEnd:   `${(endMinutes + offset)}`,
            width:           `100%`,
        };
    }

    public groupVisilityChanged(group: CalendarResourceGroup): void {
        group.expanded = !group.expanded;
    }


    public getCalendarEvents(resourceId: string) {
        let events: ExtendedCalendarEvent[] = this.eventsAtCurrentDate().filter((_event: ExtendedCalendarEvent) => _event.resourceId == resourceId);
        return this.assignLanes(events).events;
    }

    public getCalendarWidth(){
        return `${this.timeslots().nativeElement.clientWidth}px`;
    }

    public getResourceHeigth(resourceId: string, eventType: "GROUPED" | "UNGROUPED" = "UNGROUPED") {
        let result       =  this.assignLanes(this.eventsAtCurrentDate().filter((event: ExtendedCalendarEvent) => event.resourceId == resourceId));
        let lanes        =  result.lanes.length;
        let height       =  48
        let laneAmount   =  lanes > 0 ? lanes : 1;

        const events = eventType === "GROUPED" ? this.eventsGrouped() : this.eventsUngrouped();

		for (const event of events) {
			const element = event.nativeElement;

			if (element.getAttribute('data-resource-id') !== resourceId) {
				continue;
			}

			if (element.clientHeight > height) {
				height = element.clientHeight;
			}
		}

        return height * laneAmount;
    }

    private generateTimeslots() {
        let start    = DateTime.fromJSDate(this.date()).startOf('day');
        let interval = this.calendarSettings().timeslotInterval ?? 30;

        let timeslots: TimeSlot[] = [];

        for(let index= 0; index < (MINUTES_IN_A_DAY / interval); index++) {
            let timeDate = start.plus(
                { minutes: (interval*index) }
            );

            timeslots.push(timeDate.toFormat("HH:mm") as TimeSlot);
        }

        this._times.set(timeslots);
        this._timeslotAmount.set(timeslots.length);
    }

    public getResourcesWithNoGroup(): CalendarResource[] {
        return this.resources().filter((resource: CalendarResource) => {
            return !resource.groupId
                || !this.resourceGroups
                || !this.resourceGroups().find((group: CalendarResourceGroup) => {
                    return group.id == resource.groupId
                })
        });
    }

    public getResourcesInGroup(groupId: string): CalendarResource[] {
        return this.resources().filter((resource: CalendarResource) => {
            return resource.groupId == groupId
        });
    }

	public shouldTimeLabelBeVisible(time: string) {
		let [hour, minutes] = time.split(":");
		let interval = this.calendarSettings().timeslotLabelInterval ?? 30;
		let totalMinutes = Number(hour) * 60 + Number(minutes);
		
		return totalMinutes % interval == 0;
	}

    /**
     *  @summary Set the timeslotInterval after the calendar has been initialized
     *
     *  @param timeslotInterval - should be a number between (1 - 1440)
     *
     *  @author Grimfilerino
     *
     * */
    public set timeslotInterval(timeslotInterval: number) {
        if(!this._hasRendered()) {
            return;
        }

        if(this.calendarSettings()) {
            this.calendarSettings().timeslotInterval = timeslotInterval;
            this.generateTimeslots();
            this.cdr.markForCheck();
        }
    }

	/**
     *  @summary Set the timeslotInterval after the calendar has been initialized
     *
     *  @param timeslotInterval - should be a number between (1 - 1440)
     *
     *  @author Grimfilerino
     *
     * */
    public set timeslotLabelInterval(timeslotLabelInterval: number) {
        if(!this._hasRendered()) {
            return;
        }

        if(this.calendarSettings()) {
            this.calendarSettings().timeslotLabelInterval = timeslotLabelInterval;
            this.generateTimeslots();
            this.cdr.markForCheck();
        }
    }
}
