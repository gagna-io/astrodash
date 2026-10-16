import { Body, Equator, Horizon, Illumination, Observer, SearchAltitude, SearchRiseSet } from "astronomy-engine";
import { seeingToPickering } from "./seeing";
import { Forecast } from "./types";

const weekdayFormatter = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "Europe/Stockholm" });

const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;
const ASTRONOMICAL_TWILIGHT = -18;

export type NightLevel = "excellent" | "good" | "bad" | "none";

export type NightSummary = {
  level: NightLevel;
  reasons: string[];
  weekday: string; // e.g. "Mon", the evening the night starts
  night?: { start: Date; end: Date };
  sunset?: Date;
  sunrise?: Date;
};

type Night = { start: Date; end: Date };

const altitude = (body: Body, observer: Observer, date: Date) => {
  const { ra, dec } = Equator(body, date, observer, true, true);
  return Horizon(date, observer, ra, dec, "normal").altitude;
};

/** The current or next astronomical night (sun below −18°), or null if there is none within a day. */
export const getAstronomicalNight = (observer: Observer, from: Date) => {
  const inNight = altitude(Body.Sun, observer, from) < ASTRONOMICAL_TWILIGHT;
  const start = inNight ? from : SearchAltitude(Body.Sun, observer, -1, from, 1, ASTRONOMICAL_TWILIGHT)?.date;
  if (!start) {
    return null;
  }
  const end = SearchAltitude(Body.Sun, observer, +1, start, 1, ASTRONOMICAL_TWILIGHT)?.date;
  return end ? { start, end } : null;
};

/** Rates one astronomical night for astrophotography from the outlook data. Red beats yellow beats green. */
const rateNight = (forecast: Forecast, observer: Observer, night: Night): Pick<NightSummary, "level" | "reasons"> => {
  const start = night.start.getTime();
  const end = night.end.getTime();
  const overlaps = (time: string, length: number) => Date.parse(time) + length > start && Date.parse(time) < end;
  const { weather, seeing: seeingBlocks, kp: kpBlocks } = forecast.outlook;

  const hours = (weather ?? []).filter((hour) => overlaps(hour.time, HOUR));
  const kp = (kpBlocks ?? []).filter((block) => overlaps(block.time, 3 * HOUR));
  const seeing = (seeingBlocks ?? []).filter((block) => overlaps(block.time, 3 * HOUR));
  const maxKp = Math.max(0, ...kp.map((block) => block.kp));
  const maxWind = Math.max(0, ...hours.map((hour) => hour.windSpeed));
  const moonPercentage = Illumination(Body.Moon, new Date((start + end) / 2)).phase_fraction * 100;

  const moonUp = Array.from({ length: Math.floor((end - start) / (15 * 60 * 1000)) + 1 }, (_, i) =>
    altitude(Body.Moon, observer, new Date(start + i * 15 * 60 * 1000)),
  ).some((moonAltitude) => moonAltitude > 0);

  const bad: string[] = [];
  if (hours.some((hour) => hour.precipitation > 0)) bad.push("Rain");
  if (hours.length > 0 && hours.every((hour) => hour.cloudCover === 100)) bad.push("Cloudy");
  if (maxKp >= 6) bad.push("Aurora");
  if (maxWind > 15) bad.push("Winds");
  if (bad.length > 0) {
    return { level: "bad", reasons: bad };
  }

  const good: string[] = [];
  if (hours.some((hour) => hour.cloudCover > 0)) good.push("Partial cloudy");
  if (maxKp >= 5) good.push("Risk of aurora borealis");
  if (moonPercentage >= 50 && moonUp) good.push("Moon");
  if (seeing.some((block) => seeingToPickering(block.value) <= 6)) good.push("Seeing");
  if (maxWind >= 10) good.push("Winds");
  // Forecast dew point never exceeds temperature, so reaching it (100% humidity) is the fog signal.
  if (hours.some((hour) => hour.dewPoint >= hour.temperature)) good.push("Fog / mist");
  if (good.length > 0) {
    return { level: "good", reasons: good };
  }

  return { level: "excellent", reasons: [] };
};

/** Summaries for the upcoming `count` nights, starting with the current or next one. */
export const summarizeNights = (forecast: Forecast, from: Date, count = 3): NightSummary[] => {
  const observer = new Observer(forecast.latitude, forecast.longitude, 0);
  const summaries: NightSummary[] = [];
  let searchFrom = from;
  for (let k = 0; k < count; k++) {
    const night = getAstronomicalNight(observer, searchFrom);
    if (!night) {
      // No astronomical night (light summer nights): still report sunset and sunrise for that evening.
      const sunset = SearchRiseSet(Body.Sun, observer, -1, searchFrom, 1)?.date;
      const sunrise = sunset && SearchRiseSet(Body.Sun, observer, +1, sunset, 1)?.date;
      summaries.push({
        level: "none",
        reasons: [],
        weekday: weekdayFormatter.format(sunset ?? searchFrom),
        sunset,
        sunrise,
      });
      searchFrom = new Date((sunrise ?? searchFrom).getTime() + (sunrise ? HOUR : DAY));
      continue;
    }
    summaries.push({
      ...rateNight(forecast, observer, night),
      weekday: weekdayFormatter.format(night.start),
      night,
      sunset: SearchRiseSet(Body.Sun, observer, -1, new Date(night.start.getTime() - 12 * HOUR), 1)?.date,
      sunrise: SearchRiseSet(Body.Sun, observer, +1, night.end, 1)?.date,
    });
    searchFrom = new Date(night.end.getTime() + HOUR);
  }
  return summaries;
};
