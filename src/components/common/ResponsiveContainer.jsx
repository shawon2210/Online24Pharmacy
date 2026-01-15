export default function ResponsiveContainer({
  children,
  className = "",
  ...props
}) {
  return (
    <div
      className={`
        w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-10
        max-w-7xl
        transition-colors duration-300
        bg-background text-foreground
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
