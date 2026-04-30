import * as React from "react";
import { X } from "lucide-react";

const DialogContext = React.createContext(null);

function useDialogContext() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within <Dialog>");
  }
  return context;
}

const Dialog = ({ open, onOpenChange, children }) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const setOpen = (nextOpen) => {
    if (!isControlled) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  return <DialogContext.Provider value={{ open: isOpen, setOpen }}>{children}</DialogContext.Provider>;
};

const DialogTrigger = ({ asChild = false, children, ...props }) => {
  const { setOpen } = useDialogContext();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: (e) => {
        children.props.onClick?.(e);
        setOpen(true);
      }
    });
  }

  return (
    <button type="button" onClick={() => setOpen(true)} {...props}>
      {children}
    </button>
  );
};

const DialogContent = ({ children, className, ...props }) => {
  const { open, setOpen } = useDialogContext();

  React.useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-[var(--foreground)]/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative bg-[var(--card)] rounded-xl shadow-[var(--shadow-lg)] border border-[var(--border)] max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          aria-label="Close dialog"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 z-10 w-7 h-7 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/30"
        >
          <X className="h-4 w-4" />
        </button>
        <div className={`p-6 ${className || ""}`} {...props}>
          {children}
        </div>
      </div>
    </div>
  );
};

const DialogHeader = ({ children, className, ...props }) => (
  <div className={`mb-4 ${className || ""}`} {...props}>
    {children}
  </div>
);

const DialogTitle = ({ children, className, ...props }) => (
  <h2 className={`text-lg font-semibold ${className || ""}`} {...props}>
    {children}
  </h2>
);

const DialogFooter = ({ children, className, ...props }) => (
  <div className={`flex justify-end gap-2 mt-6 ${className || ""}`} {...props}>
    {children}
  </div>
);

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter };
