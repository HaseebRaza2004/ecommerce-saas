"use client";

import { useState, useEffect } from "react";
import { CONSOLE_MODULES } from "@/lib/moduleRegistry";
import { useI18n } from "@/context/I18nContext";

export default function CommandPalette({ isOpen, onClose, onSelectModule }) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = CONSOLE_MODULES.filter((m) =>
    t(m.i18nKey).toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="no-print fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-(--border-subtle) bg-(--bg-card) p-4 shadow-2xl text-start">
        <div className="flex items-center gap-2 border-b border-(--border-subtle) pb-3">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("quickJumpPlaceholder")}
            className="w-full bg-transparent text-sm text-(--text-main) focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-(--border-subtle) px-2 py-0.5 text-xs text-(--text-muted)"
          >
            ESC
          </button>
        </div>
        <ul className="mt-3 max-h-60 space-y-1 overflow-y-auto">
          {filtered.map((mod) => (
            <li key={mod.id}>
              <button
                type="button"
                onClick={() => {
                  onSelectModule(mod.id);
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold text-(--text-main) hover:bg-(--active-pill-bg) hover:text-(--active-pill-text)"
              >
                <span>{t(mod.i18nKey)}</span>
                <span className="font-mono text-[11px] opacity-75">
                  {mod.tierBadge}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}