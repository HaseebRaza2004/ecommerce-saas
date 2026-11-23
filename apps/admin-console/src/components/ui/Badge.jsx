const TONES = {
  neutral: "bg-surface-subtle text-muted border-line",
  brand: "bg-brand-soft text-brand border-brand/20",
  accent: "bg-accent/12 text-accent border-accent/25",
  success: "bg-success-soft text-success border-success/25",
  warning: "bg-warning-soft text-warning border-warning/25",
  danger: "bg-danger-soft text-danger border-danger/25",
};

export function Badge({ children, tone = "neutral", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONES[tone] || TONES.neutral} ${className}`}
    >
      {children}
    </span>
  );
}