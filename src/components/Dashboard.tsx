"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { getMoonAltitudes, getMoonState } from "@/lib/moon";
import { Forecast } from "@/lib/types";
import { formatZip, normalizeZip } from "@/lib/zip";
import AuroraWidget from "./widgets/AuroraWidget";
import CloudWidget from "./widgets/CloudWidget";
import MoonWidget from "./widgets/MoonWidget";
import PrecipitationGraphWidget from "./widgets/PrecipitationGraphWidget";
import PrecipitationWidget from "./widgets/PrecipitationWidget";
import SeeingWidget from "./widgets/SeeingWidget";
import WeatherWidget from "./widgets/WeatherWidget";
import Widget from "./widgets/Widget";
import WindWidget from "./widgets/WindWidget";

const ZIP_KEY = "astrodash.zip";

const readZip = () => {
  try {
    return normalizeZip(localStorage.getItem(ZIP_KEY) ?? "");
  } catch {
    return null;
  }
};

const saveZip = (zip: string) => {
  try {
    localStorage.setItem(ZIP_KEY, zip);
  } catch {
    // Storage unavailable; the zip code just isn't remembered.
  }
};

type Result = { zip: string; forecast?: Forecast; error?: string };

const Unavailable = ({ title }: { title: string }) => (
  <Widget title={title}>
    <Typography color="text.secondary">Data unavailable right now.</Typography>
  </Widget>
);

const Dashboard = () => {
  const [loadedAt] = useState(() => new Date());
  const [moon] = useState(() => getMoonState(loadedAt));
  const [zip, setZip] = useState(readZip);
  const [input, setInput] = useState(() => (zip ? formatZip(zip) : ""));
  const [inputError, setInputError] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!zip) {
      return;
    }
    let cancelled = false;
    fetch(`/api/forecast?zip=${zip}`)
      .then(async (response) => {
        const body = await response.json();
        return response.ok
          ? { zip, forecast: body }
          : { zip, error: body.error };
      })
      .catch(() => ({ zip, error: "Could not load the forecast." }))
      .then((next: Result) => {
        if (!cancelled) {
          setResult(next);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [zip]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next = normalizeZip(input);
    setInputError(!next);
    if (next) {
      saveZip(next);
      setZip(next);
    }
  };

  const loading = zip !== null && result?.zip !== zip;
  const forecast = !loading ? result?.forecast : undefined;

  const altitudes = useMemo(
    () =>
      forecast
        ? getMoonAltitudes(forecast.latitude, forecast.longitude, loadedAt)
        : undefined,
    [forecast, loadedAt],
  );

  const widgets: ReactNode[] = [
    <MoonWidget key="moon" moon={moon} altitudes={altitudes} />,
  ];
  if (forecast) {
    const { weather, seeing, kp } = forecast;
    widgets.push(
      weather ? (
        <PrecipitationWidget key="rain" weather={weather} />
      ) : (
        <Unavailable key="rain" title="Rain / snow" />
      ),
      weather ? (
        <PrecipitationGraphWidget key="precipitation" weather={weather} />
      ) : (
        <Unavailable key="precipitation" title="Precipitation, mm" />
      ),
      weather ? (
        <WindWidget key="wind" weather={weather} />
      ) : (
        <Unavailable key="wind" title="Wind speeds" />
      ),
      weather ? (
        <CloudWidget key="cloud" weather={weather} />
      ) : (
        <Unavailable key="cloud" title="Cloud coverage, hourly" />
      ),
      seeing ? (
        <SeeingWidget key="seeing" seeing={seeing} />
      ) : (
        <Unavailable key="seeing" title="Seeing" />
      ),
      kp ? (
        <AuroraWidget key="aurora" kp={kp} start={loadedAt} latitude={forecast.latitude} />
      ) : (
        <Unavailable key="aurora" title="Aurora, Kp index" />
      ),
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", gap: 1, mb: 3, maxWidth: 360 }}
      >
        <TextField
          label="Zip code"
          placeholder="XXX XX"
          size="small"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          error={inputError}
          helperText={inputError ? 'Use "XXX XX" or "XXXXX"' : forecast?.place}
          slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 6 } }}
          sx={{ flex: 1 }}
        />
        <Button
          type="submit"
          variant="contained"
          sx={{ alignSelf: "flex-start", height: 40 }}
        >
          Show
        </Button>
      </Box>
      {loading && <CircularProgress sx={{ mb: 3 }} />}
      {!loading && result?.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {result.error}
        </Alert>
      )}
      <Grid container spacing={2}>
        {widgets.map((widget, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
            {widget}
          </Grid>
        ))}
        {forecast && (
          <Grid size={12}>
            {forecast.weather ? (
              <WeatherWidget weather={forecast.weather} />
            ) : (
              <Unavailable title="Weather report, 15 h" />
            )}
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard;
