"use client";

import Link from "next/link";
import { ArrowUpRight, Globe, ShieldCheck, Store } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { ROLE_LABELS } from "@/config/navigation.registry";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function DashboardOverview() {
  const { user, role } = useAuth();
  const { t } = useLocale();

  const storeName = user?.storeName || user?.store_name || "Merchant Workspace";
  const domainUrl = user?.domainUrl || user?.domain_url || t("notConfigured");
  const dbRegion = user?.dbRegion || user?.db_region || "asia-east";
  const kycStatus = user?.kycStatus || user?.kyc_status || "pending";

  return (
    <div className="animate-fade-in space-y-6 text-start">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
            {storeName}
          </h1>
          <p className="mt-1 text-xs text-muted">{t("workspaceSub")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">{ROLE_LABELS[role] || "Store Owner"}</Badge>
          <Badge tone={kycStatus === "verified" ? "success" : "warning"}>
            KYC: {kycStatus}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-medium">{t("domainLabel")}</span>
            <Globe className="size-4 text-brand" />
          </div>
          <p className="truncate text-base font-semibold text-ink" dir="ltr">
            {domainUrl}
          </p>
          <p className="text-xs text-muted">Region: {dbRegion}</p>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-medium">{t("accountStatus")}</span>
            <Store className="size-4 text-brand" />
          </div>
          <p className="text-base font-semibold capitalize text-ink">
            {user?.status || "active"}
          </p>
          <p className="truncate text-xs text-muted" dir="ltr">
            {user?.email}
          </p>
        </Card>

        <Card className="flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-medium">{t("sessionSecurity")}</span>
            <ShieldCheck className="size-4 text-success" />
          </div>
          <Link href="/security/sessions">
            <Button variant="soft" size="sm" fullWidth>
              <span>{t("manageDevices")}</span>
              <ArrowUpRight className="size-3.5 rtl:-scale-x-100" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};