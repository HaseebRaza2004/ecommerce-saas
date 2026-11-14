"use client";

export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  className = "",
}) {
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-base",
  };

  const variantStyles = {
    primary:
      "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] shadow-sm",
    secondary:
      "bg-[var(--bg-canvas)] text-[var(--text-main)] border border-[var(--border-subtle)] hover:opacity-90",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    ghost:
      "bg-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-(--brand-primary)/40 disabled:cursor-not-allowed disabled:opacity-50 ${
        sizeStyles[size] || sizeStyles.md
      } ${variantStyles[variant] || variantStyles.primary} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}