"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { ADMIN_THEMES } from "@/lib/themeRegistry";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(ADMIN_THEMES[0].id);

  const activeTheme = useMemo(
    () => ADMIN_THEMES.find((t) => t.id === themeId) || ADMIN_THEMES[0],
    [themeId],
  );

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(activeTheme.tokens).forEach(([cssVar, val]) => {
      root.style.setProperty(cssVar, val);
    });
  }, [activeTheme]);

  const selectTheme = useCallback((nextId) => {
    if (ADMIN_THEMES.some((t) => t.id === nextId)) {
      setThemeId(nextId);
    }
  }, []);

  const value = useMemo(
    () => ({
      themeId,
      activeTheme,
      themes: ADMIN_THEMES,
      selectTheme,
    }),
    [themeId, activeTheme, selectTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};