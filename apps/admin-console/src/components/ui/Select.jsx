"use client";

import { useId } from "react";

export default function Select({
  label,
  value,
  onChange,
  options = [],
  required = false,
  className = "",
}) {
  const selectId = useId();

  return (
    <div className={`w-full text-start ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-xs font-semibold text-(--text-main)"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-(--border-subtle) bg-(--bg-card) ps-3.5 pe-3.5 py-2.5 text-sm text-(--text-main) transition focus:border-(--brand-primary) focus:outline-none focus:ring-2 focus:ring-(--brand-primary)/20"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}