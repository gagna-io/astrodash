import { FORECAST_HOURS } from "./time";
import { Body, Equator, Horizon, Illumination, MoonPhase, Observer } from "astronomy-engine";

export type MoonState = {
  angle: number; // 0 new, 90 first quarter, 180 full, 270 last quarter
  percentage: number; // 0 new moon, 100 full moon
};

export const getMoonState = (date: Date): MoonState => ({
  angle: MoonPhase(date),
  percentage: Math.round(Illumination(Body.Moon, date).phase_fraction * 100),
});

export type MoonAltitude = {
  time: string; // ISO, UTC
  altitude: number; // degrees above the horizon, negative below
};

const STEP_MINUTES = 30;

/** Moon altitude every 30 minutes for the forecast hours from `start`, seen from the given location. */
export const getMoonAltitudes = (latitude: number, longitude: number, start: Date): MoonAltitude[] => {
  const observer = new Observer(latitude, longitude, 0);
  return Array.from({ length: (FORECAST_HOURS * 60) / STEP_MINUTES + 1 }, (_, i) => {
    const date = new Date(start.getTime() + i * STEP_MINUTES * 60 * 1000);
    const { ra, dec } = Equator(Body.Moon, date, observer, true, true);
    return {
      time: date.toISOString(),
      altitude: Horizon(date, observer, ra, dec, "normal").altitude,
    };
  });
};
