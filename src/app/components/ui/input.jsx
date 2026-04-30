import * as React from "react"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3.5 py-2 text-sm text-[var(--foreground)] shadow-[var(--shadow-xs)] transition-all duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--muted-foreground)]/60 hover:border-[var(--muted-foreground)]/40 focus-visible:outline-none focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]/15 focus-visible:shadow-[0_0_0_3px_rgba(30,58,95,0.08)] disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
