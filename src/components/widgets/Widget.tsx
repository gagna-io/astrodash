import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { ReactNode, useContext } from "react";
import { DragHandleContext } from "../SortableItem";

type WidgetProps = {
  title: string;
  children: ReactNode;
  /** A fixed background color; text turns dark to stay readable in both modes. */
  background?: string;
};

const Widget = ({ title, children, background }: WidgetProps) => {
  const handle = useContext(DragHandleContext);

  return (
    <Card sx={{ height: "100%", ...(background && { bgcolor: background, color: "rgba(0, 0, 0, 0.87)" }) }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="overline" color={background ? "inherit" : "text.secondary"} component="h2">
            {title}
          </Typography>
          {handle}
        </Box>
        {children}
      </CardContent>
    </Card>
  );
};

export default Widget;
