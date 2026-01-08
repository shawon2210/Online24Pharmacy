import { useResponsiveTheme } from "../../hooks/useResponsiveTheme";

export default function ResponsiveGrid({
  children,
  cols: _cols = 4,
  className = "",
  ...props
}) {
  const { isMobile, isTablet } = useResponsiveTheme();

  let gridCols = "grid-cols-4";
  if (isMobile) gridCols = "grid-cols-1";
  else if (isTablet) gridCols = "grid-cols-2";

  return (
    <div
      className={`
        grid ${gridCols} gap-4 sm:gap-5 md:gap-6 lg:gap-7
        transition-all duration-300
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
