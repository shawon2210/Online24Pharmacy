import { useEffect, useState, createContext } from "react";

export const ThemeContext = createContext({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("system");
  const [resolvedTheme, setResolvedTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleSystemThemeChange = (e) => {
      if (theme === "system") {
        setResolvedTheme(e.matches ? "dark" : "light");
      }
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", handleSystemThemeChange);

    let currentTheme;
    if (theme === "system") {
      currentTheme = mediaQuery.matches ? "dark" : "light";
    } else {
      currentTheme = theme;
    }
    setResolvedTheme(currentTheme);
    
    if (theme !== "system") {
        localStorage.setItem("theme", theme);
    } else {
        localStorage.removeItem("theme");
    }

    return () =>
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    root.style.colorScheme = resolvedTheme;

    window.dispatchEvent(
      new CustomEvent("themechange", { detail: { theme: resolvedTheme } })
    );
  }, [resolvedTheme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
