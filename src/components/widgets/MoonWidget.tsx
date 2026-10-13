import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { MoonAltitude, MoonState } from "@/lib/moon";
import MoonAltitudeChart from "./MoonAltitudeChart";
import Widget from "./Widget";

const SIZE = 120;
const R = 50;
const C = SIZE / 2;

/** Draws the lit part of the moon: a half circle on the lit side plus the terminator ellipse. */
const litPath = (angle: number) => {
  const waxing = angle < 180;
  const crescent = Math.cos((angle * Math.PI) / 180) > 0;
  const rx = R * Math.abs(Math.cos((angle * Math.PI) / 180));
  const edgeSweep = waxing ? 1 : 0;
  const terminatorSweep = waxing === crescent ? 0 : 1;
  return (
    `M ${C} ${C - R} A ${R} ${R} 0 0 ${edgeSweep} ${C} ${C + R} ` +
    `A ${rx} ${R} 0 0 ${terminatorSweep} ${C} ${C - R} Z`
  );
};

type MoonWidgetProps = {
  moon: MoonState;
  altitudes?: MoonAltitude[];
};

const MoonWidget = ({ moon, altitudes }: MoonWidgetProps) => {
  const theme = useTheme();

  return (
  <Widget title="Moon phase">
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, py: 1 }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`Moon ${moon.percentage}% full`}>
        <circle cx={C} cy={C} r={R} fill="#2b2b33" stroke={theme.palette.divider} />
        <path d={litPath(moon.angle)} fill="#f2eed8" />
      </svg>
      <Typography variant="h4">{moon.percentage}%</Typography>
    </Box>
    <Typography variant="caption" color="text.secondary">
      Height over the horizon, until 10:00
    </Typography>
    {altitudes ? (
      <MoonAltitudeChart altitudes={altitudes} />
    ) : (
      <Typography color="text.secondary">Enter a zip code to see the moon&apos;s height.</Typography>
    )}
  </Widget>
  );
};

export default MoonWidget;
