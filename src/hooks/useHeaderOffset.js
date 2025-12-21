import { useState, useLayoutEffect } from "react";

/**
 * Custom hook to calculate header height dynamically
 * Used for proper page spacing with sticky headers
 * 
 * @returns {number} Header height in pixels
 */
export function useHeaderOffset() {
  const [headerOffset, setHeaderOffset] = useState(0);

  useLayoutEffect(() => {
    const el = document.querySelector("header");
    if (!el) return;

    const compute = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      setHeaderOffset(h);
    };

    compute();
    window.addEventListener("resize", compute, { passive: true });
    return () => window.removeEventListener("resize", compute);
  }, []);

  return headerOffset;
}
