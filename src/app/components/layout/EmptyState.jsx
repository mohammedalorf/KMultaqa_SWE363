export function EmptyState({ icon, title, description, action, className = "" }) {
  return (
    <div className={`rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] py-14 px-6 text-center flex flex-col items-center ${className}`}>
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-[15px] font-semibold text-[var(--foreground)]">{title}</h3>
      )}
      {description && (
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-[var(--muted-foreground)] leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
