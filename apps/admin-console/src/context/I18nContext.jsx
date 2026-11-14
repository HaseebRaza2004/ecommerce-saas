"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { DICTIONARIES, SUPPORTED_LANGUAGES } from "@/lib/i18nDictionaries";

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState("en");

  const currentLangMeta = useMemo(
    () =>
      SUPPORTED_LANGUAGES.find((item) => item.code === lang) ||
      SUPPORTED_LANGUAGES[0],
    [lang],
  );

  useEffect(() => {
    document.documentElement.lang = currentLangMeta.code;
    document.documentElement.dir = currentLangMeta.dir;
  }, [currentLangMeta]);

  const changeLanguage = useCallback((nextLang) => {
    if (DICTIONARIES[nextLang]) {
      setLang(nextLang);
    }
  }, []);

  const t = useCallback(
    (key) => DICTIONARIES[lang]?.[key] || DICTIONARIES.en[key] || key,
    [lang],
  );

  const value = useMemo(
    () => ({
      lang,
      dir: currentLangMeta.dir,
      isRtl: currentLangMeta.dir === "rtl",
      t,
      changeLanguage,
      languages: SUPPORTED_LANGUAGES,
    }),
    [lang, currentLangMeta, t, changeLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
};