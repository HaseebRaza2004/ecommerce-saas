"use client";

import { Globe, Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/context/LocaleContext";
import { Dropdown } from "@/components/ui/Dropdown";
import { Button } from "@/components/ui/Button";

export function ThemeLocaleControls({ compact = false }) {
  const { theme, mode, themes, setTheme, toggleMode } = useTheme();
  const { locale, locales, setLocale } = useLocale();

  const themeOptions = themes.map((item) => ({
    value: item.id,
    label: item.name,
    shortLabel: compact ? item.name.split(" ")[0] : item.name,
    swatches: item.swatches,
  }));

  const localeOptions = locales.map((item) => ({
    value: item.code,
    label: `${item.native} (${item.label})`,
    shortLabel: item.native,
  }));

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Dropdown
        size="sm"
        icon={Palette}
        value={theme}
        onChange={setTheme}
        options={themeOptions}
      />
      <Dropdown
        size="sm"
        icon={Globe}
        value={locale}
        onChange={setLocale}
        options={localeOptions}
      />
      <Button
        variant="secondary"
        size="iconSm"
        onClick={toggleMode}
        aria-label={
          mode === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
      >
        {mode === "dark" ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )}
      </Button>
    </div>
  );
};