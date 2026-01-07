export default function AnimatedButton({
  children,
  onClick,
  disabled,
  className = "",
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative w-full flex items-center justify-center py-3 px-4 transition-all duration-200 rounded-xl overflow-hidden ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {/* Decorative left circle */}
      <span className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-emerald-400 transform transition-all duration-300 group-hover:w-full"></span>

      <span
        className={`relative font-ubuntu font-bold text-base ${
          disabled ? "text-muted-foreground" : "text-background"
        }`}
      >
        {children}
      </span>

      <svg
        width="15"
        height="10"
        viewBox="0 0 13 10"
        className={`ml-3 relative transform -translate-x-1 transition-transform duration-300 ${
          disabled ? "" : "group-hover:translate-x-0"
        } stroke-current text-background`}
      >
        <path
          d="M1,5 L11,5"
          strokeWidth="2"
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="8 1 12 5 8 9"
          strokeWidth="2"
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
