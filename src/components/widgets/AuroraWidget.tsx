import { alpha, useTheme } from "@mui/material/styles";
import { getKpBands } from "@/lib/aurora";
import { FORECAST_HOURS, formatHour } from "@/lib/time";
import { KpBlock } from "@/lib/types";
import Widget from "./Widget";

const WIDTH = 320;
const HEIGHT = 170;
const PAD = { left: 24, right: 8, top: 8, bottom: 20 };
const HOUR = 3600 * 1000;
const KP_MAX = 9;

type AuroraWidgetProps = {
  kp: KpBlock[];
  start: Date;
  latitude: number;
};

/** Step graph of the Kp forecast over the forecast window, on a green/yellow/red probability background for the latitude. */
const AuroraWidget = ({ kp, start, latitude }: AuroraWidgetProps) => {
  const theme = useTheme();
  const from = start.getTime();
  const to = from + FORECAST_HOURS * HOUR;
  const x = (time: number) => PAD.left + ((time - from) / (to - from)) * (WIDTH - PAD.left - PAD.right);
  const y = (value: number) => PAD.top + ((KP_MAX - value) / KP_MAX) * (HEIGHT - PAD.top - PAD.bottom);
  const clamp = (time: number) => Math.min(Math.max(time, from), to);

  const { low, medium, high } = getKpBands(latitude);
  const bands = [
    { ...low, color: theme.palette.success.main },
    { ...medium, color: theme.palette.warning.main },
    { ...high, color: theme.palette.error.main },
  ].filter((band) => band.to > band.from);
  const steps = kp
    .map((block) => {
      const blockStart = Date.parse(block.time);
      return { x1: x(clamp(blockStart)), x2: x(clamp(blockStart + 3 * HOUR)), y: y(block.kp) };
    })
    .filter((step) => step.x2 > step.x1);
  const line = steps.map((step, i) => `${i === 0 ? "M" : "L"}${step.x1} ${step.y} H${step.x2}`).join(" ");
  const text = theme.palette.text.secondary;

  return (
    <Widget title="Aurora, Kp index next 15 h">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" role="img" aria-label="Kp index forecast, next 15 hours">
        {bands.map((band) => (
          <rect
            key={band.color}
            x={PAD.left}
            y={y(band.to)}
            width={WIDTH - PAD.left - PAD.right}
            height={y(band.from) - y(band.to)}
            fill={alpha(band.color, 0.25)}
          />
        ))}
        {[0, 3, 6, 9].map((tick) => (
          <text key={tick} x={PAD.left - 6} y={y(tick) + 4} fontSize={10} textAnchor="end" fill={text}>
            {tick}
          </text>
        ))}
        {[0, 3, 6, 9, 12, 15].map((hours) => (
          <text
            key={hours}
            x={x(from + hours * HOUR)}
            y={HEIGHT - 4}
            fontSize={10}
            textAnchor={hours === 0 ? "start" : hours === FORECAST_HOURS ? "end" : "middle"}
            fill={text}
          >
            {formatHour(new Date(from + hours * HOUR).toISOString())}
          </text>
        ))}
        <path d={line} fill="none" stroke={theme.palette.text.primary} strokeWidth={2} />
      </svg>
    </Widget>
  );
};

export default AuroraWidget;
