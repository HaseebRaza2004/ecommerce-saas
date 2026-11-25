"use client";

import { getPasswordStrength } from "@/lib/authValidators";

const BAR_COLORS = [
  "bg-danger",
  "bg-warning",
  "bg-accent",
  "bg-success",
];

export function PasswordStrengthBar({ password }) {
  if (!password) return null;
  const { score, label } = getPasswordStrength(password);

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={`h-1 rounded-full transition-colors ${
              step <= score ? BAR_COLORS[score - 1] : "bg-surface-subtle"
            }`}
          />
        ))}
      </div>
      <p className="text-start text-[11px] text-muted">
        Password strength: <span className="font-medium text-ink">{label}</span>
      </p>
    </div>
  );
}