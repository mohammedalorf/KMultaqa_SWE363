import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export function PageHeader({ title, subtitle, actions, breadcrumbs, eyebrow }) {
  return (
    <div className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 flex-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] mb-2" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <span key={`${crumb.label}-${idx}`} className="inline-flex items-center gap-1.5">
                  {crumb.to && !isLast ? (
                    <Link to={crumb.to} className="hover:text-[var(--foreground)] transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLast ? "text-[var(--foreground)] font-medium" : ""}>{crumb.label}</span>
                  )}
                  {!isLast && <ChevronRight className="w-3 h-3 opacity-50" />}
                </span>
              );
            })}
          </nav>
        )}
        {eyebrow && (
          <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--teal)] mb-2">
            {eyebrow}
          </div>
        )}
        <h1 className="text-[1.75rem] sm:text-[2rem] font-bold tracking-tight text-[var(--foreground)] leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-sm text-[var(--muted-foreground)] max-w-2xl">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
