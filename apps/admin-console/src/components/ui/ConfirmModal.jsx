"use client";

import Button from "@/components/ui/Button";

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-2xl border border-(--border-subtle) bg-(--bg-card) p-6 shadow-2xl text-start">
        <h3 className="text-base font-bold text-(--text-main)">{title}</h3>
        <p className="mt-2 text-xs leading-relaxed text-(--text-muted)">
          {description}
        </p>
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="danger"
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