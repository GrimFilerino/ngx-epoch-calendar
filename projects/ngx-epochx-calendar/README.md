# Ngx Epochx Calendar

Welcome, this is an open source Angular event calendar component which was built to improve and replace FullCalendar in our booking-system. The goal is to improve both design flexibility but also improve performance when venues have a large amount of guests and events.

Contributions are very welcomed and usage is under an **MIT license**.

To contribute please read **CONTRIBUTING.md**.

Feel free to fork the code at any time if you would like to make it your own component.

![calendar-in-use](url-to-img-here)

<br>

## Installation

```bash
# Install with your favorite package manager for node
npm install ngx-epochx-calendar
```
```ts
// Then import it into your Angular component
import {
    NgxEpochxDayCalendar,
    NgxEpochxDateHeader
} from 'ngx-epochx-calendar';

@Component({
    ...
    imports: [
        NgxEpochxDayCalendar,
        NgxEpochxDateHeader
    ]
})
```

```html
<!-- And then use it in your HTML code like this -->
<ngx-epochx-date-header [(date)]="date"></ngx-epochx-date-header>

<ngx-epochx-day-calendar
    [calendarSettings]="..."
    [events]="..." <!-- signal input of an array of Events -->
    [resources]="..." <!-- signal input of an array of Resources -->
    [resourceGroups]="..." <!-- signal input of an array of Resource Groups -->
    [date]="date()">
</ngx-epochx-day-calendar>
```


Check out the GIT repo for more details.
[GIT Repo](https://github.com/GrimFilerino/ngx-epochx-calendar)
