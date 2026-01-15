import { useEffect, useRef, useState } from "react";

export const useScrollAwareHeader = () => {
  const [headerVisible, setHeaderVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  const headerVisibleRef = useRef(headerVisible);
  const isScrolledRef = useRef(isScrolled);

  const lastScrollYRef = useRef(0);
  const lastDirectionRef = useRef("none");
  const upAccumRef = useRef(0);
  const downAccumRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    headerVisibleRef.current = headerVisible;
  }, [headerVisible]);

  useEffect(() => {
    isScrolledRef.current = isScrolled;
  }, [isScrolled]);

  useEffect(() => {
    const TOP_SHOW_Y = 100;
    const SHADOW_Y = 50;
    const HIDE_MIN_Y = 200;
    const SHOW_UP_THRESHOLD = 28;
    const HIDE_DOWN_THRESHOLD = 80;
    const MIN_DELTA = 2;

    lastScrollYRef.current = window.scrollY || 0;

    const updateIsScrolled = (y) => {
      const next = y > SHADOW_Y;
      if (next !== isScrolledRef.current) {
        isScrolledRef.current = next;
        setIsScrolled(next);
      }
    };

    const showHeader = () => {
      if (!headerVisibleRef.current) {
        headerVisibleRef.current = true;
        setHeaderVisible(true);
      }
    };

    const hideHeader = () => {
      if (headerVisibleRef.current) {
        headerVisibleRef.current = false;
        setHeaderVisible(false);
      }
    };

    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        tickingRef.current = false;

        const currentY = window.scrollY || 0;
        const delta = currentY - lastScrollYRef.current;

        updateIsScrolled(currentY);

        if (Math.abs(delta) < MIN_DELTA) {
          lastScrollYRef.current = currentY;
          return;
        }

        // Always visible near the top.
        if (currentY < TOP_SHOW_Y) {
          showHeader();
          upAccumRef.current = 0;
          downAccumRef.current = 0;
          lastDirectionRef.current = "none";
          lastScrollYRef.current = currentY;
          return;
        }

        const direction = delta > 0 ? "down" : "up";
        if (direction !== lastDirectionRef.current) {
          upAccumRef.current = 0;
          downAccumRef.current = 0;
          lastDirectionRef.current = direction;
        }

        if (direction === "down") {
          downAccumRef.current += delta;
          if (currentY > HIDE_MIN_Y && downAccumRef.current > HIDE_DOWN_THRESHOLD) {
            hideHeader();
            downAccumRef.current = 0;
          }
        } else {
          upAccumRef.current += -delta;
          // Only show after a meaningful upward scroll, to avoid popping in instantly.
          if (!headerVisibleRef.current && upAccumRef.current > SHOW_UP_THRESHOLD) {
            showHeader();
            upAccumRef.current = 0;
          }
        }

        lastScrollYRef.current = currentY;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { headerVisible, isScrolled };
};

