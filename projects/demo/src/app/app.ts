import { CalendarEvent, CalendarResource, CalendarSettings, NgxEpochxDateHeader, NgxEpochxDayCalendar } from 'ngx-epochx-calendar';
import { Component, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'app-root',
	imports: [NgxEpochxDayCalendar, NgxEpochxDateHeader],
	templateUrl: './app.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	styleUrl: './app.css'
})
export class App {
	protected readonly title = signal('demo');

	resourceGroups = signal([
		{
			id: "23",
			title: "Group #1"
		}
	]);

	resources = signal<CalendarResource[]>([
		{
			id: "1",
			title: "#1",
		},
		{
			id: "2",
			title: "#2",
		},
		{
			id: "3",
			title: "#3",
			groupId: "23",
			availability: {
				enabled: true,
				maxSlots: 1000,
				removeSlots: true
			},
		},
		{
			id: "6",
			title: "#1",
		},
		{
			id: "8",
			title: "#2",
		},
		{
			id: "9",
			title: "#3",
		},
		{
			id: "12",
			title: "#1",
		},
		{
			id: "19",
			title: "#2",
		},
		{
			id: "40",
			title: "#3",
		},
		{
			id: "18",
			title: "#3",
		},
		{
			id: "16",
			title: "#1",
		},
		{
			id: "62",
			title: "#2",
		},
		{
			id: "64",
			title: "#3",
		}
	]);

	events = signal<CalendarEvent[]>([
		{
			title: "Testberg 1",
			id: "001",
			resourceId: "1",
			startDate: new Date(),
			endDate: new Date(),
			slots:0,
		},
		{
			title: "Testberg 2",
			id: "011",
			resourceId: "3",
			startDate: new Date(),
			endDate: new Date(),
			slots:10,
		},
		{
			title: "Testberg 2",
			id: "011",
			resourceId: "62",
			startDate: new Date(),
			endDate: new Date(),
			slots:0,
		},
	]);

	date = signal(new Date());

	myCalendarSettings: CalendarSettings = {
		timezone: "Europe/Stockholm",
		locale: "en-US",
		businessHours: {
			"tue": {
				startTime: "08:00",
				endTime: "17:00",
			}
		},
		enableResourceCollapse: true
	}

	@ViewChild("calendar", { static: false }) calendar!: NgxEpochxDayCalendar;
	constructor() { }

}
