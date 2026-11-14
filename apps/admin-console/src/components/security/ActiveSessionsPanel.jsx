"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { useToast } from "@/context/ToastContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function ActiveSessionsPanel() {
  const { logout } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await apiRequest("/api/v1/auth/admin/sessions");
        if (isMounted) setSessions(Array.isArray(data) ? data : []);
      } catch (err) {
        if (isMounted) showToast(err.message, "error");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const handlePanicLogout = async () => {
    setRevoking(true);
    try {
      const res = await apiRequest("/api/v1/auth/admin/logout-all", {
        method: "POST",
      });
      showToast(
        `Revoked ${res?.revokedDevicesCount || "all"} sessions`,
        "success",
      );
      setConfirmOpen(false);
      await logout();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <Card
      title={t("activeSessionsTitle")}
      subtitle="Real-time Redis device fingerprint & refresh token rotation shield"
      action={
        <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
          🚨 {t("panicLogoutBtn")}
        </Button>
      }
    >
      <div className="space-y-2.5">
        {loading ? (
          <p className="text-xs text-(--text-muted)">
            Loading active device sessions...
          </p>
        ) : (
          sessions.map((s) => (
            <div
              key={s.sessionId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-(--border-subtle) bg-(--bg-canvas) px-4 py-3 text-xs"
            >
              <div>
                <p className="font-bold text-(--text-main)">
                  {s.device || "Browser Session"} • {s.ip}
                </p>
                <p className="text-(--text-muted)">
                  Role: {s.role} • Last active: {s.lastUsedAt || s.createdAt}
                </p>
              </div>
              {s.is_current_device && (
                <Badge variant="accent">Current Device</Badge>
              )}
            </div>
          ))
        )}
      </div>
      <ConfirmModal
        isOpen={confirmOpen}
        title="Force Logout All Active Devices?"
        description="This immediately increments your Redis auth version, revoking all 15m JWTs and 7d refresh tokens across every logged-in device."
        confirmLabel="Revoke All Sessions"
        loading={revoking}
        onConfirm={handlePanicLogout}
        onCancel={() => setConfirmOpen(false)}
      />
    </Card>
  );
}