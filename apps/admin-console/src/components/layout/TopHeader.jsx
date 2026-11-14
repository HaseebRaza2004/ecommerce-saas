"use client";

import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { useTheme } from "@/context/ThemeContext";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function TopHeader({ onOpenSearch }) {
  const { merchant, role, logout } = useAuth();
  const { lang, changeLanguage, languages, t } = useI18n();
  const { themeId, themes, selectTheme } = useTheme();

  return (
    <header className="no-print sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-(--border-subtle) bg-(--bg-card)/95 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3 text-start">
        <span
          style={{
            backgroundColor:
              merchant?.themeConfig?.primaryColor || "var(--brand-primary)",
          }}
          className="h-4 w-4 shrink-0 rounded-full ring-2 ring-(--border-subtle)"
        />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-(--text-main)">
              {merchant?.storeName || "Electro Hub"}
            </h1>
            <Badge variant="brand">{role.replace("_", " ")}</Badge>
          </div>
          <p className="text-[11px] text-(--text-muted)">
            {merchant?.domainUrl || "electrohub.pk"} • KYC:{" "}
            {merchant?.kycStatus || "pending"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onOpenSearch}
          className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-(--border-subtle) bg-(--bg-canvas) px-3 py-1.5 text-xs text-(--text-muted) hover:text-(--text-main)"
        >
          <span>🔍</span>
          <span>{t("quickJumpPlaceholder")}</span>
        </button>

        <select
          aria-label="Select Admin Console Theme"
          value={themeId}
          onChange={(e) => selectTheme(e.target.value)}
          className="rounded-xl border border-(--border-subtle) bg-(--bg-canvas) px-2.5 py-1.5 text-xs font-semibold text-(--text-main) focus:outline-none"
        >
          {themes.map((th) => (
            <option key={th.id} value={th.id}>
              🎨 {th.name}
            </option>
          ))}
        </select>

        <div className="flex rounded-xl border border-(--border-subtle) bg-(--bg-canvas) p-0.5">
          {languages.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => changeLanguage(item.code)}
              className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${
                lang === item.code
                  ? "bg-(--brand-primary) text-white"
                  : "text-(--text-muted) hover:text-(--text-main)"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <Button variant="secondary" size="sm" onClick={logout}>
          {t("logoutBtn")}
        </Button>
      </div>
    </header>
  );
}