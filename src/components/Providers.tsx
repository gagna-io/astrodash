"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { ReactNode, useMemo } from "react";

/** Follows the system dark mode setting. */
const Providers = ({ children }: { children: ReactNode }) => {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = useMemo(() => createTheme({ palette: { mode: prefersDark ? "dark" : "light" } }), [prefersDark]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default Providers;
