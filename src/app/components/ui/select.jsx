import * as React from "react"

const Select = React.forwardRef(({ children, ...props }, ref) => (
  <select
    ref={ref}
    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    {...props}
  >
    {children}
  </select>
))
Select.displayName = "Select"

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <button
    type="button"
    ref={ref}
    className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
    {...props}
  >
    {children}
  </button>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef(({ className, ...props }, ref) => (
  <span ref={ref} className={className} {...props} />
))
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={`relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 ${className || ""}`}
    {...props}
  >
    {children}
  </div>
))
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className || ""}`}
    {...props}
  >
    {children}
  </div>
))
SelectItem.displayName = "SelectItem"

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`py-1.5 pl-8 pr-2 text-sm font-semibold ${className || ""}`}
    {...props}
  />
))
SelectLabel.displayName = "SelectLabel"

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`-mx-1 my-1 h-px bg-muted ${className || ""}`}
    {...props}
  />
))
SelectSeparator.displayName = "SelectSeparator"

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
}