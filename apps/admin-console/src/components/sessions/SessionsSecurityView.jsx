"use client";

import { ShieldCheck } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { Card } from "@/components/ui/Card";
import { ActiveSessionsManager } from "@/components/sessions/ActiveSessionsManager";

export function SessionsSecurityView() {
  const { t } = useLocale();

  return (
    <div className="animate-fade-in space-y-5 text-start">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink">{t("sessionsTitle")}</h1>
          <p className="text-xs text-muted">{t("sessionsSub")}</p>
        </div>
      </div>

      <Card>
        <ActiveSessionsManager />
      </Card>
    </div>
  );
}