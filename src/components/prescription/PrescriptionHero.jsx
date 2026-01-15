import { ArrowRightIcon } from "@heroicons/react/24/outline";
import HeroButton from "../common/HeroButton";

/**
 * Hero section component for prescription page
 * Optimized for fast rendering with video background
 */
export default function PrescriptionHero({
  onUploadClick,
  onViewPrescriptions,
  t,
}) {
  return (
    <div className="w-full flex justify-center py-2 sm:py-3 lg:py-4 px-3 sm:px-5 lg:px-6">
      <div className="relative max-w-5xl w-full rounded-xl shadow-md overflow-hidden">
        {/* Video background with loading optimization */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/bloodcell.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/50 to-black/60" />

        {/* Content */}
        <div className="relative p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-center text-white min-h-60 sm:min-h-64 md:min-h-72">
          {/* Badge */}
          <div className="mb-2 sm:mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-xs sm:text-sm font-medium text-emerald-200">
              <span>💊</span>
              {t("prescriptionsPage.badge")}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 leading-tight">
            {t("prescriptionsPage.title")}
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg mb-3 sm:mb-4 max-w-2xl text-white/90 leading-relaxed">
            {t("prescriptionsPage.description")}
          </p>

          {/* Benefits */}
          <div className="mb-4 sm:mb-5 flex flex-wrap gap-2 sm:gap-3">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className="flex items-center gap-1.5 text-xs sm:text-sm"
              >
                <span className="w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs">
                  ✓
                </span>
                <span>{t(`prescriptionsPage.benefit${num}`)}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <HeroButton onClick={onUploadClick} variant="solid">
              <span>{t("prescriptionsPage.uploadButton")}</span>
              <ArrowRightIcon className="w-4 h-4" />
            </HeroButton>

            <HeroButton onClick={onViewPrescriptions} variant="outline">
              <span>📋 My Prescriptions</span>
            </HeroButton>
          </div>
        </div>
      </div>
    </div>
  );
}
