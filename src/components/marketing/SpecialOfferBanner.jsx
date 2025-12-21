import { Link } from "react-router-dom";
import { SparklesIcon } from "@heroicons/react/24/outline";

export default function SpecialOfferBanner() {
  return (
    <section className="w-full relative overflow-hidden min-h-[100px] sm:min-h-[110px] md:min-h-[120px] bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-xl">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.05),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-teal-500/20"></div>

      {/* Floating Elements */}
      <div className="absolute top-3 left-6 animate-bounce">
        <SparklesIcon className="w-5 h-5 text-white/50" />
      </div>
      <div
        className="absolute bottom-3 right-6 animate-bounce"
        style={{ animationDelay: "0.5s" }}
      >
        <SparklesIcon className="w-4 h-4 text-white/40" />
      </div>
      <div
        className="hidden sm:block absolute top-4 right-1/4 animate-pulse"
        style={{ animationDelay: "1s" }}
      >
        <SparklesIcon className="w-4 h-4 text-white/30" />
      </div>

      <div className="relative flex items-center justify-center px-4 sm:px-6 py-5 sm:py-6 text-center">
        <div className="max-w-4xl w-full">
          {/* Enhanced Content Layout */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3">
            <span className="text-2xl sm:text-3xl animate-pulse">🎉</span>
            <div className="h-7 sm:h-9 w-px bg-white/50"></div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <h3 className="font-bold text-lg sm:text-xl md:text-2xl text-white">
                Special Offer - Save{" "}
                <span className="text-yellow-200 font-black">20%</span>
              </h3>
              <p className="text-white/95 text-sm sm:text-base md:text-lg">
                Use code{" "}
                <span className="bg-white/25 backdrop-blur-sm px-3 sm:px-4 py-1.5 rounded-lg font-bold text-white border border-white/40 shadow-md text-xs sm:text-sm md:text-base">
                  SAVE20
                </span>{" "}
                on your first order
              </p>
            </div>
            <div className="h-7 sm:h-9 w-px bg-white/50 hidden sm:block"></div>
            <span className="text-xl sm:text-2xl animate-pulse">💊</span>
          </div>

          {/* Enhanced Limited time indicator */}
          <div className="flex items-center justify-center gap-2 text-white/90 text-xs sm:text-sm">
            <div className="w-8 h-px bg-white/70"></div>
            <span className="font-semibold">⏰ Limited Time Only</span>
            <div className="w-8 h-px bg-white/70"></div>
          </div>
        </div>
      </div>

      {/* Enhanced Border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-yellow-400 to-cyan-400"></div>
    </section>
  );
}
