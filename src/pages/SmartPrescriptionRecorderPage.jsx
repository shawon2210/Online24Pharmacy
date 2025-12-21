import { useState, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEOHead from "../components/common/SEOHead";
import HeroButton from "../components/common/HeroButton";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function SmartPrescriptionRecorderPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [headerOffset, setHeaderOffset] = useState(0);

  useLayoutEffect(() => {
    const el = document.querySelector("header");
    if (!el) return;
    const compute = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      setHeaderOffset(h);
    };
    compute();
    window.addEventListener("resize", compute, { passive: true });
    return () => window.removeEventListener("resize", compute);
  }, []);

  const handleUploadClick = () => {
    navigate("/prescription");
  };

  const handleViewPrescriptions = () => {
    navigate("/my-prescriptions");
  };

  return (
    <>
      <SEOHead
        title="Smart Prescription Recorder - Online24 Pharmacy"
        description="Upload your prescription and get verified by licensed pharmacists with free delivery"
      />
      <div
        className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50"
        style={{
          marginTop: `-${headerOffset}px`,
          paddingTop: `calc(${headerOffset}px + 2rem)`,
        }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="relative rounded-3xl shadow-2xl overflow-hidden group hover:shadow-3xl transition-all duration-500">
              {/* Video Background */}
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              >
                <source src="/videos/bloodcell.mp4" type="video/mp4" />
              </video>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/50 to-black/60 group-hover:from-black/50 group-hover:via-black/40 group-hover:to-black/50 transition-all duration-500" />

              {/* Shine Effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)",
                }}
              />

              {/* Content */}
              <div className="relative p-8 sm:p-12 md:p-16 lg:p-20 xl:p-24 flex flex-col justify-center text-white min-h-[400px] sm:min-h-[500px] md:min-h-[600px]">
                {/* Decorative Top Icon */}
                <div className="mb-4 sm:mb-6 flex items-center">
                  <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:border-emerald-400/50 transition-all duration-300">
                    <span className="text-2xl sm:text-3xl">💊</span>
                    <span className="text-sm sm:text-base font-semibold text-emerald-200">
                      Verified by Licensed Pharmacists
                    </span>
                  </div>
                </div>

                {/* Main Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 drop-shadow-xl leading-tight tracking-tight group-hover:text-emerald-100 transition-colors duration-300">
                  Upload Your Prescription
                </h1>

                {/* Description */}
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 lg:mb-10 drop-shadow-lg max-w-3xl leading-relaxed text-white/95 group-hover:text-white transition-colors duration-300">
                  Our licensed pharmacists will review your prescription and
                  deliver your medicines to your doorstep. All information is
                  kept confidential and secure.
                </p>

                {/* Benefits List */}
                <div className="mb-8 sm:mb-10 lg:mb-12 flex flex-wrap gap-4 sm:gap-5">
                  <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base md:text-lg font-semibold">
                    <span className="w-6 h-6 sm:w-7 sm:h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                      ✓
                    </span>
                    <span>Quick Verification</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base md:text-lg font-semibold">
                    <span className="w-6 h-6 sm:w-7 sm:h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                      ✓
                    </span>
                    <span>Free Delivery</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base md:text-lg font-semibold">
                    <span className="w-6 h-6 sm:w-7 sm:h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                      ✓
                    </span>
                    <span>Secure & Confidential</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-5">
                  <HeroButton
                    onClick={handleUploadClick}
                    variant="solid"
                    className="group/btn"
                  >
                    <span>Upload Prescription</span>
                    <ArrowRightIcon className="w-5 h-5 transition-transform duration-300" />
                  </HeroButton>

                  <HeroButton onClick={handleViewPrescriptions} variant="outline">
                    <span>📋 View My Prescriptions</span>
                  </HeroButton>

                  <HeroButton
                    onClick={handleUploadClick}
                    variant="outline"
                    className="hidden sm:inline-flex"
                  >
                    <span>Learn More</span>
                  </HeroButton>
                </div>
              </div>
            </div>

            {/* Additional Info Section */}
            <div className="mt-12 sm:mt-16 lg:mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-emerald-100 hover:border-emerald-300 transition-all">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  100% Secure
                </h3>
                <p className="text-gray-600">
                  Your prescription and personal information are encrypted and
                  kept completely confidential.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-blue-100 hover:border-blue-300 transition-all">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Fast Processing
                </h3>
                <p className="text-gray-600">
                  Licensed pharmacists verify your prescription within 2-4 hours
                  during business hours.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-purple-100 hover:border-purple-300 transition-all">
                <div className="text-4xl mb-4">🚚</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Free Delivery
                </h3>
                <p className="text-gray-600">
                  Get your medicines delivered to your doorstep with free
                  delivery on all prescription orders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
