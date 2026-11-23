"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";
import {
  DEFAULT_COLOR_MODE,
  DEFAULT_THEME_ID,
  THEMES_REGISTRY,
  isValidThemeId,
} from "@/config/themes.registry";
import { readUiPref, subscribeUiPrefs, writeUiPref } from "@/lib/uiPrefsStore";

const THEME_KEY = "commercia_ui_theme";
const MODE_KEY = "commercia_ui_mode";
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const storedTheme = useSyncExternalStore(
    subscribeUiPrefs,
    () => readUiPref(THEME_KEY, DEFAULT_THEME_ID),
    () => DEFAULT_THEME_ID,
  );
  const storedMode = useSyncExternalStore(
    subscribeUiPrefs,
    () => readUiPref(MODE_KEY, DEFAULT_COLOR_MODE),
    () => DEFAULT_COLOR_MODE,
  );

  const theme = isValidThemeId(storedTheme) ? storedTheme : DEFAULT_THEME_ID;
  const mode = storedMode === "dark" ? "dark" : "light";

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.mode = mode;
    root.style.colorScheme = mode;
  }, [theme, mode]);

  const setTheme = (nextId) => {
    if (isValidThemeId(nextId)) writeUiPref(THEME_KEY, nextId);
  };

  const toggleMode = () => {
    writeUiPref(MODE_KEY, mode === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider
      value={{ theme, mode, themes: THEMES_REGISTRY, setTheme, toggleMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}