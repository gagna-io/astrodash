import { alpha, useTheme } from "@mui/material/styles";
import { getKpBands } from "@/lib/aurora";
import { formatAxisHour, formatHour, fullHourTicks, getForecastEnd } from "@/lib/time";
import { KpBlock } from "@/lib/types";
import HoverZones from "./HoverZones";
import Widget from "./Widget";
import { CHART_COLOR } from "./chartColor";

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
  const to = getForecastEnd(start).getTime();
  const ticks = fullHourTicks(from, to);
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
      return {
        x1: x(clamp(blockStart)),
        x2: x(clamp(blockStart + 3 * HOUR)),
        y: y(block.kp),
        label: `${formatHour(block.time)}–${formatHour(new Date(blockStart + 3 * HOUR).toISOString())} · Kp ${block.kp.toFixed(1)}`,
      };
    })
    .filter((step) => step.x2 > step.x1);
  const line = steps.map((step, i) => `${i === 0 ? "M" : "L"}${step.x1} ${step.y} H${step.x2}`).join(" ");
  const text = theme.palette.text.secondary;

  return (
    <Widget title="Aurora, Kp index until 10:00">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" role="img" aria-label="Kp index forecast, until 10:00">
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
        {ticks.map((tick) => (
          <text
            key={tick}
            x={x(tick)}
            y={HEIGHT - 4}
            fontSize={10}
            textAnchor={x(tick) > WIDTH - 12 ? "end" : "middle"}
            fill={text}
          >
            {formatAxisHour(tick)}
          </text>
        ))}
        <path d={line} fill="none" stroke={CHART_COLOR} strokeWidth={2} />
        <HoverZones zones={steps} top={PAD.top} bottom={HEIGHT - PAD.bottom} />
      </svg>
    </Widget>
  );
};

export default AuroraWidget;
