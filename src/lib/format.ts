/*
 * All event times are treated as "wall clock" values with no timezone
 * conversion: the numeric components stored in the DB (as a UTC Date
 * under the hood) are exactly the Harare local time that was typed in,
 * and are displayed back verbatim regardless of the viewer's browser
 * timezone. This avoids datetime-local's browser-timezone footgun for a
 * single-timezone event app. See parseWallClock / toWallClockInputValue.
 */

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "UTC",
});

export function formatEventDate(date: Date) {
  return dateFormatter.format(date);
}

export function formatEventTime(date: Date) {
  return timeFormatter.format(date);
}

export function formatTimeRange(start: Date, end: Date | null) {
  if (!end) return formatEventTime(start);
  return `${formatEventTime(start)} – ${formatEventTime(end)}`;
}

export function daysUntil(date: Date) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((date.getTime() - Date.now()) / msPerDay);
}

/** Parse a <input type="datetime-local"> value ("YYYY-MM-DDTHH:mm") as a
 * literal wall-clock time, ignoring the browser's local timezone. */
export function parseWallClock(value: string): Date {
  return new Date(`${value}:00.000Z`);
}

/** Format a Date back into a <input type="datetime-local"> default value. */
export function toWallClockInputValue(date: Date): string {
  return date.toISOString().slice(0, 16);
}
