import { Link } from "react-router-dom";

/**
 * Reusable hero button component with consistent styling
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} props.href - Link destination
 * @param {string} props.variant - Button style variant (solid, outline)
 * @param {string} props.className - Additional CSS classes
 */
export default function HeroButton({
  children,
  onClick,
  href,
  variant = "solid",
  className = "",
  ariaLabel,
}) {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold transition-all duration-300 active:scale-95 text-sm sm:text-base";

  const variantClasses = {
    solid:
      "bg-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-background shadow-lg hover:shadow-xl",
    outline:
      "bg-white/10 backdrop-blur-md border-2 border-white/30 hover:border-white/50 text-background hover:bg-white/20",
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link to={href} className={classes} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
