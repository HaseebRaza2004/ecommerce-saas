"use client";

import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

const TONES = {
  error: { box: "border-danger/25 bg-danger-soft text-danger", Icon: XCircle },
  warning: {
    box: "border-warning/25 bg-warning-soft text-warning",
    Icon: AlertTriangle,
  },
  success: {
    box: "border-success/25 bg-success-soft text-success",
    Icon: CheckCircle2,
  },
  info: { box: "border-brand/25 bg-brand-soft text-brand", Icon: Info },
};

export function Alert({ tone = "info", title, message, className = "" }) {
  const { box, Icon } = TONES[tone] || TONES.info;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`animate-fade-in flex items-start gap-2.5 rounded-xl border p-3 text-start text-xs ${box} ${className}`}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1 space-y-0.5">
        {title && <p className="font-semibold">{title}</p>}
        {message && <p className="leading-relaxed opacity-90">{message}</p>}
      </div>
    </div>
  );
}