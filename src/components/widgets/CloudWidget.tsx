import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { formatHour } from "@/lib/time";
import { HourlyWeather } from "@/lib/types";
import Widget from "./Widget";

const CloudWidget = ({ weather }: { weather: HourlyWeather[] }) => (
  <Widget title="Cloud coverage, hourly">
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: "2px", height: 140, pt: 2 }}>
      {weather.map((hour) => (
        <Tooltip key={hour.time} title={`${formatHour(hour.time)}: ${hour.cloudCover}%`}>
          <Box
            sx={{
              flex: 1,
              height: `${Math.max(hour.cloudCover, 2)}%`,
              bgcolor: "primary.light",
              borderRadius: "2px 2px 0 0",
            }}
          />
        </Tooltip>
      ))}
    </Box>
    <Box sx={{ display: "flex", gap: "2px" }}>
      {weather.map((hour, i) => (
        <Typography key={hour.time} variant="caption" color="text.secondary" sx={{ flex: 1, textAlign: "center" }}>
          {i % 3 === 0 ? formatHour(hour.time).slice(0, 2) : ""}
        </Typography>
      ))}
    </Box>
  </Widget>
);

export default CloudWidget;
