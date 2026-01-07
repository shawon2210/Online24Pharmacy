/**
 * Reusable EmptyState component
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {icon && (
        <div className="text-6xl mb-4 opacity-50">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-xl font-bold text-foreground mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
