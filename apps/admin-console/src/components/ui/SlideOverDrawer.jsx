"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export function SlideOverDrawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close panel backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
      />
      <aside className="animate-drawer-in relative z-10 flex h-full w-full max-w-xl flex-col border-s border-line bg-surface shadow-2xl lg:w-[40vw] lg:min-w-110">
        <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4 text-start">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-ink">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-subtle hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <footer className="border-t border-line bg-surface-subtle/50 px-5 py-3.5">
            {footer}
          </footer>
        )}
      </aside>
    </div>
  );
}