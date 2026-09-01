import { CalendarEvent, CalendarResource, CalendarSettings, NgxEpochxDateHeader, NgxEpochxDayCalendar } from 'ngx-epochx-calendar';
import { Component, signal, ViewChild } from '@angular/core';

@Component({
	selector: 'app-root',
	imports: [NgxEpochxDayCalendar, NgxEpochxDateHeader],
	templateUrl: './app.html',
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
		}
	]);

	events = signal<CalendarEvent[]>([
		{
			title: "Testberg 1",
			id: "001",
			resourceId: "1",
			startDate: new Date(`2026-09-01T13:00`),
			endDate: new Date(`2026-09-01T15:05`),
			slots:0,
		},
		{
			title: "Testberg 2",
			id: "011",
			resourceId: "3",
			startDate: new Date(`2026-09-01T12:00`),
			endDate: new Date(`2026-09-01T16:00`),
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
