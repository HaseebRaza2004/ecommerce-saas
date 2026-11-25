"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Dropdown({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  icon: Icon,
  size = "md",
  align = "end",
  error,
  className = "",
}) {
  const id = useId();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);

  const selected = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target))
        setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const isCompact = size === "sm";

  return (
    <div
      ref={rootRef}
      className={`relative flex flex-col gap-1.5 text-start ${className}`}
    >
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-ink">
          {label}
        </label>
      )}
      <Button
        id={id}
        variant="secondary"
        size={isCompact ? "sm" : "md"}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`justify-between font-normal ${isCompact ? "h-8 px-2.5 text-xs" : "w-full px-3.5 text-sm"} ${error ? "border-danger" : ""}`}
      >
        <span className="flex min-w-0 items-center gap-2">
          {Icon && (
            <Icon className="size-3.5 shrink-0 text-muted" aria-hidden="true" />
          )}
          <span className="truncate font-medium text-ink">
            {selected ? selected.shortLabel || selected.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={`size-3.5 shrink-0 text-muted transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </Button>

      {open && (
        <div
          role="listbox"
          className={`animate-fade-in absolute top-full z-50 mt-1.5 max-h-60 min-w-44 overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-xl ${isCompact ? "" : "w-full"} ${align === "start" ? "inset-s-0" : "inset-e-0"}`}
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <Button
                key={opt.value}
                role="option"
                aria-selected={active}
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full justify-between rounded-lg px-2.5 py-2 text-start text-xs ${
                  active
                    ? "bg-brand-soft font-semibold text-brand hover:bg-brand-soft"
                    : "text-ink"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  {opt.swatches && (
                    <span className="flex shrink-0 items-center gap-0.5">
                      {opt.swatches.slice(0, 2).map((hex) => (
                        <span
                          key={hex}
                          className="size-2.5 rounded-full border border-black/10"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </span>
                  )}
                  <span className="truncate">{opt.label}</span>
                </span>
                {active && <Check className="size-3.5 shrink-0 text-brand" />}
              </Button>
            );
          })}
        </div>
      )}
      {error && (
        <p role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}