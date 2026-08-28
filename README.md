# Ngx Epochx Calendar

Welcome, this is an open source angular event calendar component which was built to improve and replace full calendar in our booking-system. The goal is to improve both design flexibility but also to improve performance when venues have a large amount of guests and events.

Contributions are very welcomed and usage is under an **MIT license**. 

To contribute please read **CONTRIBUTING.md**.

Feel free to fork the code at any time if you would like to make it your own component.

![calendar-in-use](url-to-img-here)

<br>

## Installation

```bash
#Install with your favorite package manager for node
npm install ngx-epochx-calendar 
```

```Typescript
//Then import it to your app.modules.ts in angular
import: [
    ...
    NgxEpochxDayCalendar,
    NgxEpochxDateHeader
]
```

```html
<!-- And then use it in your HTML code like this -->
<ngx-epochx-date-header [(date)]="date"></ngx-epochx-date-header>
<ngx-epochx-day-calendar [calendarSettings]="..." 
    [events]="..."  <!-- signal input of an array of Events -->
    [resources]="..." <!-- signal input of an array of Resources -->
    [resourceGroups]="..." <!-- signal input of an array of Resource Groups -->
    [date]="date()">
</ngx-epochx-day-calendar>

```

## Usage
Here is an example of how you could use the calendar and it's components.

> **Note that resource groups and events are optional and is not needed for the calendar to work.**

```typescript
export class ExampleComponent {
    date: Date = new Date();
    
    //optional
    resourceGroups =  signal([
        {
            id:"23",
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

    //optional
    events = signal([
        {
            title: "B-1712",
            id: "001",
            resourceId: "1",
            startDate: new Date(`2026-05-02T13:00`),
            endDate: new Date(`2026-05-02T15:05`),
            metadata: {
                customer: {
                    firstName: "Filip",
                    lastName: "Testberg"
                }
            }
        },
    ]);

    myCalendarSettings: CalendarSettings = {
        timezone: "stockholm/sweden",
        locale: "en_SE",
        timeslotInterval: 30 //should be formatted as a number in minutes (0-1440),
        class: "funbutler-calendar",
        businessHours: {
            "sat" : {
                startTime: "09:00",
                endTime: "17:00",
            },
            "mon" : {
                startTime: "09:00",
                endTime: "17:00",
            },
        }
    };


}
```

```html
<div class="container">
    <ngx-epochx-date-header class="w-full block" [(date)]="date"></ngx-epochx-date-header>

    <!-- The calendar will rerender when the signal inputs are updated (it is responsive) -->
    <ngx-epochx-day-calendar class="block h-screen" 
                [date]="date"
                [calendarSettings]="myCalendarSettings"
                [events]="events()"
                [resources]="resources()"
                [resourceGroups]="resourceGroups()">
        <ng-template #eventTemplate let-event>
            <div class="bg-red-500 text-white rounded-sm font-bold text-sm">
                <span>{{ event.title }} - {{ event.metadata.customer.firstName }} {{ event.metadata.customer.lastName }}</span>
            </div>
        </ng-template>
    </ngx-epochx-day-calendar>
</div>

```

## Interfaces

The different components take in different types of data. The following tables will show what data with a clarification on formats.

<br>

#### CalendarSettings

| Name | Type | Description |
| --- | --- | --- |
| **timezone** | string | the local timezone of the end user |
| **resourceLabelText** | string | (Optional) The text that will be displayed in the top corner of the day calendar |
| **timeslotInterval** | string | the interval of how many timeslots should be displayed (1 - 60) |
| **businessHours** | CalendarBusinessHours | will gray out timeslots outside the inputed data (see definition further down)  |
| **darkMode** | boolean | if the calendar should be in dark-mode |
| **class** | string | any css classes that should apply to the whole calendar |
| **design** | CalendarDesign | data for restyling the calendar to your needs (see definition further down) |

#### CalendarResource

| Name | Type | Description |
| --- | --- | --- |
| **id** | string | a unique string to identify the resource |
| **title** | string | the name to be displayed for the resource |
| **groupId** | string | (Optional) a unique string to connect the resource to a group |
| **metadata** | any | (Optional) any data needed for templates |

#### CalendarResourceGroup

