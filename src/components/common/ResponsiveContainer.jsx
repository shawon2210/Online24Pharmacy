import { useResponsiveTheme } from '../../hooks/useResponsiveTheme';

export default function ResponsiveContainer({ children, className = '', ...props }) {
  const { isDark } = useResponsiveTheme();

  return (
    <div
      className={`
        w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-10
        max-w-7xl
        transition-colors duration-300
        ${isDark ? 'bg-slate-900' : 'bg-white'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
