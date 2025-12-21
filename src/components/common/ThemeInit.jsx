import { useEffect } from "react";

export default function ThemeInit() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "dark") document.documentElement.classList.add("dark");
      else if (stored === "light")
        document.documentElement.classList.remove("dark");
      else {
        const prefers =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (prefers) document.documentElement.classList.add("dark");
      }
    } catch {
      // localStorage might not be available
    }
  }, []);
  return null;
}