| Name | Type | Description |
| --- | --- | --- |
| **id** | string | a unique string to identify the resource group |
| **title** | string | the name to be displayed for the resource group |
| **expaned** | boolean | (Optional) whether the group should start expanded or not |
| **metadata** | any | (Optional) any data needed for templates |

<br>

#### CalendarEvent

| Name | Type | Description |
| --- | --- | --- |
| **id** | string | a unique string to identify the event |
| **title** | string | the text to be displayed on the event |
| **resourceId** | string | the id of the resource the event should be displayed on |
| **startDate** | Date | a js date that marks the start of the event |
| **endDate** | Date | a js date that marks the end of the event |
| **class** | string | any css classes that should apply to the event |
| **color** | string | the background color the event should have |
| **metadata** | any | (Optional) any data needed for templates |

<br>

#### CalendarBusinessHours

| Name | Type | Description |
| --- | --- | --- |
| **[day : string]** | CalendarBusinessHourDay | a string key for the day in week formatted (ddd), (see definition below for start and end time) |

#### CalendarBusinessHourDay

| Name | Type | Description |
| --- | --- | --- |
| **startTime** | Timeslot | a string key for the first slot to be included, (xx:xx where x is a string digit [0-9]) |
| **endTime** | Timeslot | a string key for the last slot to be included, (xx:xx where x is a string digit [0-9]) |

<br>

#### CalendarDesign

| Name | Type | Description |
| --- | --- | --- |
| **dark** | CalendarDesignMode | to redesign dark mode, (see definition below) |
| **ligth** | CalendarDesignMode | to redesign ligth mode, (see definition below) |
| **icons.groupIcon.expanded** | string | icon of your choosing for when groups are expanded |
| **icons.groupIcon.collapsed** | string | icon of your choosing for when groups are collapsed |

<br>

#### CalendarDesignMode

| Name | Type | Description |
| --- | --- | --- |
| **backgroundColor** | string | background color of calendar |
| **textColor** | string | default text color |
| **gridColor** | string | the color of the calendar grid lines |
| **businessHourColor** | string | color that timeslots both in and out should have (see definition below) |
| **iconColor** | string | default icon color |
| **iconSize** | string | default icon size |
| **fontSize** | string | default font size |

#### CalendarBusinessHourColors

| Name | Type | Description |
| --- | --- | --- |
| **in** | string | the color timeslots inside the hours should have |
| **out** | string | the color timeslots outside the hours should have |

<br>


### Event Interfaces

#### CalendarEventClicked

| Name | Type | Description |
| --- | --- | --- |
| **resourceId** | string | the resource id that the clicked event is on |
| **eventId** | string | the event id of the event that was clicked on |


#### CalendarDragEvent

| Name | Type | Description |
| --- | --- | --- |
| **resourceId** | string | the new resource id that the event is on |
| **eventId** | string | the event id of the event that was dragged |
| **startDate** | Date | the new startDate where the event starts on |
| **endDate** | Date | the new endDate where the event ends on |
| **timezone** | string | the inputed timezone |


## @Inputs & @Outputs

#### NgxEpochxDayCalendar
```typescript
date				= input.required<Date>(); 
calendarSettings	= input.required<CalendarSettings>();
resources			= input.required<CalendarResource[]>();
events				= input<CalendarEvent[]>([]);
resourceGroups   = input<CalendarResourceGroup[]>([]);

resourceGroupToggled = output<Record<string, boolean>>(); //where string is the groupId
eventClicked         = ouput<CalendarEventClicked>();
eventDragged         = output<DragEvent>();


//setters
public set timeslotInterval(timeslotInterval: number);

```
<br>

#### NgxEpochxDateHeader
```typescript
// The date header take the following two way binded inputs

date = modal<Date>();

```

## Templates

#### EventTemplate
```html
<ng-template #eventTemplate let-event>
    <!-- Input template HTML here and use event to get the data inputted to each event -->
</ng-template>
```

#### ResourceTemplate
```html
<ng-template #resourceTemplate let-resource>
    <!-- Input template HTML here and use resource to get the data inputted to each resource -->
</ng-template>
```

#### ResourceGroupTemplate
```html
<ng-template #resourceGroupTemplate let-resourceGroup>
    <!-- Input template HTML here and use resourceGroup to get the data inputted to each resource -->
</ng-template>
```
