/*
MIT License
Copyright (c) 2026 Grimfilerino 
*/

import { Component, OnInit, TemplateRef, ElementRef, computed, signal, AfterViewInit, OnDestroy, effect, input, output, viewChild, viewChildren, inject, ChangeDetectorRef, untracked } from '@angular/core';
import { CalendarEvent, CalendarEventClicked, CalendarResource, CalendarResourceGroup, CalendarSettings, CalendarDragEvent } from '../../interfaces/calendar';
import { CommonModule } from '@angular/common';
import { FormatTimeSlotPipe } from '../../pipes/format';
import { TimeSlot } from '../../types';
import { addDurationToTimeslot, convertTimeSlotToDate } from '../../utils';
import { DateTime } from 'luxon';

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
	// === Injects === //
	private cdr = inject(ChangeDetectorRef);

	// === Observers === //
	private resizeObserver!: ResizeObserver;

	// === Private signals === //
	private _timeLineHeight = computed(() => this._timeslotsHeight() - this._resourceLabelHeight());
	private _timeLineOffset = signal(0);
	private _timeslotsHeight = signal(0);
	private _timeslotAmount = signal(0);

	private _resourceLabelHeight = signal(0);
	private _resourceElementHeight = signal(0);
	private _resourceAmount = signal(0);
	private _resourceLabelText = signal("");

	private eventsAtCurrentDate = signal<ExtendedCalendarEvent[]>([]);

	private _times = signal<TimeSlot[]>([]);

	private _hasRendered = signal(false);

	private _resourceListAboveTimeline = signal(false);

	private _hasBusinessHoursToday = signal(false);

	// === Public signals === //
	public readonly timeLineHeight = this._timeLineHeight;
	public readonly timeLineOffset = this._timeLineOffset.asReadonly();
	public readonly times = this._times.asReadonly();

	public readonly hasBusinessHoursToday = this._hasBusinessHoursToday.asReadonly();

	public readonly resourceElementHeight = this._resourceElementHeight.asReadonly();
	public readonly resourceLabelHeight = this._resourceLabelHeight.asReadonly();
	public readonly resourceLabelText = this._resourceLabelText.asReadonly();

	public readonly resourceListAboveTimeline = this._resourceListAboveTimeline.asReadonly();

	public collapsedResources = signal<Set<string>>(new Set());

	// === Inputs === //
	date = input.required<Date>();
	calendarSettings = input.required<CalendarSettings>();
	resources = input.required<CalendarResource[]>();

	events = input<CalendarEvent[]>([]);
	resourceGroups = input<CalendarResourceGroup[]>([]);


	// === Templates === //
	eventTemplate = input<TemplateRef<any> | null>(null);
	resourceTemplate = input<TemplateRef<any> | null>(null);


	// === Outputs === //
	resourceGroupToggled = output<Record<string, boolean>>();
	eventClicked = output<CalendarEventClicked>();
	eventDragged = output<CalendarDragEvent>();


	// === View Childs === //
	timeslots = viewChild.required<ElementRef<HTMLDivElement>>('timeslots');
	timeline = viewChild.required<ElementRef<HTMLDivElement>>('timeline');
	resourceTitle = viewChild.required<ElementRef<HTMLDivElement>>('resourceTitle');
	calendarInner = viewChild.required<ElementRef<HTMLDivElement>>('calendarInner');
	resourceList = viewChild.required<ElementRef<HTMLDivElement>>('resourceList');
	calendar = viewChild.required<ElementRef<HTMLDivElement>>('calendar');

	eventsUngrouped = viewChildren<ElementRef<HTMLDivElement>>('eventUngrouped');
	eventsGrouped = viewChildren<ElementRef<HTMLDivElement>>('eventGrouped');

	// === Private varibles ===//
	todaysBusinessHours: { [time: string]: boolean } = {};

	constructor() {
		effect(() => {
			if (this.date() && this.events() && this._hasRendered()) {
				this.eventsAtCurrentDate.set(this.events().filter(
					(event: CalendarEvent) => {
						return DateTime.fromJSDate(event.startDate).hasSame(DateTime.fromJSDate(this.date()), "day")
							|| DateTime.fromJSDate(event.endDate).hasSame(DateTime.fromJSDate(this.date()), "day");
					})
					.map((event) => Object.assign({}, event, { lane: 0 }, { style: this.getEventStyle(event) })));
				this.calculateBusinessHours();
			}
		});
	}

	// === Angular Render Cycle === //

	ngOnInit(): void {
		if (this.calendarSettings()) {
			if (!this.calendarSettings().timeslotInterval) {
				this.calendarSettings().timeslotInterval = 30;
			}

			if (!this.calendarSettings().timeslotLabelInterval) {
				this.calendarSettings().timeslotLabelInterval = 30;
			}

			this._resourceLabelText.set(this.calendarSettings()?.resourceLabelText ?? "Resources");
			this._resourceAmount.set(this.resourceGroups().length);

			for (let group of this.resourceGroups()) {
				if (group.expanded == undefined) {
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
			for (let entry of entries) {
				if (entry.target.isSameNode(this.resourceTitle().nativeElement)) {
					this._resourceLabelHeight.set(this.resourceTitle().nativeElement.clientHeight);
				}

				if (entry.target.isSameNode(this.resourceList().nativeElement)) {
				}

				if (entry.target.isSameNode(this.timeslots().nativeElement)) {
					this._timeslotsHeight.set(this.timeslots().nativeElement.clientHeight);
					this._timeLineOffset.set(this.currentTimeInPixels);
					this.jumpToCurrentTime();
				}

				if (entry.target.isSameNode(this.calendarInner().nativeElement)) {
					this._resourceLabelHeight.set(this.resourceTitle().nativeElement.clientHeight);
					this._timeslotsHeight.set(this.timeslots().nativeElement.clientHeight);
					this._timeLineOffset.set(this.currentTimeInPixels);
				}
			}

		});

		this.resizeObserver.observe(this.resourceTitle().nativeElement);
		this.resizeObserver.observe(this.resourceList().nativeElement);
		this.resizeObserver.observe(this.timeslots().nativeElement);
		this.resizeObserver.observe(this.calendarInner().nativeElement);


	}

	ngOnDestroy(): void {
		this.resizeObserver.disconnect();
	}

	// === Private Functions === //

	private calculateBusinessHours(): void {
		let date = DateTime.fromJSDate(this.date());
		let todaysBusinessHours = this.calendarSettings()?.businessHours?.[date.weekdayShort?.toLowerCase() ?? ""];

		if (!todaysBusinessHours || !todaysBusinessHours.endTime || !todaysBusinessHours.startTime) {
			this._hasBusinessHoursToday.set(false);
			return;
		}

		this._hasBusinessHoursToday.set(true);

		let [startHour, startMinute] = todaysBusinessHours.startTime.split(":").map(Number);

		let startDate = date.set({
			hour: startHour,
			minute: startMinute,
			second: 0,
			millisecond: 0,
		});

		let [endHour, endMinute] = todaysBusinessHours.endTime.split(":").map(Number);

		let endDate = date.set({
			hour: endHour,
			minute: endMinute,
			second: 0,
			millisecond: 0,
		});

		for (let time of this.times()) {
			let [currentHour, currentMinute] = time.split(":").map(Number);

			let currentDate = date.set({
				hour: currentHour,
				minute: currentMinute,
				second: 0,
				millisecond: 0,
			});

			this.todaysBusinessHours[time] = (startDate <= currentDate && endDate >= currentDate);
		}
	}

	private assignLanes(events: ExtendedCalendarEvent[]): { events: ExtendedCalendarEvent[], lanes: any[] } {
		const lanes: any[] = [];

		let overlaps = (a: ExtendedCalendarEvent, b: ExtendedCalendarEvent): boolean => {
			const aStart = DateTime.fromJSDate(a.startDate);
			const aEnd = DateTime.fromJSDate(a.endDate);
			const bStart = DateTime.fromJSDate(b.startDate);
			const bEnd = DateTime.fromJSDate(b.endDate);
			return (aStart < bEnd && aEnd > bStart);
		}


		for (const event of events) {
			event.lane = 0;
			let placed = false;

			let resource = this.resources().find(r => r.id == event.resourceId);


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


			if (resource?.availability?.enabled) {
				event.lane += 1;
			}
		}

		return {
			events,
			lanes
		};
	}

	private updateResourceListZIndex(): void {
		if (!this.timeline() || !this.resourceList()) {
			return;
		}

		const timelineRect =
			this.timeline().nativeElement.getBoundingClientRect();

		const resourceRect =
			this.resourceList().nativeElement.getBoundingClientRect();

		const overlaps =
			timelineRect.left < resourceRect.right &&
			timelineRect.right > resourceRect.left;

		this._resourceListAboveTimeline.set(overlaps);
	}

	// === Public Functions === //

	public toggleResource(resourceId: string) {
		this.collapsedResources.update(set => {
			const next = new Set(set);

			if (next.has(resourceId)) {
				next.delete(resourceId);
			} else {
				next.add(resourceId);
			}

			return next;
		});

		this.cdr.detectChanges();
	}

	public getTimeslotBusinessHour(time: TimeSlot): any {
		return this.todaysBusinessHours[time];
	}

	public onCalendarScroll(): void {
		this.updateResourceListZIndex();
	}

	public get currentTimeInPixels(): number {
		const width = this.timeslots().nativeElement.scrollWidth;
		const minutes = DateTime.now().diff(DateTime.now().startOf('day'), 'minutes').minutes;
		const pxPerMin = width / MINUTES_IN_A_DAY;

		return Math.ceil(minutes * pxPerMin + this.resourceTitle().nativeElement.clientWidth);
	}

	public getEventGridStyle(calendarWidth: number, resourceWidth: number) {
		var totalWidth = calendarWidth - resourceWidth;

		return {
			gridTemplateColumns: `repeat(${MINUTES_IN_A_DAY}, ${totalWidth / MINUTES_IN_A_DAY}px)`,
		}
	}

	public getResourceAvailabilityClass(time: TimeSlot, resourceId: string): string {
		let resource = this.resources().find(r => r.id === resourceId);

		if (!resource?.availability?.enabled) {
			return "";
		}

		let classes = "";
		let slots = this.getAvailabilitySlots(time, resourceId);

		if (resource.availability.removeSlots) {
			if (slots == 0) {
				classes += `${resource.availability.fullClass ?? ""} full`;
			} else {
				classes += `${resource.availability.freeClass ?? ""} free`;
			}
		} else {
			if (slots >= resource.availability.maxSlots) {
				classes += `${resource.availability.fullClass ?? ""} full`;
			} else {
				classes += `${resource.availability.freeClass ?? ""} free`;
			}
		}

		return classes;
	}

	public getResourceAvailabilityStyle(time: TimeSlot): {} {
		let endTime = addDurationToTimeslot(this.calendarSettings().timeslotInterval ?? 30, time);

		const offset = 1;
		const [startHour, startMinute] = time.split(':').map(Number);
		const [endHour, endMinute] = endTime.split(':').map(Number);

		const startMinutes = startHour * 60 + startMinute;
		const endMinutes = endHour * 60 + endMinute;

		return {
			gridColumnStart: `${(startMinutes + offset)}`,
			gridColumnEnd: `${(endMinutes + offset)}`,
			width: `100%`,
		};
	}

	public getAvailabilitySlots(time: TimeSlot, resourceId: string): number {
		let resource = this.resources().find(r => r.id == resourceId);

		if (!resource?.availability?.enabled) {
			return 0;
		}

		let slots = 0;

		if (resource?.availability?.maxSlots != 0 && resource.availability.removeSlots) {
			slots = resource?.availability?.maxSlots;
		}

		let events = this.events().filter(event => event.resourceId == resourceId);
		let date = DateTime.fromJSDate(convertTimeSlotToDate(time, DateTime.fromJSDate(this.date()).day.toString()));

		for (let event of events) {
			let startDate = DateTime.fromJSDate(event.startDate);
			let endDate = DateTime.fromJSDate(event.endDate);

			if (startDate < date && date < endDate) {

				if (!resource.availability?.removeSlots) {
					slots += event.slots ?? 0;
				} else {
					slots -= event.slots ?? 0;

					if (slots < 0) {
						slots = 0;
					}
				}
			}
		}

		return slots;
	}

	public getEventStyle(event: CalendarEvent): {} {
		const offset = 1;
		const startMinutes = DateTime.fromJSDate(event.startDate).diff(DateTime.fromJSDate(event.startDate).startOf('day'), 'minutes').minutes;
		const endMinutes = DateTime.fromJSDate(event.endDate).diff(DateTime.fromJSDate(event.endDate).startOf('day'), 'minutes').minutes;

		return {
			gridColumnStart: `${(startMinutes + offset)}`,
			gridColumnEnd: `${(endMinutes + offset)}`,
			width: `100%`,
		};
	}

	public groupVisilityChanged(group: CalendarResourceGroup): void {
		group.expanded = !group.expanded;
	}


	public getCalendarEvents(resourceId: string) {
		let events: ExtendedCalendarEvent[] = this.eventsAtCurrentDate().filter((_event: ExtendedCalendarEvent) => _event.resourceId == resourceId);
		return this.assignLanes(events).events;
	}

	public getCalendarWidth() {
		return `${this.timeslots().nativeElement.clientWidth}px`;
	}

	public getResourceHeight(resourceId: string, eventType: "GROUPED" | "UNGROUPED" = "UNGROUPED") {
		let height = 0;
		let availabilityHeight = 0;
		let resource = this.resources().find(r => r.id == resourceId);
		const collapsed = this.collapsedResources();

		if (resource?.availability?.enabled) {
			availabilityHeight = 18; //18px 
		}

		const events = eventType === "GROUPED" ? this.eventsGrouped() : this.eventsUngrouped();

		for (const event of events) {
			const element = event.nativeElement;

			if (element.getAttribute('data-resource-id') !== resourceId) {
				continue;
			}

			height += element.clientHeight;
		}

		if (height == 0) {
			if (!this.calendarSettings().enableResourceCollapse || !collapsed.has(resourceId)) {
				height = 48;
			} else {
				height = 28;
			}
		}

		return height + availabilityHeight;
	}

	private generateTimeslots() {
		let start = DateTime.fromJSDate(this.date()).startOf('day');
		let interval = this.calendarSettings().timeslotInterval ?? 30;

		let timeslots: TimeSlot[] = [];

		for (let index = 0; index < (MINUTES_IN_A_DAY / interval); index++) {
			let timeDate = start.plus(
				{ minutes: (interval * index) }
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
		if (!this._hasRendered()) {
			return;
		}

		if (this.calendarSettings()) {
			this.calendarSettings().timeslotInterval = timeslotInterval;
			this.generateTimeslots();
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
		if (!this._hasRendered()) {
			return;
		}

		if (this.calendarSettings()) {
			this.calendarSettings().timeslotLabelInterval = timeslotLabelInterval;
			this.generateTimeslots();
		}
	}

	/**
	 *	Jump to the current time in the calendar and update z-index of resourceList for timeline style
	 *
	 *	@param [offset=0] optional to offset it, positive numbers is right and negative numbers is left 
	 */
	public jumpToCurrentTime(offset: number = 0): void {
		this.calendarInner().nativeElement.scrollTo({ left: this.timeLineOffset() + offset });
		this.updateResourceListZIndex();
	}

	public getResourceCollapsedStatus(resourceId: string): boolean {
		return this.collapsedResources().has(resourceId);
	}
}
