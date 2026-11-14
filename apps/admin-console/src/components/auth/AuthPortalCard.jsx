"use client";

import { useState } from "react";
import { useI18n } from "@/context/I18nContext";
import { useTheme } from "@/context/ThemeContext";
import Badge from "@/components/ui/Badge";
import MerchantLoginForm from "@/components/auth/MerchantLoginForm";
import MerchantRegisterForm from "@/components/auth/MerchantRegisterForm";
import OmniMerchantAuthForm from "@/components/auth/OmniMerchantAuthForm";
import StaffLoginForm from "@/components/auth/StaffLoginForm";

export default function AuthPortalCard() {
  const { t, lang, changeLanguage, languages } = useI18n();
  const { themeId, themes, selectTheme } = useTheme();
  const [mode, setMode] = useState("login");

  const tabs = [
    { id: "login", label: t("tabMerchantLogin") },
    { id: "register", label: t("tabRegisterStore") },
    { id: "omni", label: t("tabOmniAuth") },
    { id: "staff", label: t("tabStaffLogin") },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-(--bg-canvas) px-4 py-10 text-(--text-main)">
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
        <div className="flex rounded-xl border border-(--border-subtle) bg-(--bg-card) p-1">
          {themes.map((th) => (
            <button
              key={th.id}
              type="button"
              onClick={() => selectTheme(th.id)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                themeId === th.id
                  ? "bg-(--active-pill-bg) text-(--active-pill-text)"
                  : "text-(--text-muted)"
              }`}
            >
              <span
                style={{ backgroundColor: th.swatch }}
                className="h-2.5 w-2.5 rounded-full"
              />
              <span>{th.name}</span>
            </button>
          ))}
        </div>

        <div className="flex rounded-xl border border-(--border-subtle) bg-(--bg-card) p-1">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => changeLanguage(l.code)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                lang === l.code
                  ? "bg-(--brand-primary) text-white"
                  : "text-(--text-muted)"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-lg rounded-2xl border border-(--border-subtle) bg-(--bg-card) p-6 sm:p-8 shadow-sm">
        <div className="mb-6 text-center">
          <Badge variant="brand">🛡️ HttpOnly Zero-Trust Session Shield</Badge>
          <h1 className="mt-3 text-xl sm:text-2xl font-bold text-(--text-main)">
            {t("brandTitle")}
          </h1>
          <p className="mt-1 text-xs text-(--text-muted)">
            {t("brandSubtitle")}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-1.5 rounded-xl bg-(--bg-canvas) p-1.5 sm:grid-cols-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMode(tab.id)}
              className={`rounded-lg py-2 text-xs font-semibold transition ${
                mode === tab.id
                  ? "bg-(--brand-primary) text-white shadow-xs"
                  : "text-(--text-muted) hover:text-(--text-main)"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {mode === "login" && <MerchantLoginForm />}
        {mode === "register" && <MerchantRegisterForm />}
        {mode === "omni" && <OmniMerchantAuthForm />}
        {mode === "staff" && <StaffLoginForm />}
      </div>
    </div>
  );
}