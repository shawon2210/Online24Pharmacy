import { useState, useEffect } from 'react';

export const useScrollAwareHeader = () => {
  const [headerVisible, setHeaderVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;

      setIsScrolled(currentScrollY > 50);

      console.log(`Scroll: current=${currentScrollY}, last=${lastScrollY}, delta=${scrollDelta}, headerVisible=${headerVisible}`);

      // If scrolling up, always show the header
      if (scrollDelta < 0) {
        if (!headerVisible) {
          console.log("Setting headerVisible to TRUE (scrolling up)");
          setHeaderVisible(true);
        }
      }
      // If at the very top, always show the header
      else if (currentScrollY < 100) {
        if (!headerVisible) {
          console.log("Setting headerVisible to TRUE (near top)");
          setHeaderVisible(true);
        }
      }
      // Otherwise, if scrolling down significantly, hide the header
      else if (scrollDelta > 80 && currentScrollY > 200) {
        if (headerVisible) {
          console.log("Setting headerVisible to FALSE (scrolling down)");
          setHeaderVisible(false);
        }
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [headerVisible]); // Added headerVisible to dependency array to ensure logs reflect current state

  return { headerVisible, isScrolled };
};

