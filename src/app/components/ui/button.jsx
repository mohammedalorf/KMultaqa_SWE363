import React from "react";

export function Button({
  children,
  className = "",
  variant = "default",
  size = "md",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium tracking-[-0.01em] rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap";

  const variants = {
    default:
      "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-xs)] hover:bg-[var(--primary-hover)] active:translate-y-[0.5px]",
    secondary:
      "bg-[var(--teal)] text-white shadow-[var(--shadow-xs)] hover:brightness-[0.95] active:translate-y-[0.5px]",
    outline:
      "border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] hover:border-[var(--accent-foreground)]/20",
    ghost:
      "bg-transparent text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
    subtle:
      "bg-[var(--primary-soft)] text-[var(--primary)] hover:bg-[var(--accent)]",
    destructive:
      "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:brightness-[0.95]",
    link:
      "text-[var(--primary)] underline-offset-4 hover:underline p-0 h-auto",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-sm",
    xl: "h-12 px-6 text-base",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
