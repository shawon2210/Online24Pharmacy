import { useState, useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import SEOHead from "../components/common/SEOHead";
import {
  ShieldCheckIcon,
  ClockIcon,
  TruckIcon,
  UserGroupIcon,
  CreditCardIcon,
  DocumentCheckIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function AboutPage() {
  const { t } = useTranslation();
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

  return (
    <>
      <SEOHead
        title={t("aboutPage.seoTitle")}
        description={t("aboutPage.seoDescription")}
        url="/about"
      />
      <div
        className="w-full px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 pb-12 sm:pb-16 lg:pb-20"
        style={{
          marginTop: `-${headerOffset}px`,
          paddingTop: `calc(${headerOffset}px + 1.5rem)`,
          minHeight: "100vh",
        }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-0">
            <div className="inline-block mb-3 sm:mb-4">
              <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-100 to-cyan-100 border-2 border-emerald-200 text-emerald-700 rounded-full text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-shadow duration-300">
                <span className="text-lg sm:text-xl">🏥</span>
                <span>{t("aboutPage.badge")}</span>
              </span>
            </div>
            <h1 className="font-black text-gray-900 mb-3 sm:mb-4 tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                {t("aboutPage.title")}
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl">
              {t("aboutPage.subtitle")}
            </p>
          </div>

          {/* Introduction Section */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 sm:p-8 lg:p-10 mb-6 sm:mb-8">
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              Online24 Pharmacy is Bangladesh's leading digital healthcare
              platform, providing{" "}
              <span className="font-bold text-emerald-600">24/7 access</span> to
              surgical instruments, medical supplies, and pharmaceutical
              products across Dhaka and surrounding areas. We combine
              cutting-edge technology with compassionate care to deliver
              healthcare solutions right to your doorstep.
            </p>
          </div>

          {/* Mission & Compliance Grid */}
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Mission Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-2xl shadow-lg border-2 border-emerald-200 p-6 sm:p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-emerald-600 mb-4 sm:mb-5">
                <UserGroupIcon className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 sm:mb-4">
                Our Mission
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                To make healthcare accessible and affordable for everyone in
                Bangladesh through innovative technology and reliable service
                delivery. We believe every person deserves quality healthcare.
              </p>
            </div>

            {/* DGDA Compliance Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-2xl shadow-lg border-2 border-emerald-200 p-6 sm:p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-emerald-600 mb-4 sm:mb-5">
                <ShieldCheckIcon className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 sm:mb-4">
                DGDA Compliance
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                We are fully licensed by the Directorate General of Drug
                Administration (DGDA) and maintain strict quality standards for
                all medical products. Your safety is our priority.
              </p>
            </div>
          </div>

          {/* Why Choose Us Section */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 sm:p-8 lg:p-10 mb-6 sm:mb-8">
            <div className="text-center mb-0">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 sm:mb-3">
                Why Choose Us?
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Discover what makes us Bangladesh's most trusted pharmacy
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Feature 1 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 border-2 border-emerald-300">
                  <ShieldCheckIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">
                    DGDA Licensed
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Verified & certified
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 border-2 border-emerald-300">
                  <ClockIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">
                    24/7 Support
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Always here for you
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 border-2 border-orange-300">
                  <TruckIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">
                    Same-day Delivery
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Fast & reliable
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 border-2 border-purple-300">
                  <UserGroupIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">
                    Verified Pharmacists
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Expert healthcare team
                  </p>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 border-2 border-emerald-300">
                  <CreditCardIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">
                    Secure Payment
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Safe & encrypted
                  </p>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 border-2 border-emerald-300">
                  <DocumentCheckIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">
                    Prescription Verified
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Quality assured
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border-2 border-gray-200 p-6 sm:p-8 lg:p-10">
            <div className="text-center mb-0">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 sm:mb-3">
                Get In Touch
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Have questions? We're here to help!
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
              {/* Address */}
              <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-5 sm:p-6 hover:shadow-lg hover:border-emerald-300 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 border-2 border-emerald-300">
                    <MapPinIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">
                      Address
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700">
                      Dhanmondi, Dhaka-1205, Bangladesh
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-5 sm:p-6 hover:shadow-lg hover:border-emerald-300 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 border-2 border-emerald-300">
                    <PhoneIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">
                      Phone
                    </h3>
                    <a
                      href="tel:+8801766998555"
                      className="text-sm sm:text-base text-emerald-600 hover:text-emerald-700 font-semibold"
                    >
                      +880-1766-998555
                    </a>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-5 sm:p-6 hover:shadow-lg hover:border-emerald-300 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 border-2 border-emerald-300">
                    <EnvelopeIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">
                      Email
                    </h3>
                    <a
                      href="mailto:support@online24pharmacy.com"
                      className="text-sm sm:text-base text-emerald-600 hover:text-emerald-700 font-semibold break-all"
                    >
                      support@online24pharmacy.com
                    </a>
                  </div>
                </div>
              </div>

              {/* License */}
              <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-5 sm:p-6 hover:shadow-lg hover:border-emerald-300 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 border-2 border-emerald-300">
                    <BuildingOfficeIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">
                      License
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700 font-mono">
                      DGDA/SL/04/2024
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t-2 border-gray-200">
              <div className="flex items-center justify-center gap-3 text-emerald-600">
                <CheckCircleIcon className="w-6 sm:w-8 h-6 sm:h-8" />
                <p className="text-sm sm:text-base lg:text-lg font-bold">
                  Trusted by thousands of customers across Bangladesh
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
