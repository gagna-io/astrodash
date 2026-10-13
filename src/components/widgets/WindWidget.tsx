import Typography from "@mui/material/Typography";
import { HourlyWeather } from "@/lib/types";
import Widget from "./Widget";

const WindWidget = ({ weather }: { weather: HourlyWeather[] }) => {
  const speeds = weather.map((hour) => hour.windSpeed);
  return (
    <Widget title="Wind speeds">
      <Typography variant="h3" sx={{ py: 2 }}>
        {Math.round(Math.min(...speeds))}m/s | {Math.round(Math.max(...speeds))}m/s
      </Typography>
      <Typography color="text.secondary">Min | max until 10:00</Typography>
    </Widget>
  );
};

export default WindWidget;
