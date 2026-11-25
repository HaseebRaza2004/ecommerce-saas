import { en } from "@/data/locales/en";
import { ar } from "@/data/locales/ar";
import { ur } from "@/data/locales/ur";

export const SUPPORTED_LOCALES = Object.freeze([
  { code: "en", label: "English", native: "EN", dir: "ltr" },
  { code: "ar", label: "Arabic", native: "العربية", dir: "rtl" },
  { code: "ur", label: "Urdu", native: "اردو", dir: "rtl" },
]);

export const LOCALES_MAP = Object.freeze({ en, ar, ur });