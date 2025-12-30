import { Link } from "react-router-dom";

export default function PrescriptionUpload() {
  return (
    <section
      className="w-full py-28 min-h-[520px] relative flex items-center overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/3.jpg')" }}
    >
      <svg
        className="absolute -right-10 -top-20 opacity-20"
        width="680"
        height="680"
        viewBox="0 0 680 680"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <circle cx="340" cy="340" r="300" fill="url(#g1)" />
      </svg>
      <div className="absolute inset-0 bg-slate-900/24" />
      <div className="relative z-10 px-6 max-w-6xl mx-auto md:mx-0 md:pl-20">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
          📄 Upload Your Prescription
        </h2>
        <p className="text-white/90 text-base md:text-lg max-w-2xl mb-6">
          Licensed pharmacists review and deliver to your doorstep with expert
          care and precision.
        </p>
        <Link
          to="/prescription"
          aria-label="Upload prescription"
          className="inline-flex items-center gap-3 bg-white text-emerald-600 px-6 py-3 md:px-10 md:py-4 rounded-2xl font-semibold text-base md:text-xl shadow-lg transform-gpu will-change-transform hover:scale-105 transition-transform"
        >
          <span>💊 Upload Now</span>
          <svg
            className="w-5 h-5 md:w-6 md:h-6"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M5 12h14M13 5l6 7-6 7"
              stroke="#059669"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
