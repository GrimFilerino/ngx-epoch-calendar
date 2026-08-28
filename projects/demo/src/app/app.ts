import { CalendarSettings, NgxEpochxDateHeader, NgxEpochxDayCalendar } from 'ngx-epochx-calendar';
import { AfterViewInit, Component, signal, ViewChild } from '@angular/core';

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
	resources = signal([
		{
			id: "1",
			title: "#1",
			groupId: "23"
		},
		{
			id: "2",
			title: "#2",
		},
		{
			id: "3",
			title: "#3",
			groupId: "23"
		}
	]);
	events = signal([
		{
			title: "Testberg",
			id: "001",
			resourceId: "1",
			startDate: new Date(`2026-02-19T13:00`),
			endDate: new Date(`2026-02-19T15:05`),
		},
		{
			title: "Testberg",
			id: "011",
			resourceId: "1",
			startDate: new Date(`2026-02-19T12:00`),
			endDate: new Date(`2026-02-19T16:00`),
		},
		{
			title: "Testberg",
			id: "111",
			resourceId: "1",
			startDate: new Date(`2026-02-19T19:00`),
			endDate: new Date(`2026-02-19T22:00`),
		},
		{
			title: "Testberg",
			id: "121",
			resourceId: "3",
			startDate: new Date(`2026-02-19T16:00`),
			endDate: new Date(`2026-02-19T19:00`),
		}
	]);

	date = signal(new Date());

	myCalendarSettings: CalendarSettings = {
		timezone: "Europe/Stockholm",
		locale: "en-US",
	}

	@ViewChild("calendar", { static: false }) calendar!: NgxEpochxDayCalendar;
	constructor() { }

}
