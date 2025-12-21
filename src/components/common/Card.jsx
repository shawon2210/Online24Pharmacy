/**
 * Reusable Card component
 */
export default function Card({
  children,
  title,
  subtitle,
  footer,
  padding = 'md',
  className = '',
  ...props
}) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  return (
    <div
      className={`card ${paddings[padding]} ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-xl font-bold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      <div>{children}</div>
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
}
