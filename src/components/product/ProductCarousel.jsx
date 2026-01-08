import { useEffect, useRef, useState, memo, useCallback } from "react";
import ProductCard from "./ProductCard";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const ProductCarousel = memo(({ products = [] }) => {
  const trackRef = useRef(null);
  const autoScrollRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanPrev(scrollLeft > 10);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 10);
    const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
    setScrollProgress(progress);
  }, []);

  const scroll = useCallback((dir) => {
    trackRef.current?.scrollBy({
      left: dir * (trackRef.current.clientWidth * 0.8),
      behavior: "smooth",
    });
  }, []);

  const startAutoScroll = useCallback(() => {
    if (isInteracting) return;
    autoScrollRef.current = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scroll(1);
      }
    }, 3000);
  }, [isInteracting, scroll]);

  const stopAutoScroll = useCallback(() => {
    clearInterval(autoScrollRef.current);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    updateScrollState();
    startAutoScroll();

    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      stopAutoScroll();
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [products, updateScrollState, startAutoScroll, stopAutoScroll]);

  const handleInteractionStart = () => {
    setIsInteracting(true);
    stopAutoScroll();
  };

  const handleInteractionEnd = () => {
    setIsInteracting(false);
    setTimeout(startAutoScroll, 3000);
  };

  if (!products?.length) return null;

  return (
    <div
      className="relative w-full group"
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
    >
      <div
        ref={trackRef}
        className="flex gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-3 sm:pb-4 scroll-smooth px-1 -mx-1"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {products.map((p, index) => (
          <div
            key={p.id}
            className="snap-start shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ProductCard product={p} size="carousel" />
          </div>
        ))}
      </div>

      {/* Scroll Progress Indicator */}
      <div className="hidden md:block mt-4 lg:mt-5">
        <div className="w-full h-0.5 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden">
          <div
            className={`h-full bg-linear-to-r from-emerald-500 to-teal-500 transition-all duration-300 ease-out rounded-full shadow-sm`}
            style={{ width: `${scrollProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Mobile Dots */}
      <div className="md:hidden mt-4 flex justify-center gap-2">
        {[...Array(Math.ceil(products.length / 2))].map((_, i) => {
          const isActive =
            Math.floor(
              scrollProgress / (100 / Math.ceil(products.length / 2))
            ) === i;
          return (
            <button
              key={i}
              onClick={() =>
                trackRef.current.scrollTo({
                  left: i * trackRef.current.clientWidth,
                  behavior: "smooth",
                })
              }
              className={`w-2 h-2 rounded-full transition-transform duration-300 ${
                isActive
                  ? "bg-emerald-500 scale-150"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          );
        })}
      </div>

      {canPrev && (
        <button
          onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-full p-2 shadow-lg transition-all border border-white/20 opacity-0 group-hover:opacity-100 hover:scale-110"
        >
          <ChevronLeftIcon className="w-6 h-6 text-gray-800 dark:text-white" />
        </button>
      )}
      {canNext && (
        <button
          onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-full p-2 shadow-lg transition-all border border-white/20 opacity-0 group-hover:opacity-100 hover:scale-110"
        >
          <ChevronRightIcon className="w-6 h-6 text-gray-800 dark:text-white" />
        </button>
      )}
    </div>
  );
});

ProductCarousel.displayName = "ProductCarousel";
export default ProductCarousel;
