import { TimeSlot } from "./../types/"

export interface CalendarResource {
    id:             string,
    title:          string,
    groupId?:       string,
    metadata?:      any,
	availability?:	{
		enabled: boolean,
		maxSlots: number,
		fullClass?: string,
		freeClass?: string,
		removeSlots?: boolean,
	}
}

export interface CalendarResourceGroup {
    id:             string,
    title:          string,
    expanded?:      boolean,
    metadata?:      any,
}

export interface CalendarEvent {
    id:             string,
    title:          string,
    resourceId:     string,
    startDate:      Date,
    endDate:        Date,
	slots:			number,
    subTitle?:      string,
    class?:         string,
    color?:         string,
    metadata?:      any,
}

export interface CalendarBusinessHourColors {
    out:        string,
    in:         string,
}

export interface CalendarDesignMode {
    backgroundColor:    string,
    textColor:          string,
    gridColor:          string,
    businessHourColor:  CalendarBusinessHourColors,
    iconColor:          string,
    iconSize:           number,
    fontSize:           number,
}

export interface CalendarDesign {
    dark:       CalendarDesignMode,
    ligth:      CalendarDesignMode,
    icons: {
        groupIcon: {
            expanded:   string,
            collapsed:  string,
        }
    }
}

interface CalendarBusinessHourDay {
    startTime:      TimeSlot,
    endTime:        TimeSlot,
}

export interface CalendarBusinessHours {
    [day:string]:       CalendarBusinessHourDay,
}

export interface CalendarSettings {
    timezone:				string,
    locale:					string,
    resourceLabelText?:		string,
    timeslotInterval?:		number,
    timeslotLabelInterval?: number,
    businessHours?:			CalendarBusinessHours,
    darkMode?:				boolean,
    class?:					string,
    design?:				CalendarDesign,
}


export interface CalendarEventClicked {
    resourceId:     string,
    eventId:        string,
}


export interface CalendarDragEvent {
    resourceId:     string,
    eventId:        string,
    startDate:      Date,
    endDate:        Date,
    timezone:       string
}

