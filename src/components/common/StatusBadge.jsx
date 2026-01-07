/**
 * Reusable status badge component
 */

const colorMap = {
  amber: "bg-amber-50 text-amber-600 border-amber-200",
  blue: "bg-emerald-50 text-emerald-600 border-emerald-200",
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
  green: "bg-green-50 text-green-600 border-green-200",
  red: "bg-red-50 text-red-600 border-red-200",
  purple: "bg-purple-50 text-purple-600 border-purple-200",
  orange: "bg-orange-50 text-orange-600 border-orange-200",
  gray: "bg-background text-muted-foreground border-border",
};

export default function StatusBadge({
  label,
  color = "gray",
  icon,
  size = "md",
  className = "",
}) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold border-2 ${colorMap[color]} ${sizeClasses[size]} ${className}`}
    >
      {icon && <span>{icon}</span>}
      {label}
    </span>
  );
}
