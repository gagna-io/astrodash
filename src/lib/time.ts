/** How far ahead every forecast and graph looks, from page load. */
export const FORECAST_HOURS = 15;

const formatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Stockholm",
  hour: "2-digit",
  minute: "2-digit",
});

/** Formats an ISO time as local Swedish time, e.g. "22:00". */
export const formatHour = (iso: string) => formatter.format(new Date(iso));
