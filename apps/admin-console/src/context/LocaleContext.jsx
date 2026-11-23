"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";
import { DICTIONARY, SUPPORTED_LOCALES } from "@/config/i18n.dictionary";
import { readUiPref, subscribeUiPrefs, writeUiPref } from "@/lib/uiPrefsStore";

const LOCALE_KEY = "commercia_ui_locale";
const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const rawLocale = useSyncExternalStore(
    subscribeUiPrefs,
    () => readUiPref(LOCALE_KEY, "en"),
    () => "en",
  );

  const localeMeta =
    SUPPORTED_LOCALES.find((item) => item.code === rawLocale) ||
    SUPPORTED_LOCALES[0];

  useEffect(() => {
    const root = document.documentElement;
    root.lang = localeMeta.code;
    root.dir = localeMeta.dir;
  }, [localeMeta.code, localeMeta.dir]);

  const setLocale = (code) => {
    if (SUPPORTED_LOCALES.some((item) => item.code === code)) {
      writeUiPref(LOCALE_KEY, code);
    }
  };

  const t = (key) =>
    DICTIONARY[localeMeta.code]?.[key] || DICTIONARY.en[key] || key;

  return (
    <LocaleContext.Provider
      value={{
        locale: localeMeta.code,
        dir: localeMeta.dir,
        isRtl: localeMeta.dir === "rtl",
        locales: SUPPORTED_LOCALES,
        setLocale,
        t,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}