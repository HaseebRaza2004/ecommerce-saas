"use client";

import { useId } from "react";

export default function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = "",
  required = false,
  autoComplete,
  maxLength,
  className = "",
}) {
  const inputId = useId();

  return (
    <div className={`w-full text-start ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-xs font-semibold text-(--text-main)"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-xl border bg-(--bg-card) ps-3.5 pe-3.5 py-2.5 text-sm text-(--text-main) placeholder-(--text-muted)/60 transition focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:ring-red-500/30"
            : "border-(--border-subtle) focus:border-(--brand-primary) focus:ring-(--brand-primary)/20"
        }`}
      />
      {error && (
        <p role="alert" className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}