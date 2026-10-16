import { useTheme } from "@mui/material/styles";
import { MoonAltitude } from "@/lib/moon";
import { formatHour } from "@/lib/time";
import HoverZones, { zonesFromPoints } from "./HoverZones";
import { CHART_COLOR } from "./chartColor";

const WIDTH = 320;
const HEIGHT = 150;
const PAD = { left: 32, right: 8, top: 8, bottom: 20 };
const COMPASS = ["N", "E", "S", "W"];

/** Where the moon's azimuth passes due N, E, S or W: one label per crossing, at its interpolated point. */
const cardinalCrossings = (altitudes: MoonAltitude[]) => {
  const crossings: { index: number; label: string }[] = [];
  let previous = altitudes.at(0)?.azimuth ?? 0;
  altitudes.slice(1).forEach((point, i) => {
    // Unwrap so a step across north (e.g. 350° → 10°) counts as +20°, not −340°.
    let current = point.azimuth;
    while (current - previous > 180) current -= 360;
    while (previous - current > 180) current += 360;
    const low = Math.min(previous, current);
    const high = Math.max(previous, current);
    for (let k = Math.ceil(low / 90) * 90; k <= high && high > low; k += 90) {
      crossings.push({
        index: i + (k - previous) / (current - previous),
        label: COMPASS.at((((k / 90) % 4) + 4) % 4) ?? "N",
      });
    }
    previous = current;
  });
  return crossings;
};

/** Line chart of the moon's altitude, with the horizon at 0°. */
const MoonAltitudeChart = ({ altitudes }: { altitudes: MoonAltitude[] }) => {
  const theme = useTheme();
  const values = altitudes.map((point) => point.altitude);
  const max = Math.ceil(Math.max(...values, 10) / 10) * 10;
  const min = Math.floor(Math.min(...values, -10) / 10) * 10;
  const x = (i: number) => PAD.left + (i / (altitudes.length - 1)) * (WIDTH - PAD.left - PAD.right);
  const y = (altitude: number) => PAD.top + ((max - altitude) / (max - min)) * (HEIGHT - PAD.top - PAD.bottom);
  const line = altitudes.map((point, i) => `${i === 0 ? "M" : "L"}${x(i)} ${y(point.altitude)}`).join(" ");
  const text = theme.palette.text.secondary;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width="100%"
      role="img"
      aria-label="Moon height over the horizon, until 10:00"
    >
      <defs>
        <clipPath id="above-horizon">
          <rect x={0} y={0} width={WIDTH} height={y(0)} />
        </clipPath>
      </defs>
      {[max, 0, min].map((tick) => (
        <g key={tick}>
          <line
            x1={PAD.left}
            x2={WIDTH - PAD.right}
            y1={y(tick)}
            y2={y(tick)}
            stroke={tick === 0 ? theme.palette.text.primary : theme.palette.divider}
            strokeDasharray={tick === 0 ? undefined : "3 3"}
          />
          <text x={PAD.left - 4} y={y(tick) + 4} fontSize={10} textAnchor="end" fill={text}>
            {tick}°
          </text>
        </g>
      ))}
      <path d={line} fill="none" stroke={theme.palette.divider} strokeWidth={2} />
      <path d={line} fill="none" stroke={CHART_COLOR} strokeWidth={2} clipPath="url(#above-horizon)" />
      {altitudes.map((point, i) =>
        i % 6 === 0 ? (
          <text key={point.time} x={x(i)} y={HEIGHT - 4} fontSize={10} textAnchor="middle" fill={text}>
            {formatHour(point.time)}
          </text>
        ) : null,
      )}
      {cardinalCrossings(altitudes).map((crossing) => (
        <text
          key={`${crossing.label}-${crossing.index}`}
          x={x(crossing.index)}
          y={y(0) + 12}
          fontSize={10}
          fontWeight={600}
          textAnchor="middle"
          fill={text}
        >
          {crossing.label}
        </text>
      ))}
      <HoverZones
        zones={zonesFromPoints(
          altitudes.map((point, i) => ({
            x: x(i),
            label: `${formatHour(point.time)} · height ${point.altitude.toFixed(1)}° · azimuth ${Math.round(point.azimuth)}°`,
          })),
          PAD.left,
          WIDTH - PAD.right,
        )}
        top={PAD.top}
        bottom={HEIGHT - PAD.bottom}
      />
    </svg>
  );
};

export default MoonAltitudeChart;
