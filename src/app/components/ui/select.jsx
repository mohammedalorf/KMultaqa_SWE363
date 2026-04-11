import * as React from "react";

function getDisplayName(type) {
  return type?.displayName || type?.name || "";
}

function collectSelectParts(children, parts = { items: [], placeholder: "", triggerProps: {} }) {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    const displayName = getDisplayName(child.type);

    if (displayName === "SelectTrigger") {
      parts.triggerProps = { ...parts.triggerProps, ...child.props };
      collectSelectParts(child.props.children, parts);
      return;
    }

    if (displayName === "SelectValue") {
      if (child.props.placeholder) parts.placeholder = child.props.placeholder;
      return;
    }

    if (displayName === "SelectContent") {
      collectSelectParts(child.props.children, parts);
      return;
    }

    if (displayName === "SelectItem") {
      parts.items.push({
        value: child.props.value ?? "",
        label: child.props.children,
        disabled: child.props.disabled ?? false,
      });
      return;
    }

    if (child.props?.children) {
      collectSelectParts(child.props.children, parts);
    }
  });

  return parts;
}

const Select = React.forwardRef(
  (
    {
      children,
      className = "",
      onValueChange,
      onChange,
      value,
      defaultValue,
      disabled,
      ...props
    },
    ref
  ) => {
    const { items, placeholder, triggerProps } = collectSelectParts(children);
    const resolvedClassName =
      triggerProps.className ||
      `flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`;

    return (
      <select
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled ?? triggerProps.disabled}
        className={`${resolvedClassName} ${className}`.trim()}
        onChange={(event) => {
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
        {...triggerProps}
        {...props}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {items.map((item) => (
          <option key={item.value} value={item.value} disabled={item.disabled}>
            {item.label}
          </option>
        ))}
      </select>
    );
  }
);
Select.displayName = "Select";

const SelectTrigger = React.forwardRef(({ children }) => children ?? null);
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef(() => null);
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef(() => null);
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef(() => null);
SelectItem.displayName = "SelectItem";

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`py-1.5 pl-8 pr-2 text-sm font-semibold ${className || ""}`} {...props} />
));
SelectLabel.displayName = "SelectLabel";

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`-mx-1 my-1 h-px bg-muted ${className || ""}`} {...props} />
));
SelectSeparator.displayName = "SelectSeparator";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectLabel, SelectSeparator };
