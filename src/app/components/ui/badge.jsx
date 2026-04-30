import * as React from "react"

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default:
      "bg-[var(--primary-soft)] text-[var(--primary)] border-[var(--primary)]/10",
    solid:
      "bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent",
    secondary:
      "bg-[var(--teal-soft)] text-[var(--teal)] border-[var(--teal)]/15",
    success:
      "bg-[var(--success-soft)] text-[var(--success)] border-[var(--success)]/15",
    warning:
      "bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning)]/15",
    info:
      "bg-[var(--info-soft)] text-[var(--info)] border-[var(--info)]/15",
    destructive:
      "bg-[var(--destructive-soft)] text-[var(--destructive)] border-[var(--destructive)]/15",
    outline:
      "text-[var(--foreground)] border-[var(--border)] bg-transparent",
  }

  return (
    <div
      ref={ref}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/30 ${variants[variant] || variants.default} ${className || ""}`}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }
