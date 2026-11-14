"use client";

import { CONSOLE_MODULES } from "@/lib/moduleRegistry";
import { useI18n } from "@/context/I18nContext";
import { useAuth } from "@/context/AuthContext";

export default function SidebarNav({ activeTab, setActiveTab }) {
  const { t } = useI18n();
  const { role } = useAuth();

  const allowedModules = CONSOLE_MODULES.filter((m) => m.roles.includes(role));

  return (
    <>
      <aside className="no-print hidden md:flex md:w-60 lg:w-64 shrink-0 flex-col bg-(--sidebar-bg) text-(--sidebar-text) p-4 border-e border-(--border-subtle)">
        <p className="mb-3 px-2 text-start text-[11px] font-bold uppercase tracking-wider text-(--sidebar-muted)">
          {t("brandTitle")}
        </p>
        <nav aria-label="Primary Sidebar" className="space-y-1.5">
          {allowedModules.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-start text-xs font-semibold transition ${
                  isActive
                    ? "bg-(--active-pill-bg) text-(--active-pill-text) shadow-xs"
                    : "text-(--sidebar-text)/85 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="rounded bg-black/20 px-1.5 py-0.5 font-mono text-[10px]">
                    {item.step}
                  </span>
                  <span className="truncate">{t(item.i18nKey)}</span>
                </div>
                <span className="shrink-0 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px]">
                  {item.tierBadge}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      <nav
        aria-label="Mobile Bottom Navigation"
        className="no-print fixed bottom-0 inset-x-0 z-30 flex md:hidden items-center justify-around border-t border-(--border-subtle) bg-(--bg-card) px-2 py-2 shadow-lg"
      >
        {allowedModules.slice(0, 5).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`rounded-xl px-2.5 py-1.5 text-[11px] font-bold ${
              activeTab === item.id
                ? "bg-(--active-pill-bg) text-(--active-pill-text)"
                : "text-(--text-muted)"
            }`}
          >
            {item.step}
          </button>
        ))}
      </nav>
    </>
  );
}