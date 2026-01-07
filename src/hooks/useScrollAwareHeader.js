import { useState, useEffect } from 'react';

export const useScrollAwareHeader = () => {
  const [headerVisible, setHeaderVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let scrollTimeout = null;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;

      // Determine if scrolled down enough
      setIsScrolled(currentScrollY > 50);

      // Hide on scroll down (more than 80px delta, past 200px from top)
      if (scrollDelta > 80 && currentScrollY > 200) {
        setHeaderVisible(false);
      }
      // Show on scroll up (any upward movement)
      else if (scrollDelta < 0) {
        setHeaderVisible(true);
      }
      // Always show when at top
      else if (currentScrollY < 100) {
        setHeaderVisible(true);
      }

      lastScrollY = currentScrollY;

      // Auto-show after scrolling stops (1s inactivity)
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setHeaderVisible(true);
      }, 1000);
    };

    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  return { headerVisible, isScrolled };
};
