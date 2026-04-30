export function Section({ title, description, actions, children, className = "", headingLevel = 2 }) {
  const Heading = `h${headingLevel}`;
  return (
    <section className={`space-y-4 ${className}`}>
      {(title || description || actions) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {title && (
              <Heading className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
                {title}
              </Heading>
            )}
            {description && (
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{description}</p>
            )}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
