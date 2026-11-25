"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CornerDownLeft,
  LayoutDashboard,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const SEARCH_ITEMS = [
  {
    id: "dash",
    section: "top",
    code: "DB",
    label: "Dashboard Overview",
    meta: "Workspace · Store health & status",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "sec",
    section: "top",
    code: "AD",
    label: "Active Device Sessions",
    meta: "Security · View browsers & Panic logout",
    href: "/security/sessions",
    icon: ShieldCheck,
  },
  {
    id: "goto-dash",
    section: "goto",
    label: "Dashboard",
    meta: "Page",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "goto-sec",
    section: "goto",
    label: "Active Devices",
    meta: "Security Page",
    href: "/security/sessions",
    icon: ShieldCheck,
  },
];

export function CommandSearchModal({ open, onClose }) {
  const router = useRouter();
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      SEARCH_ITEMS.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.meta.toLowerCase().includes(q),
      ),
    [q],
  );
  const topItems = useMemo(
    () => filtered.filter((i) => i.section === "top"),
    [filtered],
  );
  const gotoItems = useMemo(
    () => filtered.filter((i) => i.section === "goto"),
    [filtered],
  );
  const flatList = useMemo(
    () => [...topItems, ...gotoItems],
    [topItems, gotoItems],
  );
  const safeIdx =
    flatList.length > 0 ? Math.min(activeIdx, flatList.length - 1) : 0;

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onClose("toggle");
        return;
      }
      if (!open) return;
      if (e.key === "Escape") onClose(false);
      if (e.key === "ArrowDown" && flatList.length > 0) {
        e.preventDefault();
        setActiveIdx((prev) => (prev + 1) % flatList.length);
      }
      if (e.key === "ArrowUp" && flatList.length > 0) {
        e.preventDefault();
        setActiveIdx((prev) => (prev - 1 + flatList.length) % flatList.length);
      }
      if (e.key === "Enter" && flatList[safeIdx]) {
        e.preventDefault();
        router.push(flatList[safeIdx].href);
        onClose(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, flatList, safeIdx, router]);

  if (!open) return null;

  const selectItem = (href) => {
    router.push(href);
    onClose(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-20"
      role="dialog"
      aria-modal="true"
    >
      <div
        aria-hidden="true"
        onClick={() => onClose(false)}
        className="fixed inset-0 bg-black/45 backdrop-blur-[2px]"
      />
      <div className="animate-fade-in relative z-10 flex max-h-[75vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <Search className="size-4 shrink-0 text-muted" />
          <Input
            variant="ghost"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            placeholder={t("quickSearch")}
          />
          <Button
            variant="secondary"
            size="xs"
            onClick={() => onClose(false)}
            className="h-6 px-2 font-mono text-[11px] text-muted"
          >
            esc
          </Button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-2.5 text-start">
          {flatList.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted">
              No matching pages or actions found.
            </p>
          ) : (
            <>
              <div className="space-y-1">
                {topItems.map((item) => {
                  const idx = flatList.indexOf(item);
                  const active = idx === safeIdx;
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      onMouseEnter={() => setActiveIdx(idx)}
                      onClick={() => selectItem(item.href)}
                      className={`h-auto w-full justify-between rounded-xl px-3 py-2.5 text-start ${active ? "bg-brand-soft text-ink hover:bg-brand-soft" : ""}`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-subtle text-xs font-bold text-ink">
                          {item.code}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-ink">
                            {item.label}
                          </span>
                          <span className="block truncate text-xs font-normal text-muted">
                            {item.meta}
                          </span>
                        </span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-muted rtl:rotate-180" />
                    </Button>
                  );
                })}
              </div>

              {gotoItems.length > 0 && (
                <div className="space-y-1 pt-1">
                  <p className="px-3 pb-1 text-[10px] font-semibold tracking-wider uppercase text-muted">
                    {t("goTo")}
                  </p>
                  {gotoItems.map((item) => {
                    const idx = flatList.indexOf(item);
                    const active = idx === safeIdx;
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant="ghost"
                        onMouseEnter={() => setActiveIdx(idx)}
                        onClick={() => selectItem(item.href)}
                        className={`h-auto w-full justify-between rounded-xl px-3 py-2.5 text-start ${active ? "bg-brand-soft text-ink hover:bg-brand-soft" : ""}`}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-subtle text-muted">
                            <Icon className="size-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-ink">
                              {item.label}
                            </span>
                            <span className="block truncate text-xs font-normal text-muted">
                              {item.meta}
                            </span>
                          </span>
                        </span>
                        <ArrowRight className="size-4 shrink-0 text-muted rtl:rotate-180" />
                      </Button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <footer className="flex flex-wrap items-center gap-4 border-t border-line bg-surface-subtle/50 px-4 py-2.5 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px]">
              ↑↓
            </kbd>
            {t("move")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <kbd className="inline-flex items-center rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px]">
              <CornerDownLeft className="size-2.5" />
            </kbd>
            {t("open")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px]">
              esc
            </kbd>
            {t("close")}
          </span>
        </footer>
      </div>
    </div>
  );
};