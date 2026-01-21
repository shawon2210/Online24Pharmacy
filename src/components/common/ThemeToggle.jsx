import { useTheme } from "../../hooks/useTheme";
import { useResponsiveTheme } from "../../hooks/useResponsiveTheme";
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import { useCallback } from "react";

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { isMobile } = useResponsiveTheme();

  const cycleTheme = useCallback(() => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  }, [theme, setTheme]);

  const currentIcon =
    resolvedTheme === "dark" ? (
      <MoonIcon className="w-4.5 h-4.5 lg:w-4 lg:h-4 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
    ) : (
      <SunIcon className="w-4.5 h-4.5 lg:w-4 lg:h-4 text-yellow-500 group-hover:scale-110 transition-transform duration-300" />
    );

  const nextThemeLabel =
    theme === "light"
      ? "Dark Mode"
      : theme === "dark"
        ? "System Theme"
        : "Light Mode";

  const nextThemeIcon =
    theme === "light" ? (
      <MoonIcon className="w-3.5 h-3.5" />
    ) : theme === "dark" ? (
      <ComputerDesktopIcon className="w-3.5 h-3.5" />
    ) : (
      <SunIcon className="w-3.5 h-3.5" />
    );

  return (
    <button
      onClick={cycleTheme}
      className={`group relative flex items-center justify-center w-10 h-10 lg:w-9 lg:h-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:from-indigo-50 hover:to-indigo-100 dark:hover:from-indigo-900/20 dark:hover:to-indigo-800/20 hover:shadow-lg hover:shadow-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2`}
      aria-label={`Switch to ${nextThemeLabel}`}
      title={`Current: ${resolvedTheme === "dark" ? "Dark" : "Light"} Mode (Preference: ${theme})`}
    >
      <div className="relative">
        {currentIcon}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-400/0 to-indigo-500/0 group-hover:from-indigo-400/10 group-hover:to-indigo-500/10 transition-all duration-300" />
      </div>
      {!isMobile && (
        <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-1.5">
          {nextThemeIcon} {nextThemeLabel}
        </span>
      )}
    </button>
  );
}
