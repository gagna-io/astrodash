import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { formatHour } from "@/lib/time";
import { HourlyWeather } from "@/lib/types";
import Widget from "./Widget";

const COLUMNS = ["Time", "Temp °C", "Dew °C", "Hum %", "Cloud %", "Wind m/s", "Prec mm"];

const WeatherWidget = ({ weather }: { weather: HourlyWeather[] }) => (
  <Widget title="Weather report until 10:00">
    <TableContainer sx={{ maxHeight: 320 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {COLUMNS.map((column) => (
              <TableCell key={column} sx={{ whiteSpace: "nowrap", px: 1 }}>
                {column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {weather.map((hour) => (
            <TableRow key={hour.time}>
              {[
                formatHour(hour.time),
                Math.round(hour.temperature),
                Math.round(hour.dewPoint),
                hour.humidity,
                hour.cloudCover,
                hour.windSpeed.toFixed(1),
                hour.precipitation.toFixed(1),
              ].map((value, i) => (
                <TableCell key={COLUMNS.at(i)} sx={{ px: 1 }}>
                  {value}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Widget>
);

export default WeatherWidget;
