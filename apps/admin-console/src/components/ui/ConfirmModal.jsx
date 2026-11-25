"use client";

import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  loading = false,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && !loading) onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        aria-hidden="true"
        onClick={() => !loading && onClose?.()}
        className="fixed inset-0 bg-black/45 backdrop-blur-[2px]"
      />
      <div className="animate-fade-in relative z-10 w-full max-w-md rounded-2xl border border-line bg-surface p-5 shadow-2xl text-start">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone === "danger" ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning"}`}
            >
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {description}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="iconSm"
            disabled={loading}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2 border-t border-line pt-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={onClose}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            size="sm"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}