import * as React from "react"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={`flex min-h-[96px] w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3.5 py-2.5 text-sm text-[var(--foreground)] shadow-[var(--shadow-xs)] transition-colors placeholder:text-[var(--muted-foreground)] hover:border-[var(--muted-foreground)]/40 focus-visible:outline-none focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
