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
    [t],
  );
  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setImageIndex((p) => (p + 1) % images.length),
      5000,
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
    <section className="relative w-full overflow-hidden bg-card pt-6 sm:pt-8 md:pt-10 lg:pt-12 min-h-[90vh] sm:min-h-[85vh] flex flex-col justify-center">
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
              fetchPriority={i === 0 ? "high" : "auto"}
            />
          </div>
        ))}
      </div>

      {/* Enhanced Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center py-6 sm:py-8 md:py-12 lg:py-16">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="max-w-4xl text-center sm:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-linear-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-full mb-4 sm:mb-6 mx-auto sm:mx-0">
              <ShieldCheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
              <span className="text-emerald-200 text-sm sm:text-base font-bold">
                {tf("hero.badge", "🎉 Special Offer")}
              </span>
            </div>

            {/* Heading - Enhanced Mobile Responsive Sizes */}
            <h1 className="mb-4 sm:mb-6">
              <span className="block text-3xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-tight mb-2 sm:mb-3 drop-shadow-lg break-words">
                {tf("hero.heading1", "Healthcare at your fingertips")}
              </span>
              <span className="block text-3xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight bg-linear-to-br from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent drop-shadow-lg break-words">
                {tf("hero.heading2", "Fast delivery, certified pharmacists")}
              </span>
            </h1>

            {/* CTA Buttons - Enhanced Mobile Optimization */}
            <div className="mb-6 sm:mb-10 flex justify-center sm:justify-start">
              <Link to="/Category/Buy-Surgical-Product-Online-in-Dhaka">
                <button className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-linear-to-r from-emerald-600 via-cyan-600 to-blue-600 hover:from-emerald-700 hover:via-cyan-700 hover:to-blue-700 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-emerald-500/50 transition-all hover:scale-105 active:scale-95">
                  {tf("hero.cta", "Shop Now")}
                  <ArrowRightIcon className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>

            {/* Typing Animation - Enhanced Text Sizes */}
            <div className="inline-flex items-center gap-3 sm:gap-4 justify-center sm:justify-start">
              <div className="relative shrink-0">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-linear-to-br from-emerald-300 via-cyan-300 to-blue-300 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-4 h-4 sm:w-5 sm:h-5 bg-linear-to-br from-emerald-300 via-cyan-300 to-blue-300 rounded-full animate-ping opacity-75" />
              </div>
              <span className="text-white text-lg sm:text-lg md:text-xl font-bold tracking-wide drop-shadow-lg break-words max-w-xs sm:max-w-sm md:max-w-md">
                {displayText || "Loading..."}
              </span>
              <span className="bg-linear-to-br from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent text-2xl sm:text-3xl font-light animate-pulse shrink-0">
                |
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
