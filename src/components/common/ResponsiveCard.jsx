import { useResponsiveTheme } from '../../hooks/useResponsiveTheme';

export default function ResponsiveCard({ children, className = '', hover = true, ...props }) {
  const { isDark } = useResponsiveTheme();

  return (
    <div
      className={`
        w-full rounded-lg border p-4 sm:p-5 md:p-6 lg:p-7
        transition-all duration-300
        ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}
        ${hover ? (isDark ? 'hover:bg-slate-700 hover:border-slate-600' : 'hover:bg-gray-50 hover:border-gray-300') : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
