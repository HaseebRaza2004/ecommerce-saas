"use client";

import { Moon, Palette, Sun, Globe } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/context/LocaleContext";

export function ThemeLocaleControls({ compact = false }) {
  const { theme, mode, themes, setTheme, toggleMode } = useTheme();
  const { locale, locales, setLocale } = useLocale();

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <label className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2 py-1 text-xs text-ink">
        <Palette className="size-3.5 shrink-0 text-muted" aria-hidden="true" />
        <span className="sr-only">Select theme</span>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="cursor-pointer bg-transparent text-xs font-medium text-ink focus:outline-hidden"
        >
          {themes.map((item) => (
            <option
              key={item.id}
              value={item.id}
              className="bg-surface text-ink"
            >
              {compact ? item.name.split(" ")[0] : item.name}
            </option>
          ))}
        </select>
      </label>

      <label className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2 py-1 text-xs text-ink">
        <Globe className="size-3.5 shrink-0 text-muted" aria-hidden="true" />
        <span className="sr-only">Select language</span>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          className="cursor-pointer bg-transparent text-xs font-medium text-ink focus:outline-hidden"
        >
          {locales.map((item) => (
            <option
              key={item.code}
              value={item.code}
              className="bg-surface text-ink"
            >
              {item.native}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={toggleMode}
        aria-label={
          mode === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
        className="inline-flex size-8 items-center justify-center rounded-lg border border-line bg-surface text-muted transition-colors hover:bg-surface-subtle hover:text-ink"
      >
        {mode === "dark" ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )}
      </button>
    </div>
  );
}