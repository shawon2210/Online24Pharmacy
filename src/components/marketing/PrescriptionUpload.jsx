import { Link } from "react-router-dom";

export default function PrescriptionUpload() {
  return (
    <section className="w-full min-h-50 sm:min-h-60 md:min-h-70 lg:min-h-80 py-10 sm:py-14 md:py-16 lg:py-20 relative flex items-center bg-emerald-900">
      {/* Static gradient background - no image load needed */}
      <div className="absolute inset-0 bg-linear-to-br from-emerald-800 via-emerald-900 to-slate-900" />

      {/* Decorative elements */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 text-4xl sm:text-5xl md:text-6xl opacity-20">
        💊
      </div>
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 text-4xl sm:text-5xl md:text-6xl opacity-20">
        📋
      </div>
      <div className="absolute top-1/2 left-1/4 w-32 h-32 sm:w-48 sm:h-48 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-24 h-24 sm:w-40 sm:h-40 bg-cyan-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 lg:px-12 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8">
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <span className="text-3xl sm:text-4xl md:text-5xl">📄</span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs sm:text-sm font-medium text-emerald-200 border border-white/20">
                Fast & Secure
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-tight">
              Upload Your Prescription
            </h2>
            <p className="text-white/85 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed mb-4 sm:mb-6">
              Licensed pharmacists review every prescription and deliver
              medicines to your doorstep with expert care and precision.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px]">
                  ✓
                </span>
                Verified Pharmacists
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px]">
                  ✓
                </span>
                Same Day Delivery
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <span className="w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px]">
                  ✓
                </span>
                100% Genuine
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="shrink-0">
            <Link
              to="/prescription"
              aria-label="Upload prescription"
              className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-white text-emerald-700 px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg md:text-xl shadow-xl hover:bg-emerald-50 hover:scale-105 active:scale-95 transition-all"
            >
              <span className="text-xl sm:text-2xl">💊</span>
              <span>Upload Now</span>
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M5 12h14M13 5l6 7-6 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
