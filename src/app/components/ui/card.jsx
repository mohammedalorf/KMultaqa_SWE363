import React from "react";

export function Card({
  children,
  className = "",
  interactive = false,
  ...props
}) {
  return (
    <div
      className={`rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-[var(--shadow-sm)] ${
        interactive ? "transition-all duration-150 hover:shadow-[var(--shadow-md)] hover:border-[var(--accent-foreground)]/15" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
