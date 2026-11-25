"use client";

import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-brand text-brand-ink hover:bg-brand-hover border-transparent shadow-xs",
  secondary: "bg-surface text-ink border-line hover:bg-surface-subtle",
  ghost:
    "bg-transparent text-muted border-transparent hover:bg-surface-subtle hover:text-ink",
  danger: "bg-danger text-white border-transparent hover:opacity-90",
  dangerGhost:
    "bg-transparent text-muted border-line hover:border-danger/30 hover:bg-danger-soft hover:text-danger",
  soft: "bg-brand-soft text-brand border-transparent hover:opacity-90",
  sidebarGhost:
    "bg-transparent text-sidebar-muted border-transparent hover:bg-white/10 hover:text-white",
  link: "bg-transparent text-muted border-transparent hover:text-ink px-0 h-auto",
};

const SIZES = {
  xs: "h-7 px-2.5 text-xs rounded-lg gap-1.5",
  sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm rounded-xl gap-2",
  lg: "h-11 px-5 text-sm rounded-xl gap-2",
  icon: "size-9 p-0 rounded-xl",
  iconSm: "size-8 p-0 rounded-lg",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  type = "button",
  className = "",
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`inline-flex cursor-pointer items-center justify-center border font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant] || VARIANTS.primary} ${variant === "link" ? "" : SIZES[size] || SIZES.md} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {loading && (
        <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />
      )}
      {children}
    </button>
  );
};