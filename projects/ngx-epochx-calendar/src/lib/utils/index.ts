import { DateTime } from "luxon"
import { TimeSlot } from "../types/index"

/**
 * Converts a date to a TimeSlot type
 *
 * @param date - the time you want to convert
 *
 * @author Grimfilerino
*/
export function convertDateToTimeslot(date: Date): TimeSlot {
    let timeslot = DateTime.fromJSDate(date).toFormat("HH:mm") as TimeSlot;
    return timeslot;
}


/**
 * Converts a TimeSlot to a date
 *
 * @param timeslot - the timeslot you want to convert to date
 *
 * @author Grimfilerino
*/
export function convertTimeSlotToDate(timeslot: TimeSlot, day: string): Date {
    let date: Date = DateTime.fromISO(`${day}T${timeslot}`).toJSDate();
    return date;
}
