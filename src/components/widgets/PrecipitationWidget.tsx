import Typography from "@mui/material/Typography";
import { HourlyWeather } from "@/lib/types";
import Widget from "./Widget";

const PrecipitationWidget = ({ weather }: { weather: HourlyWeather[] }) => {
  const total = weather.reduce((sum, hour) => sum + hour.precipitation, 0);
  return (
    <Widget title="Rain / snow">
      <Typography variant="h3" sx={{ py: 2 }}>
        {total.toFixed(1)} mm
      </Typography>
      <Typography color="text.secondary">Total in the next 15 hours</Typography>
    </Widget>
  );
};

export default PrecipitationWidget;
