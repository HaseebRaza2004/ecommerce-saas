"use client";

export default function AlertBanner({ type = "error", message, onDismiss }) {
  if (!message) return null;

  const styles = {
    error: "bg-red-50 border-red-200 text-red-800",
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-[var(--active-pill-bg)] border-[var(--border-subtle)] text-[var(--active-pill-text)]",
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs sm:text-sm ${
        styles[type] || styles.info
      }`}
    >
      <span className="font-medium leading-relaxed text-start">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close alert"
          className="ms-auto rounded-lg px-2 py-0.5 text-xs font-bold opacity-70 hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  );
}