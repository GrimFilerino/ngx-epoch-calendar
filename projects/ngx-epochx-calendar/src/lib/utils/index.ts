import { DateTime } from "luxon"
import { TimeSlot } from "../types/index"

/**
 * @summary Converts a date to a TimeSlot type
 *
 * @param date - the time you want to convert
 *
 * @returns a timeslot from the date
 *
 * @author Grimfilerino
*/
export function convertDateToTimeslot(date: Date): TimeSlot {
    let timeslot = DateTime.fromJSDate(date).toFormat("HH:mm") as TimeSlot;
    return timeslot;
}


/**
 * @summary Converts a TimeSlot to a date
 *
 * @param timeslot - the timeslot you want to convert to date
 *
 * @returns a date
 *
 * @author Grimfilerino
*/
export function convertTimeSlotToDate(timeslot: TimeSlot, day: string): Date {
    let date: Date = DateTime.fromISO(`${day}T${timeslot}`).toJSDate();
    return date;
}

let padTime = (number: number): string => {
    if (number == 0) {
        return '00';
    }
    return number < 10 ? `0${number}` : `${number}`;
};

/**
 *
 *	@summary Adds a duration to a timeslot
 *	
 *	@param duration - duration in minutes
 *	@param time - the timeslot to add to
 *	
 *	@returns a new timeslot
 *
 *	@author Grimfilerino
 */
export function addDurationToTimeslot(duration: number, time: TimeSlot): TimeSlot {
	const [startHour, startMinute] = time.split(':').map(Number);
	let totalMinutes = startHour*60 + startMinute;

	totalMinutes += duration;

	let hour = Math.floor(totalMinutes / 60);
	let minutes = totalMinutes % 60;

	return `${padTime(hour)}:${padTime(minutes)}` as TimeSlot;
}
