"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, RefreshCw, ShieldAlert } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { SessionItemCard } from "@/components/sessions/SessionItemCard";

export function ActiveSessionsManager() {
  const { logout, logoutAll } = useAuth();
  const { t } = useLocale();
  const { showToast } = useToast();
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [panicOpen, setPanicOpen] = useState(false);
  const [actionBusy, setActionBusy] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    authService
      .getSessions(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setSessions(Array.isArray(data) ? data : data?.sessions || []);
        setError("");
      })
      .catch((err) => {
        if (!controller.signal.aborted && err?.name !== "AbortError") {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await authService.getSessions();
      setSessions(Array.isArray(data) ? data : data?.sessions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutCurrent = async () => {
    setActionBusy("current");
    try {
      await logout();
      showToast({
        title: t("logout"),
        message: "Current device session terminated.",
        tone: "info",
      });
      router.replace("/login");
    } catch (err) {
      setError(err.message);
      setActionBusy("");
    }
  };

  const handlePanicLogoutAll = async () => {
    setActionBusy("all");
    try {
      const res = await logoutAll();
      const count = res?.revokedDevicesCount ?? sessions.length;
      setPanicOpen(false);
      showToast({
        title: "All Devices Revoked",
        message: `${count} active session(s) killed instantly.`,
        tone: "warning",
      });
      router.replace("/login");
    } catch (err) {
      setError(err.message);
      setActionBusy("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted">
          {sessions.length} active session(s) protected by Redis token
          versioning.
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{t("refresh")}</span>
        </Button>
      </div>

      {error && <Alert tone="error" message={error} />}

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : sessions.length === 0 ? (
        <Alert tone="info" message="No active sessions returned by server." />
      ) : (
        <div className="space-y-2.5">
          {sessions.map((item) => (
            <SessionItemCard
              key={item.sessionId || `${item.ip}-${item.createdAt}`}
              session={item}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2.5 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="secondary"
          size="sm"
          loading={actionBusy === "current"}
          onClick={handleLogoutCurrent}
        >
          <LogOut className="size-3.5" />
          <span>{t("logoutThisDevice")}</span>
        </Button>
        <Button variant="danger" size="sm" onClick={() => setPanicOpen(true)}>
          <ShieldAlert className="size-3.5" />
          <span>{t("panicLogoutAll")}</span>
        </Button>
      </div>

      <ConfirmModal
        open={panicOpen}
        onClose={() => setPanicOpen(false)}
        onConfirm={handlePanicLogoutAll}
        title={t("panicModalTitle")}
        description={t("panicModalDesc")}
        confirmLabel={t("panicConfirm")}
        cancelLabel={t("cancel")}
        loading={actionBusy === "all"}
      />
    </div>
  );
};