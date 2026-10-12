import Tooltip from "@mui/material/Tooltip";

export type HoverZone = {
  x1: number;
  x2: number;
  label: string;
};

/** Splits the x range between neighbouring points, so each point owns the strip nearest to it. */
export const zonesFromPoints = (points: { x: number; label: string }[], left: number, right: number) =>
  points.map((point, i) => ({
    x1: i === 0 ? left : (points[i - 1].x + point.x) / 2,
    x2: i === points.length - 1 ? right : (point.x + points[i + 1].x) / 2,
    label: point.label,
  }));

type HoverZonesProps = {
  zones: HoverZone[];
  top: number;
  bottom: number;
};

/** Transparent vertical strips over a graph that show the x and y values in a tooltip on hover. */
const HoverZones = ({ zones, top, bottom }: HoverZonesProps) => (
  <g>
    {zones.map((zone) => (
      <Tooltip key={`${zone.x1}-${zone.label}`} title={zone.label} followCursor>
        <rect x={zone.x1} y={top} width={Math.max(zone.x2 - zone.x1, 0)} height={bottom - top} fill="transparent" />
      </Tooltip>
    ))}
  </g>
);

export default HoverZones;
