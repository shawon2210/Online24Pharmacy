import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRightIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

const keys = [
  "hero.dynamic.dgda",
  "hero.dynamic.surgical",
  "hero.dynamic.verified",
  "hero.dynamic.essentials",
];
const images = ["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg", "/5.jpg", "/6.jpg"];
// Preload the first image for instant display
if (typeof window !== "undefined") {
  const preloadImg = new window.Image();
  preloadImg.src = images[0];
}

export default function HeroAIGlassPremium() {
  const { t } = useTranslation();
  const tf = useCallback(
    (key, fallback) => {
      try {
        const res = t(key);
        if (res && res !== key) return res;
      } catch (_e) {
        // Translation key not found, use fallback
      }
      return typeof fallback !== "undefined" ? fallback : key;
    },
    [t]
  );
  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setImageIndex((p) => (p + 1) % images.length),
      5000
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const text = tf(keys[textIndex], "") || "";
    let i = 0;
    let nextTextTimeout;
    const typing = setInterval(() => {
      if (i <= text.length) {
        setDisplayText(text.slice(0, i));
        i++;
      } else {
        clearInterval(typing);
        nextTextTimeout = setTimeout(() => {
          setTextIndex((p) => (p + 1) % keys.length);
          setDisplayText("");
        }, 1200);
      }
    }, 70);
    return () => {
      clearInterval(typing);
      if (nextTextTimeout) {
        clearTimeout(nextTextTimeout);
      }
    };
  }, [textIndex, tf]);

  return (
    <section className="relative w-full overflow-hidden bg-card pt-8 sm:pt-12 md:pt-14 lg:pt-16 min-h-[85vh] flex flex-col justify-center">
      {/* Image Slider */}
      <div className="absolute inset-0">
        {images.map((img, i) => (
          <div
            key={img}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === imageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={img}
              alt={`Healthcare ${i + 1}`}
              className="w-full h-full object-cover object-[75%_center] sm:object-center"
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              fetchpriority={i === 0 ? "high" : "auto"}
            />
          </div>
        ))}
      </div>

      {/* Enhanced Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-black/90 via-black/70 to-black/50" />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-linear-to-br from-emerald-900/20 via-transparent to-cyan-900/20" />

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center py-8 sm:py-12 md:py-16">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-full mb-4 sm:mb-6">
              <ShieldCheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
              <span className="text-emerald-200 text-xs sm:text-sm font-bold">
                {tf("hero.badge", "🎉 Special Offer")}
              </span>
            </div>

            {/* Heading - Responsive Sizes */}
            <h1 className="mb-4 sm:mb-6">
              <span className="block text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-2 sm:mb-3 drop-shadow-lg">
                {tf("hero.heading1", "Healthcare at your fingertips")}
              </span>
              <span className="block text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight bg-linear-to-br from-emerald-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent drop-shadow-lg">
                {tf("hero.heading2", "Fast delivery, certified pharmacists")}
              </span>
            </h1>

            {/* CTA Buttons - Mobile Optimized */}
            <div className="mb-6 sm:mb-10">
              <Link to="/Category/Buy-Surgical-Product-Online-in-Dhaka">
                <button className="group inline-flex items-center justify-center gap-1.5 sm:gap-2 px-5 sm:px-8 py-2.5 sm:py-4 bg-linear-to-br from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-bold text-sm sm:text-base rounded-lg sm:rounded-xl shadow-2xl hover:shadow-emerald-500/50 transition-all hover:scale-105">
                  {tf("hero.cta", "Shop Now")}
                  <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>

            {/* Typing Animation - Text Only */}
            <div className="inline-flex items-center gap-3 sm:gap-4">
              <div className="relative shrink-0">
                <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-linear-to-br from-emerald-300 to-cyan-300 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-linear-to-br from-emerald-300 to-cyan-300 rounded-full animate-ping opacity-75" />
              </div>
              <span className="text-white text-base sm:text-lg md:text-xl font-bold tracking-wide drop-shadow-lg">
                {displayText || "Loading..."}
              </span>
              <span className="text-emerald-300 text-2xl sm:text-3xl font-light animate-pulse shrink-0">
                |
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
