import { ArrowRightIcon } from "@heroicons/react/24/outline";
import HeroButton from "../common/HeroButton";

/**
 * Hero section component for prescription page
 * Displays promotional content with video background
 */
export default function PrescriptionHero({
  onUploadClick,
  onViewPrescriptions,
  t,
}) {
  return (
    <div className="w-full flex justify-center py-2 sm:py-4 lg:py-5 px-3 sm:px-6 lg:px-8">
      <div className="relative max-w-6xl w-full rounded-xl shadow-md overflow-hidden group hover:shadow-md transition-all duration-500">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        >
          <source src="/videos/bloodcell.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/50 to-black/60 group-hover:from-black/50 group-hover:via-black/40 group-hover:to-black/50 transition-all duration-500" />

        <div className="relative p-5 sm:p-8 md:p-10 lg:p-14 xl:p-16 flex flex-col justify-center text-background min-h-70 sm:min-h-80 md:min-h-90">
          <div className="mb-3 sm:mb-4 flex items-center">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:border-emerald-400/50 transition-all duration-300">
              <span className="text-lg sm:text-xl">💊</span>
              <span className="text-xs sm:text-sm font-semibold text-emerald-200">
                {t("prescriptionsPage.badge")}
              </span>
            </div>
          </div>

          <h2 className="text-2xl md:text-4xl font-black mb-2 sm:mb-4 drop-shadow-xl leading-tight tracking-tight group-hover:text-emerald-100 transition-colors duration-300">
            {t("prescriptionsPage.title")}
          </h2>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 lg:mb-8 drop-shadow-lg max-w-3xl leading-relaxed text-white/95 group-hover:text-background transition-colors duration-300">
            {t("prescriptionsPage.description")}
          </p>

          <div className="mb-6 sm:mb-8 flex flex-wrap gap-3 sm:gap-4">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className="flex items-center gap-2 text-xs sm:text-sm font-semibold"
              >
                <span className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full flex items-center justify-center text-background">
                  ✓
                </span>
                <span>{t(`prescriptionsPage.benefit${num}`)}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
            <HeroButton
              onClick={onUploadClick}
              variant="solid"
              className="group/btn"
            >
              <span>{t("prescriptionsPage.uploadButton")}</span>
              <ArrowRightIcon className="w-4 sm:w-5 h-4 sm:h-5 transition-transform duration-300" />
            </HeroButton>

            <HeroButton onClick={onViewPrescriptions} variant="outline">
              <span>📋 View My Prescriptions</span>
            </HeroButton>

            <HeroButton
              href="#features"
              variant="outline"
              className="hidden sm:inline-flex"
            >
              <span>{t("prescriptionsPage.learnMore")}</span>
            </HeroButton>
          </div>
        </div>
      </div>
    </div>
  );
}
