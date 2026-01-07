import { useEffect } from 'react';

export default function ThemeInitializer() {
  useEffect(() => {
    // Initialize theme on mount
    const initializeTheme = () => {
      const saved = localStorage.getItem('theme');
      const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      root.style.colorScheme = theme;
    };

    initializeTheme();

    // Listen for theme changes from other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'theme' && e.newValue) {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(e.newValue);
        root.style.colorScheme = e.newValue;
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return null;
}
