// src/context/LayoutContext.tsx
import React from "react";

interface LayoutContextType {
  open: boolean;
  isDarkMode: boolean;
  toggleColorMode: () => void;
  handleDrawerOpen: () => void;
  handleDrawerClose: () => void;
}

export const LayoutContext = React.createContext<LayoutContextType>({
  open: false,
  isDarkMode: false,
  toggleColorMode: () => {},
  handleDrawerOpen: () => {},
  handleDrawerClose: () => {},
});
