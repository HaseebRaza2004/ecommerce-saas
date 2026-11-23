"use client";

import { createContext, useContext, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";

const ToastContext = createContext(null);

const TONE_STYLES = {
  success: "border-success/30 bg-surface text-ink",
  error: "border-danger/30 bg-surface text-ink",
  warning: "border-warning/30 bg-surface text-ink",
  info: "border-brand/30 bg-surface text-ink",
};

const TONE_ICONS = {
  success: <CheckCircle2 className="size-4 shrink-0 text-success" />,
  error: <XCircle className="size-4 shrink-0 text-danger" />,
  warning: <AlertTriangle className="size-4 shrink-0 text-warning" />,
  info: <Info className="size-4 shrink-0 text-brand" />,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  };

  const showToast = ({ title, message, tone = "info", duration = 4000 }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev.slice(-3), { id, title, message, tone }]);
    if (duration > 0) {
      window.setTimeout(() => dismissToast(id), duration);
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 inset-e-4 z-50 flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className={`animate-fade-in pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-lg ${TONE_STYLES[item.tone] || TONE_STYLES.info}`}
          >
            <span className="mt-0.5">
              {TONE_ICONS[item.tone] || TONE_ICONS.info}
            </span>
            <div className="min-w-0 flex-1 text-start">
              {item.title && (
                <p className="text-sm font-semibold">{item.title}</p>
              )}
              {item.message && (
                <p className="text-xs text-muted">{item.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(item.id)}
              aria-label="Dismiss notification"
              className="rounded-md p-1 text-muted transition-colors hover:bg-surface-subtle hover:text-ink"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}