"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { getMoonAltitudes, getMoonState } from "@/lib/moon";
import { Forecast } from "@/lib/types";
import { formatZip, normalizeZip } from "@/lib/zip";
import SortableItem from "./SortableItem";
import AuroraWidget from "./widgets/AuroraWidget";
import CloudWidget from "./widgets/CloudWidget";
import JetStreamWidget from "./widgets/JetStreamWidget";
import MoonWidget from "./widgets/MoonWidget";
import PrecipitationGraphWidget from "./widgets/PrecipitationGraphWidget";
import PrecipitationWidget from "./widgets/PrecipitationWidget";
import SeeingWidget from "./widgets/SeeingWidget";
import WeatherWidget from "./widgets/WeatherWidget";
import Widget from "./widgets/Widget";
import WindWidget from "./widgets/WindWidget";

const ZIP_KEY = "astrodash.zip";

const DEFAULT_ORDER = ["moon", "rain", "precipitation", "wind", "cloud", "seeing", "aurora", "jetstream", "weather"];
const FULL_WIDTH = new Set(["weather"]);
const ORDER_KEY = "astrodash.order";

/** Saved widget order; unknown ids are dropped and new widgets are appended. */
const readOrder = () => {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(ORDER_KEY) ?? "[]");
    const known = Array.isArray(saved) ? saved.filter((id) => DEFAULT_ORDER.includes(id)) : [];
    return [...known, ...DEFAULT_ORDER.filter((id) => !known.includes(id))];
  } catch {
    return DEFAULT_ORDER;
  }
};

const saveOrder = (order: string[]) => {
  try {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  } catch {
    // Storage unavailable; the order just isn't remembered.
  }
};

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
  const [order, setOrder] = useState(readOrder);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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

  const nodes: Record<string, ReactNode> = {
    moon: <MoonWidget moon={moon} altitudes={altitudes} />,
  };
  if (forecast) {
    const { weather, seeing, kp } = forecast;
    nodes.rain = weather ? <PrecipitationWidget weather={weather} /> : <Unavailable title="Rain / snow" />;
    nodes.precipitation = weather ? (
      <PrecipitationGraphWidget weather={weather} />
    ) : (
      <Unavailable title="Precipitation, mm" />
    );
    nodes.wind = weather ? <WindWidget weather={weather} /> : <Unavailable title="Wind speeds" />;
    nodes.cloud = weather ? <CloudWidget weather={weather} /> : <Unavailable title="Cloud coverage, hourly" />;
    nodes.seeing = seeing ? <SeeingWidget seeing={seeing} /> : <Unavailable title="Seeing" />;
    nodes.aurora = kp ? (
      <AuroraWidget kp={kp} start={loadedAt} latitude={forecast.latitude} />
    ) : (
      <Unavailable title="Aurora, Kp index" />
    );
    nodes.jetstream = weather ? <JetStreamWidget weather={weather} /> : <Unavailable title="Jet stream, m/s" />;
    nodes.weather = weather ? <WeatherWidget weather={weather} /> : <Unavailable title="Weather report, 15 h" />;
  }
  const visible = order.filter((id) => id in nodes);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      const next = arrayMove(order, order.indexOf(String(active.id)), order.indexOf(String(over.id)));
      setOrder(next);
      saveOrder(next);
    }
  };

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
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={visible} strategy={rectSortingStrategy}>
          <Grid container spacing={2}>
            {visible.map((id) => (
              <SortableItem key={id} id={id} size={FULL_WIDTH.has(id) ? 12 : { xs: 12, sm: 6, md: 4 }}>
                {nodes[id]}
              </SortableItem>
            ))}
          </Grid>
        </SortableContext>
      </DndContext>
    </Container>
  );
};

export default Dashboard;
