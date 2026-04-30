export function StatGrid({ children, cols = 4, className = "" }) {
  const colClass = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4"
  }[cols] || "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid grid-cols-1 ${colClass} gap-4 ${className}`}>
      {children}
    </div>
  );
}

export function Stat({ label, value, icon, tone = "primary", hint, trend }) {
  const tones = {
    primary: "bg-[var(--primary-soft)] text-[var(--primary)]",
    teal: "bg-[var(--teal-soft)] text-[var(--teal)]",
    success: "bg-[var(--success-soft)] text-[var(--success)]",
    warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
    info: "bg-[var(--info-soft)] text-[var(--info)]",
    destructive: "bg-[var(--destructive-soft)] text-[var(--destructive)]"
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-sm)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
            {label}
          </div>
          <div className="mt-2.5 text-[1.75rem] font-bold tracking-tight text-[var(--foreground)] truncate leading-none">
            {value}
          </div>
          {hint && <div className="mt-1.5 text-xs text-[var(--muted-foreground)]">{hint}</div>}
          {trend && (
            <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--success)]">
              {trend}
            </div>
          )}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tones[tone] || tones.primary}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
