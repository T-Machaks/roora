const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Africa/Harare",
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Africa/Harare",
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
