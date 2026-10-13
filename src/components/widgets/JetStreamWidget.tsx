import { alpha, useTheme } from "@mui/material/styles";
import { formatHour } from "@/lib/time";
import { HourlyWeather } from "@/lib/types";
import HoverZones, { zonesFromPoints } from "./HoverZones";
import Widget from "./Widget";
import { CHART_COLOR } from "./chartColor";

const WIDTH = 320;
const HEIGHT = 170;
const PAD = { left: 32, right: 8, top: 8, bottom: 20 };

/** Jet stream (250 hPa) wind speed line graph on a green/yellow/red background. */
const JetStreamWidget = ({ weather }: { weather: HourlyWeather[] }) => {
  const theme = useTheme();
  const max = Math.max(Math.ceil(Math.max(...weather.map((hour) => hour.jetStream)) / 10) * 10, 50);
  const slot = (WIDTH - PAD.left - PAD.right) / weather.length;
  const x = (i: number) => PAD.left + (i + 0.5) * slot;
  const y = (speed: number) => PAD.top + ((max - speed) / max) * (HEIGHT - PAD.top - PAD.bottom);
  const line = weather.map((hour, i) => `${i === 0 ? "M" : "L"}${x(i)} ${y(hour.jetStream)}`).join(" ");
  const text = theme.palette.text.secondary;
  const bands = [
    { from: 0, to: 20, color: theme.palette.success.main },
    { from: 20, to: 35, color: theme.palette.warning.main },
    { from: 35, to: max, color: theme.palette.error.main },
  ];

  return (
    <Widget title="Jet stream, m/s">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" role="img" aria-label="Jet stream wind speed, until 10:00">
        {bands.map((band) => (
          <rect
            key={band.from}
            x={PAD.left}
            y={y(band.to)}
            width={WIDTH - PAD.left - PAD.right}
            height={y(band.from) - y(band.to)}
            fill={alpha(band.color, 0.25)}
          />
        ))}
        {[0, 20, 35, max].map((tick) => (
          <text key={tick} x={PAD.left - 6} y={y(tick) + 4} fontSize={10} textAnchor="end" fill={text}>
            {tick}
          </text>
        ))}
        <path d={line} fill="none" stroke={CHART_COLOR} strokeWidth={2} />
        {weather.map((hour, i) => (
          <circle key={hour.time} cx={x(i)} cy={y(hour.jetStream)} r={3} fill={CHART_COLOR} />
        ))}
        {weather.map((hour, i) =>
          i % 3 === 0 ? (
            <text key={hour.time} x={x(i)} y={HEIGHT - 4} fontSize={10} textAnchor="middle" fill={text}>
              {formatHour(hour.time)}
            </text>
          ) : null,
        )}
        <HoverZones
          zones={zonesFromPoints(
            weather.map((hour, i) => ({ x: x(i), label: `${formatHour(hour.time)} · ${hour.jetStream.toFixed(1)} m/s` })),
            PAD.left,
            WIDTH - PAD.right,
          )}
          top={PAD.top}
          bottom={HEIGHT - PAD.bottom}
        />
      </svg>
    </Widget>
  );
};

export default JetStreamWidget;
