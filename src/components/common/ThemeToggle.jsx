import React from "react";
import useThemeMode from "../../hooks/useThemeMode";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export default function ThemeToggle({ className = "" }) {
  const { mode, computedMode, setMode } = useThemeMode();
  const theme = computedMode;

  // Cycle through: auto -> dark -> light -> auto
  const onToggle = () => {
    if (mode === "auto") setMode("dark");
    else if (mode === "dark") setMode("light");
    else setMode("auto");
  };

  return (
    <button
      onClick={onToggle}
      aria-label={`Toggle theme, current: ${mode}`}
      title={`Theme: ${mode}${mode === "auto" ? ` (computed: ${theme})` : ""}`}
      className={`flex items-center gap-2 p-2 rounded-md hover:bg-neutral transition-colors ${className}`}
    >
      <div className="relative">
        {/* Primary icon: reflects computedMode (what the UI currently shows) */}
        {theme === "dark" ? (
          <MoonIcon className="h-5 w-5 text-gray-100" />
        ) : (
          <SunIcon className="h-5 w-5 text-yellow-400" />
        )}
        {/* 'Auto' badge overlay */}
        {mode === "auto" && (
          <span className="absolute -top-2 -right-2 bg-emerald-500 text-white h-4 w-4 rounded-full text-[10px] flex items-center justify-center">
            A
          </span>
        )}
      </div>

      {/* Small text label showing active mode and computed mode when in auto */}
      <span className="hidden sm:inline text-xs text-gray-600 dark:text-gray-300">
        {mode === "auto" ? `Auto (${theme})` : mode}
      </span>
    </button>
  );
}
