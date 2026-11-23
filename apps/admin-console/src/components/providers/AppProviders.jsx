"use client";

import { ThemeProvider } from "@/context/ThemeContext";
import { LocaleProvider } from "@/context/LocaleContext";
import { ToastProvider } from "@/context/ToastContext";

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <ToastProvider>{children}</ToastProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}