import { useTheme } from './useTheme';
import { useEffect, useState } from 'react';

export const useResponsiveTheme = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    theme,
    resolvedTheme,
    setTheme,
    isMobile,
    isTablet,
    isDesktop,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
  };
};
