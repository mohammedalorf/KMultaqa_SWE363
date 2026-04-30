export function DataTable({ children, className = "" }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-xs)] ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </div>
  );
}

export function DataTableHead({ children }) {
  return (
    <thead className="sticky top-0 bg-[var(--muted)]">
      <tr className="border-b border-[var(--border)]">{children}</tr>
    </thead>
  );
}

export function DataTh({ children, align = "left", className = "" }) {
  const alignClass = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return (
    <th className={`${alignClass} px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] ${className}`}>
      {children}
    </th>
  );
}

export function DataTableBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function DataTr({ children, className = "" }) {
  return (
    <tr className={`border-b border-[var(--border)] last:border-0 hover:bg-[var(--accent)]/40 transition-colors ${className}`}>
      {children}
    </tr>
  );
}

export function DataTd({ children, align = "left", className = "", ...props }) {
  const alignClass = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return (
    <td className={`${alignClass} px-4 py-3 text-sm text-[var(--foreground)] ${className}`} {...props}>
      {children}
    </td>
  );
}
