"use client";

import { BarChart3, PackageCheck, ShieldCheck, Store } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand.config";
import { AUTH_SHOWCASE_DATA } from "@/data/authShowcase.data";
import { useLocale } from "@/context/LocaleContext";

const ICON_MAP = { Store, PackageCheck, ShieldCheck, BarChart3 };

export function AuthShowcasePanel() {
  const { t } = useLocale();

  return (
    <section className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-8 text-sidebar-ink lg:flex lg:w-[46%] xl:p-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -inset-e-24 size-96 rounded-full bg-brand/25 blur-3xl"
      />
      <div className="relative z-10 space-y-7 text-start">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand font-bold text-brand-ink shadow-sm">
            C
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-bold tracking-tight">
              {BRAND_CONFIG.name}
            </span>
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase">
              {t("consoleBadge")}
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-medium">
          <span className="size-2 rounded-full bg-accent" />
          <span>{t("enginePill")}</span>
        </div>

        <div className="space-y-2.5">
          <h1 className="text-3xl leading-tight font-bold tracking-tight xl:text-4xl">
            {t("heroPrefix")}{" "}
            <span className="italic text-accent">{t("heroAccent")}</span>{" "}
            {t("heroSuffix")}
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-sidebar-muted">
            {t("heroSub")}
          </p>
        </div>

        <div className="space-y-3 pt-1">
          {AUTH_SHOWCASE_DATA.map((item) => {
            const Icon = ICON_MAP[item.icon] || Store;
            return (
              <div
                key={item.titleKey}
                className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-white/6 p-3.5 backdrop-blur-xs transition-colors hover:bg-white/10"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-accent">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{t(item.titleKey)}</p>
                  <p className="mt-0.5 text-xs text-sidebar-muted">
                    {t(item.descKey)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-sidebar-muted">
        <span>{t("tierFooter")}</span>
        <span>{t("cookieFooter")}</span>
      </footer>
    </section>
  );
};