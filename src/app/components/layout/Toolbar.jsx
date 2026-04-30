export function Toolbar({ children, className = "" }) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-[var(--shadow-xs)] sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      {children}
    </div>
  );
}

export function ToolbarGroup({ children, className = "" }) {
  return <div className={`flex flex-wrap items-center gap-2 ${className}`}>{children}</div>;
}
