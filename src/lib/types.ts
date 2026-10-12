export type HourlyWeather = {
  time: string; // ISO, UTC
  temperature: number; // °C
  dewPoint: number; // °C
  humidity: number; // %
  cloudCover: number; // %
  windSpeed: number; // m/s
  precipitation: number; // mm
  precipitationProbability: number; // %
};

export type SeeingBlock = {
  time: string; // ISO, UTC
  value: number; // 7Timer! seeing scale 1–8
};

export type KpBlock = {
  time: string; // ISO, UTC, start of the 3-hour block
  kp: number;
};

export type Forecast = {
  zip: string;
  place: string;
  latitude: number;
  longitude: number;
  weather: HourlyWeather[] | null;
  seeing: SeeingBlock[] | null;
  kp: KpBlock[] | null;
};
