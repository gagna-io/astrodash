import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { green, grey, red, yellow } from "@mui/material/colors";
import { NightLevel, NightSummary } from "@/lib/summary";
import { formatHour } from "@/lib/time";
import Widget from "./Widget";

const LEVELS: Record<NightLevel, { label: string; background: string }> = {
  excellent: { label: "Excellent", background: green[200] },
  good: { label: "Good", background: yellow[300] },
  bad: { label: "Bad", background: red[300] },
  none: { label: "No astronomical night", background: grey[300] },
};

const time = (date?: Date) => (date ? formatHour(date.toISOString()) : "–");

/** Tonight's verdict in a full-width box, with one separate box per upcoming night below it (a third of the width each). */
const SummaryWidget = ({ nights }: { nights: NightSummary[] }) => {
  const tonight = nights.at(0);
  if (!tonight) {
    return null;
  }
  const level = LEVELS[tonight.level];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, height: "100%" }}>
      <Box sx={{ flex: 1 }}>
        <Widget title="Tonight" background={level.background}>
      <Typography variant="h4" sx={{ py: 1 }}>
        {level.label}
      </Typography>
      {tonight.reasons.length > 0 && <Typography>{tonight.reasons.join(", ")}</Typography>}
      <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
        Sunset {time(tonight.sunset)} · Sunrise {time(tonight.sunrise)}
      </Typography>
      {tonight.night && (
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          Astronomical night {time(tonight.night.start)}–{time(tonight.night.end)}
        </Typography>
      )}
        </Widget>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
        {nights.map((night) => (
          <Card
            key={night.weekday + time(night.night?.start ?? night.sunset)}
            sx={{ bgcolor: LEVELS[night.level].background, color: "rgba(0, 0, 0, 0.87)" }}
          >
            <CardContent>
              <Typography variant="h6">{night.weekday}</Typography>
              <Typography variant="body2">
                {night.level === "excellent"
                  ? "Excellent"
                  : night.level === "none"
                    ? "No astronomical night"
                    : night.reasons.join(", ")}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default SummaryWidget;
