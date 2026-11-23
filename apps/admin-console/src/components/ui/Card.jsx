export function Card({ children, className = "", padded = true }) {
  return (
    <section
      className={`rounded-2xl border border-line bg-surface transition-colors ${padded ? "p-4 sm:p-5" : ""} ${className}`}
    >
      {children}
    </section>
  );
}