import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { ReactNode, useContext } from "react";
import { DragHandleContext } from "../SortableItem";

type WidgetProps = {
  title: string;
  children: ReactNode;
};

const Widget = ({ title, children }: WidgetProps) => {
  const handle = useContext(DragHandleContext);

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="overline" color="text.secondary" component="h2">
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
