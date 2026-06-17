import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createAppTheme } from "./theme";

type Mode = "light" | "dark";

interface ColorModeContextType {
  mode: Mode;
  toggleColorMode: () => void;
  setMode: (m: Mode) => void;
}

const ColorModeContext = createContext<ColorModeContextType | undefined>(undefined);

export const useColorMode = () => {
  const ctx = useContext(ColorModeContext);
  if (!ctx) throw new Error("useColorMode must be used within ColorModeProvider");
  return ctx;
};

const STORAGE_KEY = "omnify-color-mode";

export const ColorModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<Mode>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    return saved === "dark" || (saved === null && document.documentElement.classList.contains("dark"))
      ? "dark"
      : (saved as Mode) || "light";
  });

  // Keep the Tailwind `.dark` class and persistence in sync with MUI mode.
  useEffect(() => {
    const root = document.documentElement;
    if (mode === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const value = useMemo<ColorModeContextType>(
    () => ({
      mode,
      setMode: setModeState,
      toggleColorMode: () => setModeState((m) => (m === "dark" ? "light" : "dark")),
    }),
    [mode]
  );

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default ColorModeProvider;
