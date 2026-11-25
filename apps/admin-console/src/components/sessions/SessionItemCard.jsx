"use client";

import { Clock, Globe, Laptop, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ROLE_LABELS } from "@/config/navigation.registry";

function parseDeviceLabel(ua) {
  const text = String(ua || "");
  if (!text) return "Unknown Browser";
  const browser = /Edg\//.test(text)
    ? "Edge"
    : /Chrome\//.test(text)
      ? "Chrome"
      : /Firefox\//.test(text)
        ? "Firefox"
        : /Safari\//.test(text)
          ? "Safari"
          : "Browser";
  const os = /Windows/.test(text)
    ? "Windows"
    : /Mac OS/.test(text)
      ? "macOS"
      : /Android/.test(text)
        ? "Android"
        : /iPhone|iPad/.test(text)
          ? "iOS"
          : /Linux/.test(text)
            ? "Linux"
            : "Device";
  return `${browser} on ${os}`;
}

function formatDateTime(iso) {
  if (!iso) return "Just now";
  const dt = new Date(iso);
  return Number.isNaN(dt.getTime()) ? "Recent" : dt.toLocaleString();
}

export function SessionItemCard({ session }) {
  const rawDevice = session.device || "";
  const isMobile = /android|iphone|ipad|mobile/i.test(rawDevice);
  const Icon = isMobile ? Smartphone : Laptop;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3 text-start">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-ink">
              {parseDeviceLabel(rawDevice)}
            </p>
            {session.is_current_device && (
              <Badge tone="success">Current Device</Badge>
            )}
            {session.role && (
              <Badge tone="neutral">
                {ROLE_LABELS[session.role] || session.role}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1" dir="ltr">
              <Globe className="size-3.5 shrink-0" />{" "}
              {session.ip || "Unknown IP"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5 shrink-0" />{" "}
              {formatDateTime(session.lastUsedAt || session.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};