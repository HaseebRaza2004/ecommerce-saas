"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui/Button";

export function Input({
  label,
  error,
  hint,
  icon: Icon,
  type = "text",
  variant = "default",
  forceLtr = false,
  className = "",
  ...props
}) {
  const id = useId();
  const { dir } = useLocale();
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const resolvedType = isPassword && showPassword ? "text" : type;
  const inputDir = forceLtr ? "ltr" : dir;

  if (variant === "ghost") {
    return (
      <input
        id={id}
        type={resolvedType}
        dir={inputDir}
        className={`w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-hidden ${className}`}
        {...props}
      />
    );
  }

  return (
    <div className="flex flex-col gap-1.5 text-start">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-ink">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <Icon
            className="pointer-events-none absolute inset-s-3.5 size-4 shrink-0 text-muted"
            aria-hidden="true"
          />
        )}
        <input
          id={id}
          type={resolvedType}
          dir={inputDir}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${id}-err` : hint ? `${id}-hint` : undefined
          }
          className={`h-10 w-full rounded-xl border bg-surface text-sm text-ink transition-colors placeholder:text-muted/70 focus-visible:border-brand focus-visible:outline-2 focus-visible:outline-brand/20 disabled:cursor-not-allowed disabled:opacity-60 ${Icon ? "ps-10" : "ps-3.5"} ${isPassword ? "pe-10" : "pe-3.5"} ${error ? "border-danger focus-visible:border-danger" : "border-line"} ${className}`}
          {...props}
        />
        {isPassword && (
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-e-1.5"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </Button>
        )}
      </div>
      {error && (
        <p
          id={`${id}-err`}
          role="alert"
          className="text-xs font-medium text-danger"
        >
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
};