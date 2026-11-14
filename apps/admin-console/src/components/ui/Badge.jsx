"use client";

export default function Badge({ children, variant = "brand" }) {
  const styles = {
    brand:
      "bg-[var(--active-pill-bg)] text-[var(--active-pill-text)] border-[var(--brand-primary)]/20",
    accent:
      "bg-[var(--brand-accent)]/15 text-[var(--brand-accent)] border-[var(--brand-accent)]/30",
    success: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    danger: "bg-red-500/15 text-red-700 border-red-500/30",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        styles[variant] || styles.brand
      }`}
    >
      {children}
    </span>
  );
}