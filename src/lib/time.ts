const TIME_ZONE = "Europe/Stockholm";
const END_HOUR = 10;

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  hourCycle: "h23",
});

/** Swedish wall-clock parts of a time. */
const swedishParts = (date: Date) => {
  const parts = Object.fromEntries(
    partsFormatter.formatToParts(date).map((part) => [part.type, Number(part.value)]),
  );
  return { year: parts.year, month: parts.month, day: parts.day, hour: parts.hour, minute: parts.minute };
};

/** Milliseconds Swedish time is ahead of UTC at a given time (1 or 2 hours). */
const swedishOffset = (date: Date) => {
  const p = swedishParts(date);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - Math.floor(date.getTime() / 60000) * 60000;
};

/** End of the forecast window: 10:00 Swedish time on the day after `start`. Every widget shows data up to it. */
export const getForecastEnd = (start: Date) => {
  const p = swedishParts(start);
  const wallClock = Date.UTC(p.year, p.month - 1, p.day + 1, END_HOUR);
  return new Date(wallClock - swedishOffset(new Date(wallClock)));
};

const formatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

const HOUR_MS = 3600 * 1000;

/** Axis label: the Swedish hour only, e.g. "08". */
export const formatAxisHour = (time: string | number) => formatHour(new Date(time).toISOString()).slice(0, 2);

/** Full hours between `from` and `to`, every `step` hours, starting at the first full hour. */
export const fullHourTicks = (from: number, to: number, step = 3) => {
  const ticks: number[] = [];
  for (let tick = Math.ceil(from / HOUR_MS) * HOUR_MS; tick <= to; tick += step * HOUR_MS) {
    ticks.push(tick);
  }
  return ticks;
};

/** Formats an ISO time as local Swedish time, e.g. "22:00". */
export const formatHour = (iso: string) => formatter.format(new Date(iso));
