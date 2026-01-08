import { Link } from "react-router-dom";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

export default function SpecialOfferBanner() {
  const { t } = useTranslation();
  return (
    <section className="w-full relative overflow-hidden min-h-22.5 xs:min-h-25 sm:min-h-27.5 md:min-h-30 bg-linear-to-r from-emerald-600 via-emerald-500 to-cyan-600 dark:from-emerald-700 dark:via-emerald-700 dark:to-cyan-700 text-white shadow-xl">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 bg-white/10 dark:bg-foreground/10 animate-pulse"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.18),transparent_52%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent_52%)]"></div>
      <div className="absolute inset-0 bg-white/8 dark:bg-white/5"></div>

      {/* Floating Elements */}
      <div className="hidden xs:block absolute top-2 xs:top-3 left-3 xs:left-6 animate-bounce">
        <SparklesIcon className="w-4 h-4 xs:w-5 xs:h-5 text-white/50" />
      </div>
      <div
        className="hidden xs:block absolute bottom-2 xs:bottom-3 right-3 xs:right-6 animate-bounce"
        style={{ animationDelay: "0.5s" }}
      >
        <SparklesIcon className="w-3 h-3 xs:w-4 xs:h-4 text-white/40" />
      </div>
      <div
        className="hidden sm:block absolute top-4 right-1/4 animate-pulse"
        style={{ animationDelay: "1s" }}
      >
        <SparklesIcon className="w-4 h-4 text-white/30" />
      </div>

      <div className="relative flex items-center justify-center px-3 xs:px-4 sm:px-6 py-4 xs:py-5 sm:py-6 text-center">
        <div className="max-w-4xl w-full">
          {/* Enhanced Content Layout */}
          <div className="flex items-center justify-center gap-2 xs:gap-3 sm:gap-4 mb-2 xs:mb-3">
            <span className="text-xl xs:text-2xl sm:text-3xl animate-pulse">
              🎉
            </span>
            <div className="h-6 xs:h-7 sm:h-9 w-px bg-white/50"></div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <h3 className="font-bold text-base xs:text-lg sm:text-xl md:text-2xl text-white">
                {t("specialOffer.title", "Special Offer - Save")}{" "}
                <span className="text-yellow-200 font-black">
                  {t("specialOffer.percent", "20%")}
                </span>
              </h3>
              <p className="text-white/95 text-xs xs:text-sm sm:text-base md:text-lg">
                {t("specialOffer.useCode", "Use code")}{" "}
                <span className="bg-white/80 dark:bg-white/25 backdrop-blur-sm px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 rounded-lg font-bold text-emerald-900 dark:text-background border border-white/50 shadow-md text-xs sm:text-sm md:text-base">
                  {t("specialOffer.code", "SAVE20")}
                </span>{" "}
                {t("specialOffer.onFirstOrder", "on your first order")}
              </p>
            </div>
            <div className="h-6 xs:h-7 sm:h-9 w-px bg-white/50 hidden sm:block"></div>
            <span className="text-lg xs:text-xl sm:text-2xl animate-pulse">
              💊
            </span>
          </div>

          {/* Enhanced Limited time indicator */}
          <div className="flex items-center justify-center gap-1.5 xs:gap-2 text-white/90 text-[10px] xs:text-xs sm:text-sm">
            <div className="w-6 xs:w-8 h-px bg-white/70"></div>
            <span className="font-semibold whitespace-nowrap">
              ⏰ {t("specialOffer.limitedTime", "Limited Time Only")}
            </span>
            <div className="w-6 xs:w-8 h-px bg-white/70"></div>
          </div>
        </div>
      </div>

      {/* Enhanced Border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30"></div>
    </section>
  );
}
