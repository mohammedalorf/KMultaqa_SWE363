export function PageContainer({ children, className = "", size = "default" }) {
  const maxWidth = size === "narrow" ? "max-w-3xl" : size === "wide" ? "max-w-7xl" : "max-w-6xl";
  return (
    <div className={`${maxWidth} mx-auto w-full space-y-6 ${className}`}>
      {children}
    </div>
  );
}
