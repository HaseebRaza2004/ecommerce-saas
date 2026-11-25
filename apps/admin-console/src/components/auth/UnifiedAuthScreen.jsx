"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { BRAND_CONFIG } from "@/config/brand.config";
import { ThemeLocaleControls } from "@/components/ui/ThemeLocaleControls";
import { Button } from "@/components/ui/Button";
import { AuthShowcasePanel } from "@/components/auth/AuthShowcasePanel";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

export function UnifiedAuthScreen() {
  const { status } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [view, setView] = useState("login");

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  const handleSuccess = () => router.replace("/dashboard");

  return (
    <div className="flex min-h-screen w-full bg-surface">
      <AuthShowcasePanel />

      <main className="flex flex-1 flex-col justify-between bg-surface px-5 py-6 sm:px-10 lg:px-12">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 lg:hidden">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-brand-ink">
              C
            </span>
            <span className="text-base font-bold text-ink">
              {BRAND_CONFIG.name}
            </span>
          </div>
          <div className="ms-auto flex flex-wrap items-center gap-3">
            <ThemeLocaleControls compact />
            <Button
              variant="link"
              onClick={() =>
                setView((v) => (v === "login" ? "register" : "login"))
              }
              className="text-xs"
            >
              {view === "login" ? (
                <>
                  {t("newToBrand")}{" "}
                  <span className="ms-1 font-semibold text-brand">
                    {t("createStore")}
                  </span>
                </>
              ) : (
                <>
                  {t("haveStore")}{" "}
                  <span className="ms-1 font-semibold text-brand">
                    {t("signIn")}
                  </span>
                </>
              )}
            </Button>
          </div>
        </header>

        <div className="animate-fade-in mx-auto my-8 w-full max-w-md space-y-6">
          <div className="space-y-1.5 text-start">
            <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {view === "login" ? t("welcomeBack") : t("createStoreTitle")}
            </h2>
            <p className="text-sm text-muted">
              {view === "login" ? t("signInSub") : t("createStoreSub")}
            </p>
          </div>

          {view === "login" ? (
            <LoginForm onSuccess={handleSuccess} />
          ) : (
            <RegisterForm onSuccess={handleSuccess} />
          )}
        </div>

        <footer className="mx-auto flex w-full max-w-md flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-brand" />
            {t("cloudflareShield")}
          </span>
          <span>{t("legalLinks")}</span>
        </footer>
      </main>
    </div>
  );
};