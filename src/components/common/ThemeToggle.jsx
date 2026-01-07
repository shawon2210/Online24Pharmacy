import { useTheme } from '../../hooks/useTheme';
import { useResponsiveTheme } from '../../hooks/useResponsiveTheme';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useCallback } from 'react';

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { isMobile } = useResponsiveTheme();

  const cycleTheme = useCallback(() => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  }, [theme, setTheme]);

  const currentIcon = resolvedTheme === 'dark' ? (
    <MoonIcon className="w-5 h-5 text-indigo-400" />
  ) : (
    <SunIcon className="w-5 h-5 text-yellow-500" />
  );

  const nextThemeLabel =
    theme === 'light' ? 'Dark Mode' : theme === 'dark' ? 'System Theme' : 'Light Mode';

  const nextThemeIcon = 
    theme === 'light' ? <MoonIcon className="w-4 h-4" /> :
    theme === 'dark' ? <ComputerDesktopIcon className="w-4 h-4" /> :
    <SunIcon className="w-4 h-4" />;

  return (
    <button
      onClick={cycleTheme}
      className={`
        group relative flex items-center justify-center
        ${isMobile ? 'w-10 h-10' : 'w-11 h-11'}
        rounded-2xl transition-all duration-300
        hover:scale-110 active:scale-95
        focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400
        bg-muted border border-border text-foreground
      `}
      aria-label={`Switch to ${nextThemeLabel}`}
      title={`Current: ${resolvedTheme === 'dark' ? 'Dark' : 'Light'} Mode (Preference: ${theme})`}
    >
      {currentIcon}
      {!isMobile && (
        <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 px-2.5 py-1 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl bg-card border border-border text-foreground flex items-center gap-1">
          {nextThemeIcon} {nextThemeLabel}
        </span>
      )}
    </button>
  );
}
