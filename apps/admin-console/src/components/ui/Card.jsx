"use client";

export default function Card({
  title,
  subtitle,
  action,
  children,
  className = "",
}) {
  return (
    <section
      className={`rounded-2xl border border-(--border-subtle) bg-(--bg-card) p-5 sm:p-6 shadow-xs text-start ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-(--border-subtle) pb-3.5">
          <div>
            {title && (
              <h2 className="heading-fluid font-bold text-(--text-main)">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-(--text-muted)">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}