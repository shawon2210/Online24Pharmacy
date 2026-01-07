/**
 * Error Message Component
 * Displays user-friendly error messages with optional retry
 */

export default function ErrorMessage({ message, onRetry, className = '' }) {
  if (!message) return null;

  return (
    <div className={`bg-red-50 border-l-4 border-red-500 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <span className="text-red-500 text-xl mr-3 shrink-0">⚠️</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-red-700 font-medium break-words">
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-semibold transition-colors"
            >
              Try Again →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
