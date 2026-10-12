import type { HourlyWeather, KpBlock, SeeingBlock } from "@/lib/types";
import { FORECAST_HOURS } from "@/lib/time";
import { normalizeZip } from "@/lib/zip";

const CACHE_SECONDS = 600;
const HOUR = 3600 * 1000;
const WINDOW = FORECAST_HOURS * HOUR;

const getJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, { next: { revalidate: CACHE_SECONDS } });
  if (!response.ok) {
    throw new Error(`${url} responded ${response.status}`);
  }
  return response.json();
};

type ZipResponse = {
  places: { "place name": string; latitude: string; longitude: string }[];
};

type OpenMeteoResponse = {
  hourly: {
    time: string[];
    temperature_2m: number[];
    dew_point_2m: number[];
    relative_humidity_2m: number[];
    cloud_cover: number[];
    wind_speed_10m: number[];
    precipitation: number[];
    precipitation_probability: number[];
  };
};

type SevenTimerResponse = {
  init: string; // YYYYMMDDHH, UTC
  dataseries: { timepoint: number; seeing: number }[];
};

type NoaaKpRow = { time_tag: string; kp: number };

const getWeather = async (lat: number, lon: number, now: number): Promise<HourlyWeather[]> => {
  const { hourly } = await getJson<OpenMeteoResponse>(
    "https://api.open-meteo.com/v1/forecast" +
      `?latitude=${lat}&longitude=${lon}&timezone=GMT&wind_speed_unit=ms&forecast_hours=${FORECAST_HOURS + 2}` +
      "&hourly=temperature_2m,dew_point_2m,relative_humidity_2m,cloud_cover,wind_speed_10m,precipitation,precipitation_probability",
  );
  const currentHour = Math.floor(now / HOUR) * HOUR;
  return hourly.time
    .map((time, i) => ({
      time: new Date(`${time}:00Z`).toISOString(),
      temperature: hourly.temperature_2m[i],
      dewPoint: hourly.dew_point_2m[i],
      humidity: hourly.relative_humidity_2m[i],
      cloudCover: hourly.cloud_cover[i],
      windSpeed: hourly.wind_speed_10m[i],
      precipitation: hourly.precipitation[i],
      precipitationProbability: hourly.precipitation_probability[i],
    }))
    .filter((hour) => Date.parse(hour.time) >= currentHour)
    .slice(0, FORECAST_HOURS);
};

/** Keeps 3-hour blocks that overlap the forecast window. */
const inWindow = (time: number, now: number) => time > now - 3 * HOUR && time < now + WINDOW;

const getSeeing = async (lat: number, lon: number, now: number): Promise<SeeingBlock[]> => {
  const { init, dataseries } = await getJson<SevenTimerResponse>(
    `https://www.7timer.info/bin/astro.php?lon=${lon}&lat=${lat}&ac=0&unit=metric&output=json&tzshift=0`,
  );
  const start = Date.UTC(
    Number(init.slice(0, 4)),
    Number(init.slice(4, 6)) - 1,
    Number(init.slice(6, 8)),
    Number(init.slice(8, 10)),
  );
  return dataseries
    .map((point) => ({ time: start + point.timepoint * HOUR, value: point.seeing }))
    .filter((point) => inWindow(point.time, now))
    .map((point) => ({ time: new Date(point.time).toISOString(), value: point.value }));
};

const getKp = async (now: number): Promise<KpBlock[]> => {
  const rows = await getJson<NoaaKpRow[]>(
    "https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json",
  );
  return rows
    .map((row) => ({ time: Date.parse(`${row.time_tag}Z`), kp: row.kp }))
    .filter((row) => inWindow(row.time, now))
    .map((row) => ({ time: new Date(row.time).toISOString(), kp: row.kp }));
};

const valueOrNull = <T>(result: PromiseSettledResult<T>) => {
  if (result.status === "fulfilled") {
    return result.value;
  }
  console.error(result.reason);
  return null;
};

export async function GET(request: Request) {
  const zip = normalizeZip(new URL(request.url).searchParams.get("zip") ?? "");
  if (!zip) {
    return Response.json({ error: 'Zip code must be "XXX XX" or "XXXXX".' }, { status: 400 });
  }

  let place: ZipResponse["places"][number];
  try {
    const result = await getJson<ZipResponse>(`https://api.zippopotam.us/se/${zip}`);
    place = result.places[0];
  } catch {
    return Response.json({ error: `Unknown zip code ${zip}.` }, { status: 404 });
  }

  const latitude = Number(place.latitude);
  const longitude = Number(place.longitude);
  const now = Date.now();
  const [weather, seeing, kp] = await Promise.allSettled([
    getWeather(latitude, longitude, now),
    getSeeing(latitude, longitude, now),
    getKp(now),
  ]);

  return Response.json({
    zip,
    place: place["place name"],
    latitude,
    longitude,
    weather: valueOrNull(weather),
    seeing: valueOrNull(seeing),
    kp: valueOrNull(kp),
  });
}
