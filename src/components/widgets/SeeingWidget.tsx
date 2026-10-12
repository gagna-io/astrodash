import { useTheme } from "@mui/material/styles";
import { seeingToArcsec, seeingToPickering } from "@/lib/seeing";
import { formatHour } from "@/lib/time";
import { SeeingBlock } from "@/lib/types";
import Widget from "./Widget";

const WIDTH = 360;
const HEIGHT = 200;
const PAD = { left: 24, right: 60, top: 10, bottom: 20 };
const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8];

/** Seeing graph: Pickering scale on the left axis, arcseconds on the right, good seeing at the top. */
const SeeingWidget = ({ seeing }: { seeing: SeeingBlock[] }) => {
  const theme = useTheme();
  const times = seeing.map((block) => Date.parse(block.time));
  const from = Math.min(...times);
  const to = Math.max(...times);
  const x = (time: number) => PAD.left + ((time - from) / Math.max(to - from, 1)) * (WIDTH - PAD.left - PAD.right);
  const y = (value: number) => PAD.top + ((value - 1) / 7) * (HEIGHT - PAD.top - PAD.bottom);
  const line = seeing.map((block, i) => `${i === 0 ? "M" : "L"}${x(times.at(i) ?? 0)} ${y(block.value)}`).join(" ");
  const text = theme.palette.text.secondary;

  return (
    <Widget title="Seeing">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" role="img" aria-label="Seeing forecast, next 24 hours">
        {LEVELS.map((level) => (
          <g key={level}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={y(level)}
              y2={y(level)}
              stroke={theme.palette.divider}
              strokeDasharray="3 3"
            />
            <text x={PAD.left - 6} y={y(level) + 3} fontSize={9} textAnchor="end" fill={text}>
              {seeingToPickering(level)}
            </text>
            <text x={WIDTH - PAD.right + 6} y={y(level) + 3} fontSize={9} fill={text}>
              {seeingToArcsec(level)}
            </text>
          </g>
        ))}
        <path d={line} fill="none" stroke={theme.palette.primary.main} strokeWidth={2} />
        {seeing.map((block, i) => (
          <circle key={block.time} cx={x(times.at(i) ?? 0)} cy={y(block.value)} r={3} fill={theme.palette.primary.main} />
        ))}
        {seeing.map((block, i) =>
          i % 2 === 0 ? (
            <text
              key={block.time}
              x={x(times.at(i) ?? 0)}
              y={HEIGHT - 4}
              fontSize={10}
              textAnchor={i === 0 ? "start" : i === seeing.length - 1 ? "end" : "middle"}
              fill={text}
            >
              {formatHour(block.time)}
            </text>
          ) : null,
        )}
      </svg>
    </Widget>
  );
};

export default SeeingWidget;
