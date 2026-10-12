const formatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Stockholm",
  hour: "2-digit",
  minute: "2-digit",
});

/** Formats an ISO time as local Swedish time, e.g. "22:00". */
export const formatHour = (iso: string) => formatter.format(new Date(iso));
