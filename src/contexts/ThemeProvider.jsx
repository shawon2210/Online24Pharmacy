import { useEffect, useMemo, useState } from "react";
import { ThemeContext } from "./themeContext";

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    return saved && ["light", "dark", "system"].includes(saved)
      ? saved
      : "system";
  });
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setSystemPrefersDark(e.matches);
    mediaQuery.addEventListener("change", handler);

    // Listen for theme changes from other tabs/windows and update state
    const handleStorage = (e) => {
      if (e.key !== "theme") return;
      const val = e.newValue;
      if (val === "light" || val === "dark" || val === "system") {
        setTheme(val);
      } else if (val === null) {
        // removed -> revert to system
        setTheme("system");
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      mediaQuery.removeEventListener("change", handler);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const resolvedTheme = useMemo(
    () => (theme === "system" ? (systemPrefersDark ? "dark" : "light") : theme),
    [theme, systemPrefersDark]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (theme !== "system") {
      localStorage.setItem("theme", theme);
    } else {
      localStorage.removeItem("theme");
    }
  }, [theme]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    root.style.colorScheme = resolvedTheme;

    window.dispatchEvent(
      new CustomEvent("themechange", { detail: { theme: resolvedTheme } })
    );
  }, [resolvedTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
