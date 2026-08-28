import { Pipe, PipeTransform } from "@angular/core";
import { DateTime } from "luxon";

@Pipe({
    name: 'formatTimeslot',
    standalone: true 
})
export class FormatTimeSlotPipe implements PipeTransform {
    constructor() {}

	/**
	*	@summary Formats a timeslot to locale (24-hour or 12-hour)
	*	@param time timeslost (xx:xx) format
	*	@param locale inputed locale 
	*	
	*	@returns formatted timeslot to locale
	*
	*	@author Grimfilerino
	* */
    transform(time: string, locale: string): string {
        return DateTime.fromFormat(time, "HH:mm", { locale }).toFormat("HH:mm");
    }
}
