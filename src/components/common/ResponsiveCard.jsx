export default function ResponsiveCard({
  children,
  className = "",
  hover = true,
  ...props
}) {
  return (
    <div
      className={`
        w-full rounded-lg border p-4 sm:p-5 md:p-6 lg:p-7
        transition-all duration-300
        bg-card border-border
        ${hover ? "hover:bg-muted/60 hover:border-muted-foreground/30" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
