import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { ReactNode } from "react";

type WidgetProps = {
  title: string;
  children: ReactNode;
};

const Widget = ({ title, children }: WidgetProps) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Typography variant="overline" color="text.secondary" component="h2">
        {title}
      </Typography>
      {children}
    </CardContent>
  </Card>
);

export default Widget;
