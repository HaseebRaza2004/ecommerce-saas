"use client";

import Link from "next/link";
import { Menu, Search, ShieldCheck } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { ThemeLocaleControls } from "@/components/ui/ThemeLocaleControls";
import { Button } from "@/components/ui/Button";

export function Topbar({ onOpenMobileNav, onOpenSearch }) {
  const { t } = useLocale();

  return (
    <header className="sticky top-0 z-30 flex h-15 items-center justify-between gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-2.5">
        <Button
          variant="secondary"
          size="icon"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
          className="lg:hidden"
        >
          <Menu className="size-4" />
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenSearch}
          className="h-9 justify-between bg-canvas px-3 text-xs font-normal text-muted hover:border-brand/40 sm:w-64"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Search className="size-3.5 shrink-0" />
            <span className="hidden truncate sm:inline">
              {t("quickSearch")}
            </span>
          </span>
          <kbd className="hidden rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px] sm:inline">
            Ctrl K
          </kbd>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/security/sessions">
          <Button variant="soft" size="sm">
            <ShieldCheck className="size-3.5" />
            <span className="hidden sm:inline">{t("devices")}</span>
          </Button>
        </Link>

        <ThemeLocaleControls compact />
      </div>
    </header>
  );
};