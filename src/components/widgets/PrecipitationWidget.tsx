import Typography from "@mui/material/Typography";
import { HourlyWeather } from "@/lib/types";
import Widget from "./Widget";

const PrecipitationWidget = ({ weather }: { weather: HourlyWeather[] }) => {
  const max = Math.max(...weather.map((hour) => hour.precipitationProbability));
  return (
    <Widget title="Rain / snow">
      <Typography variant="h3" sx={{ py: 2 }}>
        {max}%
      </Typography>
      <Typography color="text.secondary">Highest probability in the next 24 hours</Typography>
    </Widget>
  );
};

export default PrecipitationWidget;
