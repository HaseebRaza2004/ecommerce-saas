"use client";

export default function SlideDrawer({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="no-print fixed inset-0 z-50 flex items-end justify-end bg-black/40 backdrop-blur-xs md:items-stretch"
    >
      <div onClick={onClose} className="fixed inset-0" aria-hidden="true" />
      <div className="relative z-10 flex max-h-[82vh] w-full flex-col overflow-y-auto rounded-t-2xl border-t border-(--border-subtle) bg-(--bg-card) p-6 shadow-2xl md:max-h-screen md:max-w-md md:rounded-none md:border-t-0 md:border-s">
        <div className="mb-5 flex items-center justify-between border-b border-(--border-subtle) pb-3">
          <h3 className="text-base font-bold text-(--text-main)">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="rounded-lg border border-(--border-subtle) px-2.5 py-1 text-xs font-bold text-(--text-muted) hover:text-(--text-main)"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 text-start">{children}</div>
      </div>
    </div>
  );
}