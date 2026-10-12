import { useTheme } from "@mui/material/styles";
import { formatHour } from "@/lib/time";
import { HourlyWeather } from "@/lib/types";
import Widget from "./Widget";

const WIDTH = 320;
const HEIGHT = 170;
const PAD = { left: 32, right: 8, top: 8, bottom: 20 };

/** Hourly precipitation line graph in mm; a flat line at 0 when it stays dry. */
const PrecipitationGraphWidget = ({ weather }: { weather: HourlyWeather[] }) => {
  const theme = useTheme();
  const max = Math.max(Math.ceil(Math.max(...weather.map((hour) => hour.precipitation))), 1);
  const slot = (WIDTH - PAD.left - PAD.right) / weather.length;
  const x = (i: number) => PAD.left + (i + 0.5) * slot;
  const y = (mm: number) => PAD.top + ((max - mm) / max) * (HEIGHT - PAD.top - PAD.bottom);
  const line = weather.map((hour, i) => `${i === 0 ? "M" : "L"}${x(i)} ${y(hour.precipitation)}`).join(" ");
  const text = theme.palette.text.secondary;

  return (
    <Widget title="Precipitation, mm">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" role="img" aria-label="Hourly precipitation in mm">
        {[0, max / 2, max].map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke={theme.palette.divider}
              strokeDasharray={tick === 0 ? undefined : "3 3"}
            />
            <text x={PAD.left - 6} y={y(tick) + 4} fontSize={10} textAnchor="end" fill={text}>
              {tick}
            </text>
          </g>
        ))}
        <path d={line} fill="none" stroke={theme.palette.info.main} strokeWidth={2} />
        {weather.map((hour, i) => (
          <circle key={hour.time} cx={x(i)} cy={y(hour.precipitation)} r={3} fill={theme.palette.info.main}>
            <title>{`${formatHour(hour.time)}: ${hour.precipitation} mm`}</title>
          </circle>
        ))}
        {weather.map((hour, i) =>
          i % 3 === 0 ? (
            <text
              key={hour.time}
              x={x(i)}
              y={HEIGHT - 4}
              fontSize={10}
              textAnchor="middle"
              fill={text}
            >
              {formatHour(hour.time)}
            </text>
          ) : null,
        )}
      </svg>
    </Widget>
  );
};

export default PrecipitationGraphWidget;
