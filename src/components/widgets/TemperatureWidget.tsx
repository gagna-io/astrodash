import { alpha, useTheme } from "@mui/material/styles";
import { formatAxisHour, formatHour } from "@/lib/time";
import { HourlyWeather } from "@/lib/types";
import { CHART_COLOR } from "./chartColor";
import HoverZones, { zonesFromPoints } from "./HoverZones";
import Widget from "./Widget";

const WIDTH = 320;
const HEIGHT = 170;
const PAD = { left: 32, right: 8, top: 8, bottom: 20 };

/** Temperature (solid) and dew point (dashed); red below the dew point, green above. */
const TemperatureWidget = ({ weather }: { weather: HourlyWeather[] }) => {
  const theme = useTheme();
  const values = weather.flatMap((hour) => [hour.temperature, hour.dewPoint]);
  const max = Math.ceil(Math.max(...values)) + 2;
  const min = Math.floor(Math.min(...values)) - 2;
  const slot = (WIDTH - PAD.left - PAD.right) / weather.length;
  const x = (i: number) => PAD.left + (i + 0.5) * slot;
  const y = (celsius: number) => PAD.top + ((max - celsius) / (max - min)) * (HEIGHT - PAD.top - PAD.bottom);
  const path = (value: (hour: HourlyWeather) => number) =>
    weather.map((hour, i) => `${i === 0 ? "M" : "L"}${x(i)} ${y(value(hour))}`).join(" ");
  const dewLine = path((hour) => hour.dewPoint);
  const left = PAD.left;
  const right = WIDTH - PAD.right;
  const firstDew = y(weather.at(0)?.dewPoint ?? 0);
  const lastDew = y(weather.at(-1)?.dewPoint ?? 0);
  // Areas run edge to edge; the dew line is held flat before the first and after the last hour.
  const belowDew = `M${left} ${y(min)} L${left} ${firstDew} ${dewLine.replace("M", "L")} L${right} ${lastDew} L${right} ${y(min)} Z`;
  const aboveDew = `M${left} ${y(max)} L${left} ${firstDew} ${dewLine.replace("M", "L")} L${right} ${lastDew} L${right} ${y(max)} Z`;
  const ticks = [min, Math.round((min + max) / 2), max];
  const text = theme.palette.text.secondary;

  return (
    <Widget title="Temperature and dew point, °C">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" role="img" aria-label="Temperature and dew point until 10:00">
        <path d={aboveDew} fill={alpha(theme.palette.success.light, 0.3)} />
        <path d={belowDew} fill={alpha(theme.palette.error.main, 0.25)} />
        {ticks.map((tick) => (
          <text key={tick} x={PAD.left - 6} y={y(tick) + 4} fontSize={10} textAnchor="end" fill={text}>
            {tick}°
          </text>
        ))}
        <path d={path((hour) => hour.temperature)} fill="none" stroke={CHART_COLOR} strokeWidth={2} />
        <path d={dewLine} fill="none" stroke={CHART_COLOR} strokeWidth={2} strokeDasharray="4 3" />
        {weather.map((hour, i) =>
          i % 3 === 0 ? (
            <text key={hour.time} x={x(i)} y={HEIGHT - 4} fontSize={10} textAnchor="middle" fill={text}>
              {formatAxisHour(hour.time)}
            </text>
          ) : null,
        )}
        <g fontSize={10} fill={text}>
          <line x1={right - 118} x2={right - 104} y1={PAD.top + 8} y2={PAD.top + 8} stroke={CHART_COLOR} strokeWidth={2} />
          <text x={right - 100} y={PAD.top + 11}>Temp</text>
          <line
            x1={right - 62}
            x2={right - 48}
            y1={PAD.top + 8}
            y2={PAD.top + 8}
            stroke={CHART_COLOR}
            strokeWidth={2}
            strokeDasharray="4 3"
          />
          <text x={right - 44} y={PAD.top + 11}>Dew point</text>
        </g>
        <HoverZones
          zones={zonesFromPoints(
            weather.map((hour, i) => ({
              x: x(i),
              label: `${formatHour(hour.time)} · temp ${hour.temperature.toFixed(1)}° · dew point ${hour.dewPoint.toFixed(1)}°`,
            })),
            left,
            right,
          )}
          top={PAD.top}
          bottom={HEIGHT - PAD.bottom}
        />
      </svg>
    </Widget>
  );
};

export default TemperatureWidget;
