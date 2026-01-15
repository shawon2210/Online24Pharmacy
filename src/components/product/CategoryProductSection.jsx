import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import ProductCard from "./ProductCard";
import { useTranslation } from "react-i18next";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

// Fallback image for category cards when imageUrl is missing
const FALLBACK_CATEGORY_CARD =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='240' viewBox='0 0 600 240'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%2310b981'/%3E%3Cstop offset='100%25' stop-color='%2306b6d4'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='600' height='240' fill='url(%23g)'/%3E%3C/svg%3E";

const ensureAbsoluteImageUrl = (url) => {
  if (!url) return null;
  // Remove curly braces if present (fixes {https://...} bug)
  if (typeof url === "string" && url.startsWith("{") && url.endsWith("}")) {
    url = url.slice(1, -1);
  }
  if (/^(https?:)?\/\//.test(url) || url.startsWith("data:")) return url;
  if (url.startsWith("/")) return `${API_URL}${url}`;
  return `${API_URL}/${url}`;
};

// Pre-defined category styles - memoized outside component for performance
const CATEGORY_STYLES = {
  surgical: {
    accent: "from-emerald-500 to-teal-500",
    heading: "from-emerald-600 to-teal-600",
  },
  medicines: {
    accent: "from-blue-500 to-indigo-500",
    heading: "from-blue-600 to-indigo-600",
  },
  "wound-care": {
    accent: "from-violet-500 to-purple-500",
    heading: "from-violet-600 to-purple-600",
  },
  default: {
    accent: "from-emerald-500 to-cyan-500",
    heading: "from-emerald-600 to-cyan-600",
  },
};

export default function CategoryProductSection({ category, index: _index }) {
  const { t } = useTranslation();
  const sliderRef = useRef(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  // Memoize config to prevent recalculation
  const config = useMemo(
    () => CATEGORY_STYLES[category?.slug] || CATEGORY_STYLES.default,
    [category?.slug]
  );

  // Optimized scroll state update with RAF
  const updateScrollState = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const { scrollLeft, scrollWidth, clientWidth } = slider;
    setCanScrollPrev(scrollLeft > 5);
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 5);
  }, []);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    updateScrollState();
    const handleScroll = () => requestAnimationFrame(updateScrollState);
    slider.addEventListener("scroll", handleScroll, { passive: true });

    // ResizeObserver for responsive updates
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(slider);

    return () => {
      slider.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, [updateScrollState]);

  // Optimized scroll handler
  const handleScroll = useCallback((direction) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const scrollAmount = slider.clientWidth * 0.85;
    slider.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  // Early return for empty categories
  if (!category?.products?.length) return null;

  const productCount = category.products.length;

  return (
    <section className="w-full py-3 sm:py-4 md:py-5 lg:py-6 bg-background">
      <div className="w-full px-3 sm:px-4 md:px-5 lg:px-6">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-2.5 sm:mb-3 md:mb-4 gap-2">
          {/* Left: Category Info */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            {/* Category Image */}
            {category.imageUrl && (
              <div className="shrink-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full overflow-hidden bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 shadow-sm">
                  <img
                    src={
                      ensureAbsoluteImageUrl(category.imageUrl) ||
                      FALLBACK_CATEGORY_CARD
                    }
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      if (e.currentTarget.src !== FALLBACK_CATEGORY_CARD) {
                        e.currentTarget.src = FALLBACK_CATEGORY_CARD;
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Title & Count */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  className={`text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-linear-to-r ${config.heading} bg-clip-text text-transparent truncate`}
                >
                  {category.name}
                </h2>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full bg-linear-to-r ${config.accent} text-white text-[10px] sm:text-xs font-semibold`}
                >
                  {productCount}
                </span>
              </div>
              {category.description && (
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 mt-0.5">
                  {category.description}
                </p>
              )}
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-full p-0.5">
              <button
                onClick={() => handleScroll("left")}
                disabled={!canScrollPrev}
                className={`w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center transition-all ${
                  canScrollPrev
                    ? `bg-linear-to-br ${config.accent} text-white hover:opacity-90`
                    : "text-slate-400 cursor-not-allowed"
                }`}
                aria-label="Previous"
              >
                <ChevronLeftIcon
                  className="w-4 h-4 lg:w-5 lg:h-5"
                  strokeWidth={2.5}
                />
              </button>
              <button
                onClick={() => handleScroll("right")}
                disabled={!canScrollNext}
                className={`w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center transition-all ${
                  canScrollNext
                    ? `bg-linear-to-br ${config.accent} text-white hover:opacity-90`
                    : "text-slate-400 cursor-not-allowed"
                }`}
                aria-label="Next"
              >
                <ChevronRightIcon
                  className="w-4 h-4 lg:w-5 lg:h-5"
                  strokeWidth={2.5}
                />
              </button>
            </div>

            {/* View All Button */}
            <Link
              to={`/categories/${category.slug}`}
              className={`inline-flex items-center gap-1 sm:gap-1.5 bg-linear-to-r ${config.accent} text-white font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm hover:opacity-90 active:scale-95 transition-all`}
            >
              <span className="hidden xs:inline">
                {t("viewAll", { defaultValue: "View All" })}
              </span>
              <span className="xs:hidden">All</span>
              <ArrowRightIcon
                className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                strokeWidth={2.5}
              />
            </Link>
          </div>
        </div>

        {/* Products Slider */}
        <div className="relative group/slider">
          <div
            ref={sliderRef}
            className="flex gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth px-0 sm:px-1 -mx-2 sm:-mx-1 pb-3 sm:pb-4"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-x",
            }}
          >
            {category.products.map((product) => (
              <div
                key={product.id}
                className="snap-start shrink-0 w-[80vw] xs:w-[42vw] sm:w-[26vw] md:w-[19vw] lg:w-[15vw] xl:w-[12vw] max-w-45 sm:max-w-55 md:max-w-65 px-0.5"
              >
                <ProductCard product={product} size="carousel" />
              </div>
            ))}
          </div>

          {/* Hover Navigation Arrows - Desktop Only */}
          {canScrollPrev && (
            <button
              onClick={() => handleScroll("left")}
              className={`hidden lg:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 xl:w-11 xl:h-11 rounded-full bg-linear-to-br ${config.accent} text-white opacity-0 group-hover/slider:opacity-100 hover:scale-105 active:scale-95 transition-all shadow-lg`}
              aria-label="Previous"
            >
              <ChevronLeftIcon className="w-5 h-5" strokeWidth={2.5} />
            </button>
          )}
          {canScrollNext && (
            <button
              onClick={() => handleScroll("right")}
              className={`hidden lg:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 xl:w-11 xl:h-11 rounded-full bg-linear-to-br ${config.accent} text-white opacity-0 group-hover/slider:opacity-100 hover:scale-105 active:scale-95 transition-all shadow-lg`}
              aria-label="Next"
            >
              <ChevronRightIcon className="w-5 h-5" strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center justify-center gap-3 mt-2.5 sm:mt-3 md:hidden">
          <button
            onClick={() => handleScroll("left")}
            disabled={!canScrollPrev}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              canScrollPrev
                ? `bg-linear-to-br ${config.accent} text-white active:scale-95`
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
            }`}
            aria-label="Previous"
          >
            <ChevronLeftIcon className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <button
            onClick={() => handleScroll("right")}
            disabled={!canScrollNext}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              canScrollNext
                ? `bg-linear-to-br ${config.accent} text-white active:scale-95`
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
            }`}
            aria-label="Next"
          >
            <ChevronRightIcon className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </section>
  );
}
