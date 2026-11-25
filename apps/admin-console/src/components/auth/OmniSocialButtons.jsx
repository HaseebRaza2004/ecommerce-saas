"use client";

import { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

const GOOGLE_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const APPLE_ID = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;

export function OmniSocialButtons({ onSelectWhatsapp }) {
  const { t } = useLocale();
  const [notice, setNotice] = useState("");

  const handleOAuthClick = (provider) => {
    const clientId = provider === "google" ? GOOGLE_ID : APPLE_ID;
    if (!clientId) {
      setNotice(
        `Add NEXT_PUBLIC_${provider.toUpperCase()}_CLIENT_ID in .env.local to activate ${provider === "google" ? "Google" : "Apple"} Omni-Auth.`,
      );
      return;
    }
    setNotice(
      `${provider === "google" ? "Google" : "Apple"} OAuth authenticates via /api/v1/omni-auth/merchant.`,
    );
  };

  return (
    <div className="space-y-3">
      <div className="relative flex items-center py-1">
        <span className="flex-1 border-t border-line" />
        <span className="px-3 text-[11px] font-medium tracking-wider uppercase text-muted">
          {t("orContinueWith")}
        </span>
        <span className="flex-1 border-t border-line" />
      </div>

      {notice && <Alert tone="info" message={notice} />}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Button
          variant="secondary"
          size="md"
          onClick={() => handleOAuthClick("google")}
          className="px-3 text-xs"
        >
          <span className="font-bold text-brand">G</span>
          <span className="truncate">{t("google")}</span>
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={() => handleOAuthClick("apple")}
          className="px-3 text-xs"
        >
          <span className="font-bold"></span>
          <span className="truncate">{t("apple")}</span>
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={onSelectWhatsapp}
          className="px-3 text-xs"
        >
          <span className="font-bold text-success">WA</span>
          <span className="truncate">{t("whatsapp")}</span>
        </Button>
      </div>
    </div>
  );
};