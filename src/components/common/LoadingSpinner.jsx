/**
 * Reusable loading spinner component
 * @param {Object} props - Component props
 * @param {string} props.size - Spinner size (sm, md, lg)
 * @param {string} props.text - Loading text
 */
export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} border-emerald-600 border-t-transparent rounded-full animate-spin`}
      />
      {text && (
        <p className="text-sm text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );
}
