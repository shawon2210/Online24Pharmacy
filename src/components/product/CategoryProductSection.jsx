import { memo, useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import ProductCard from "./ProductCard";
import { useTranslation } from "react-i18next";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

const ensureAbsoluteImageUrl = (url) => {
  if (!url) return null;
  if (/^(https?:)?\/\//.test(url) || url.startsWith("data:")) return url;
  if (url.startsWith("/")) return `${API_URL}${url}`;
  return `${API_URL}/${url}`;
};

const CategoryProductSection = memo(({ category, index: _index }) => {
  const { t } = useTranslation();
  const sliderRef = useRef(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Update scroll button states and progress
  const updateScrollState = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const { scrollLeft, scrollWidth, clientWidth } = slider;
    setCanScrollPrev(scrollLeft > 10);
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 10);

    // Calculate scroll progress (0-100)
    const maxScroll = scrollWidth - clientWidth;
    const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
    setScrollProgress(progress);
  }, []);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    updateScrollState();
    slider.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      slider.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [category.products, updateScrollState]);

  // Enhanced scroll handler with auto-scroll prevention
  const handleScroll = useCallback(
    (direction) => {
      const slider = sliderRef.current;
      if (!slider || isAutoScrolling) return;

      setIsAutoScrolling(true);
      const containerWidth = slider.clientWidth;
      const scrollAmount =
        direction === "left" ? -containerWidth * 0.8 : containerWidth * 0.8;

      slider.scrollBy({ left: scrollAmount, behavior: "smooth" });

      setTimeout(() => setIsAutoScrolling(false), 600);
    },
    [isAutoScrolling]
  );

  if (!category || !category.products || category.products.length === 0) {
    return null;
  }

  const categoryStyles = {
    surgical: {
      accent: "from-emerald-500 to-teal-500",
      heading: "from-emerald-600 to-teal-600",
      bg: "bg-background dark:bg-background",
      glow: "",
    },
    medicines: {
      accent: "from-blue-500 to-indigo-500",
      heading: "from-blue-600 to-indigo-600",
      bg: "bg-background dark:bg-background",
      glow: "",
    },
    "wound-care": {
      accent: "from-violet-500 to-purple-500",
      heading: "from-violet-600 to-purple-600",
      bg: "bg-background dark:bg-background",
      glow: "",
    },
    default: {
      accent: "from-gray-500 to-slate-600",
      heading: "from-gray-600 to-slate-600",
      bg: "bg-background dark:bg-background",
      glow: "",
    },
  };

  const config = categoryStyles[category.slug] || categoryStyles.default;

  return (
    <section
      className={`relative w-full py-4 sm:py-6 md:py-7 lg:py-8 xl:py-10 ${config.bg} overflow-hidden transition-all duration-700`}
    >
      <div className="relative w-full px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 2xl:px-12">
        {/* Enhanced Category Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-3 sm:mb-4 md:mb-5 lg:mb-6 gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
            {/* Category Image with Enhanced Styling */}
            {category.imageUrl && (
              <div className="relative shrink-0 group/img">
                <div
                  className={`absolute -inset-1 bg-linear-to-br ${config.accent} opacity-20 dark:opacity-30 blur-md rounded-full group-hover/img:opacity-30 dark:group-hover/img:opacity-40 transition-opacity duration-300`}
                ></div>
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-full overflow-hidden bg-white dark:bg-slate-800 border-2 sm:border-3 md:border-3 border-white dark:border-slate-700 hover:shadow-lg transition-all duration-250 ring-1 ring-emerald-200/30 dark:ring-emerald-700/20">
                  <img
                    src={ensureAbsoluteImageUrl(category.imageUrl)}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${config.accent} opacity-0 group-hover/img:opacity-10 transition-opacity duration-300`}
                  ></div>
                </div>
              </div>
            )}

            {/* Title and Description */}
            <div className="min-w-0 flex-1 space-y-1 sm:space-y-1.5 md:space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  className={`text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold bg-linear-to-r ${config.heading} bg-clip-text text-transparent line-clamp-2 leading-tight tracking-tight`}
                >
                  {category.name}
                </h2>
                <span
                  className={`hidden sm:inline-flex items-center gap-1 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full bg-linear-to-r ${config.accent} text-white text-[10px] md:text-xs font-semibold`}
                >
                  <SparklesIcon className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  {category.products.length}
                </span>
              </div>
              {category.description && (
                <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed max-w-2xl">
                  {category.description}
                </p>
              )}
            </div>
          </div>

          {/* Desktop Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
            {/* Navigation Arrows */}
            <div className="hidden lg:flex items-center gap-1.5 md:gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-full p-1 border border-slate-200/50 dark:border-slate-700/50">
              <button
                onClick={() => handleScroll("left")}
                disabled={!canScrollPrev}
                className={`relative inline-flex items-center justify-center w-9 h-9 xl:w-10 xl:h-10 rounded-full transition-all duration-300 ${
                  canScrollPrev
                    ? `bg-linear-to-br ${config.accent} text-white hover:scale-105 active:scale-95`
                    : "bg-slate-100 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                }`}
                aria-label="Previous products"
              >
                <ChevronLeftIcon
                  className="w-5 h-5 xl:w-5.5 xl:h-5.5"
                  strokeWidth={2.5}
                />
              </button>
              <button
                onClick={() => handleScroll("right")}
                disabled={!canScrollNext}
                className={`relative inline-flex items-center justify-center w-9 h-9 xl:w-10 xl:h-10 rounded-full transition-all duration-300 ${
                  canScrollNext
                    ? `bg-linear-to-br ${config.accent} text-white hover:scale-105 active:scale-95`
                    : "bg-slate-100 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                }`}
                aria-label="Next products"
              >
                <ChevronRightIcon
                  className="w-5 h-5 xl:w-5.5 xl:h-5.5"
                  strokeWidth={2.5}
                />
              </button>
            </div>

            {/* View All Button */}
            <Link
              to={`/categories/${category.slug}`}
              className={`hidden sm:inline-flex group/btn relative items-center gap-1.5 md:gap-2 bg-linear-to-r ${config.accent} text-white font-semibold px-4 md:px-5 lg:px-6 py-2 md:py-2.5 rounded-full hover:scale-105 active:scale-95 overflow-hidden`}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
              <span className="relative z-10">
                {t("viewAll", { defaultValue: "View All" })}
              </span>
              <ArrowRightIcon
                className="relative z-10 w-3.5 h-3.5 md:w-4 md:h-4 group-hover/btn:translate-x-1 transition-transform duration-300"
                strokeWidth={2.5}
              />
            </Link>
          </div>
        </div>

        {/* Scroll Progress Indicator */}
        <div className="hidden md:block mb-3 lg:mb-4">
          <div className="w-full h-1 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={`h-full bg-linear-to-r ${config.accent} transition-all duration-300 ease-out rounded-full`}
              style={{ width: `${scrollProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Enhanced Products Slider */}
        <div className="relative group/slider">
          {/* Slider Track with Enhanced Styling */}
          <div
            ref={sliderRef}
            className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-3 sm:pb-4 scroll-smooth px-2 -mx-2"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {category.products.map((product, idx) => (
              <div
                key={product.id}
                className="snap-start shrink-0 w-30 xs:w-32 sm:w-34 md:w-36 lg:w-38 xl:w-40 2xl:w-44 first:ml-0 last:mr-0 transform transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 group/card"
                style={{
                  animationDelay: `${idx * 40}ms`,
                }}
              >
                <ProductCard product={product} size="carousel" />
              </div>
            ))}
          </div>

          {/* Desktop Overlay Navigation Buttons - Premium Design */}
          {canScrollPrev && (
            <button
              onClick={() => handleScroll("left")}
              className={`hidden lg:flex absolute left-2 xl:left-3 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-14 h-14 xl:w-16 xl:h-16 rounded-full bg-linear-to-br ${config.accent} text-white backdrop-blur-md transition-all duration-500 opacity-0 group-hover/slider:opacity-100 hover:scale-110 active:scale-95 border-2 border-white/30 shadow-lg hover:shadow-xl`}
              aria-label="Previous products"
            >
              <ChevronLeftIcon
                className="w-7 h-7 xl:w-8 xl:h-8"
                strokeWidth={2.5}
              />
            </button>
          )}

          {canScrollNext && (
            <button
              onClick={() => handleScroll("right")}
              className={`hidden lg:flex absolute right-2 xl:right-3 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-14 h-14 xl:w-16 xl:h-16 rounded-full bg-linear-to-br ${config.accent} text-white backdrop-blur-md transition-all duration-500 opacity-0 group-hover/slider:opacity-100 hover:scale-110 active:scale-95 border-2 border-white/30 shadow-lg hover:shadow-xl`}
              aria-label="Next products"
            >
              <ChevronRightIcon
                className="w-7 h-7 xl:w-8 xl:h-8"
                strokeWidth={2.5}
              />
            </button>
          )}
        </div>

        {/* Mobile Controls - Enhanced Design */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-5 lg:hidden">
          <button
            onClick={() => handleScroll("left")}
            disabled={!canScrollPrev}
            className={`inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-all duration-300 ${
              canScrollPrev
                ? `bg-linear-to-br ${config.accent} text-white active:scale-95`
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50"
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeftIcon
              className="w-5 h-5 sm:w-6 sm:h-6"
              strokeWidth={2.5}
            />
          </button>

          <Link
            to={`/categories/${category.slug}`}
            className={`group/mobile relative inline-flex items-center gap-2 bg-linear-to-r ${config.accent} text-white font-bold px-6 sm:px-7 py-3 sm:py-3.5 rounded-full transition-all duration-300 text-sm sm:text-base active:scale-95 overflow-hidden`}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/mobile:translate-y-0 transition-transform duration-300"></div>
            <span className="relative z-10">
              {t("viewAllInCategory", {
                category: category.name,
                defaultValue: `Explore All`,
              })}
            </span>
            <ArrowRightIcon
              className="relative z-10 w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover/mobile:translate-x-1 transition-transform duration-300"
              strokeWidth={2.5}
            />
          </Link>

          <button
            onClick={() => handleScroll("right")}
            disabled={!canScrollNext}
            className={`inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-all duration-300 ${
              canScrollNext
                ? `bg-linear-to-br ${config.accent} text-white active:scale-95`
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50"
            }`}
            aria-label="Scroll right"
          >
            <ChevronRightIcon
              className="w-5 h-5 sm:w-6 sm:h-6"
              strokeWidth={2.5}
            />
          </button>
        </div>

        {/* Mobile Progress Indicator */}
        <div className="block md:hidden mt-3 px-4">
          <div className="w-full h-1.5 bg-slate-200/60 dark:bg-slate-700/60 rounded-full overflow-hidden">
            <div
              className={`h-full bg-linear-to-r ${config.accent} transition-all duration-300 ease-out rounded-full`}
              style={{ width: `${scrollProgress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </section>
  );
});

CategoryProductSection.displayName = "CategoryProductSection";

export default CategoryProductSection;
