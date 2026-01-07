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
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md shadow-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <nav className="mb-3" aria-label={t("breadcrumb")}>
            <ol className="flex items-center gap-1 text-sm text-foreground">
              <li>
                <a href="/" className="hover:text-primary font-medium">
                  {t("home")}
                </a>
              </li>
              <li className="px-1 text-muted-foreground">/</li>
              <li className="text-foreground font-bold" aria-current="page">
                {t("aboutPage.title")}
              </li>
            </ol>
          </nav>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-primary mb-1">
                {t("aboutPage.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("aboutPage.subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        className="w-full px-4 sm:px-6 lg:px-8 bg-background pb-12 sm:pb-16 lg:pb-20"
        style={{
          marginTop: `-${headerOffset}px`,
          paddingTop: `calc(${headerOffset}px + 1.5rem)`,
          minHeight: "100vh",
        }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Introduction Section */}
          <div className="bg-card rounded-2xl shadow-lg border-2 border-border p-6 sm:p-8 lg:p-10 mb-6 sm:mb-8">
            <p className="text-base sm:text-lg text-foreground leading-relaxed">
              {t("aboutPage.intro1")}
              <span className="font-bold text-primary">
                {t("aboutPage.intro2")}
              </span>
              {t("aboutPage.intro3")}
            </p>
          </div>

          {/* Mission & Compliance Grid */}
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Mission Card */}
            <div className="bg-card rounded-2xl shadow-lg border border-border p-6 sm:p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-primary mb-4 sm:mb-5">
                <UserGroupIcon className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground mb-3 sm:mb-4">
                {t("aboutPage.missionTitle")}
              </h2>
              <p className="text-sm sm:text-base text-foreground leading-relaxed">
                {t("aboutPage.missionText")}
              </p>
            </div>

            {/* DGDA Compliance Card */}
            <div className="bg-card rounded-2xl shadow-lg border border-border p-6 sm:p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="inline-flex items-center justify-center w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-primary mb-4 sm:mb-5">
                <ShieldCheckIcon className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground mb-3 sm:mb-4">
                {t("aboutPage.dgdaTitle")}
              </h2>
              <p className="text-sm sm:text-base text-foreground leading-relaxed">
                {t("aboutPage.dgdaText")}
              </p>
            </div>
          </div>

          {/* Why Choose Us Section */}
          <div className="bg-card rounded-2xl shadow-lg border-2 border-border p-6 sm:p-8 lg:p-10 mb-6 sm:mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-2 sm:mb-3">
                {t("aboutPage.whyChooseUsTitle")}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t("aboutPage.whyChooseUsSubtitle")}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Feature 1 */}
              <div className="flex items-start gap-4">
                <div className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/30">
                  <ShieldCheckIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1 text-sm sm:text-base">
                    {t("aboutPage.dgdaLicensed")}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t("aboutPage.verifiedCertified")}
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4">
                <div className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/30">
                  <ClockIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1 text-sm sm:text-base">
                    {t("aboutPage.support247")}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t("aboutPage.alwaysHere")}
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-4">
                <div className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 border-2 border-orange-300">
                  <TruckIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1 text-sm sm:text-base">
                    {t("aboutPage.sameDayDelivery")}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t("aboutPage.fastReliable")}
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex items-start gap-4">
                <div className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 border-2 border-purple-300">
                  <UserGroupIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1 text-sm sm:text-base">
                    {t("aboutPage.verifiedPharmacists")}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t("aboutPage.expertTeam")}
                  </p>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="flex items-start gap-4">
                <div className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/30">
                  <CreditCardIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1 text-sm sm:text-base">
                    {t("aboutPage.securePayment")}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t("aboutPage.safeEncrypted")}
                  </p>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="flex items-start gap-4">
                <div className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/30">
                  <DocumentCheckIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1 text-sm sm:text-base">
                    {t("aboutPage.prescriptionVerified")}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t("aboutPage.qualityAssured")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-card rounded-2xl shadow-lg border-2 border-border p-6 sm:p-8 lg:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-2 sm:mb-3">
                {t("aboutPage.getInTouch")}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t("aboutPage.haveQuestions")}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
              {/* Address */}
              <div className="bg-muted rounded-xl shadow-md border-2 border-border p-5 sm:p-6 hover:shadow-lg hover:border-primary transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/30">
                    <MapPinIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground mb-2 text-sm sm:text-base">
                      {t("aboutPage.address")}
                    </h3>
                    <p className="text-sm sm:text-base text-foreground">
                      {t("aboutPage.addressValue")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-muted rounded-xl shadow-md border-2 border-border p-5 sm:p-6 hover:shadow-lg hover:border-primary transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/30">
                    <PhoneIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground mb-2 text-sm sm:text-base">
                      {t("aboutPage.phone")}
                    </h3>
                    <a
                      href="tel:+8801766998555"
                      className="text-sm sm:text-base text-primary hover:opacity-80 font-semibold"
                    >
                      +880-1766-998555
                    </a>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="bg-muted rounded-xl shadow-md border-2 border-border p-5 sm:p-6 hover:shadow-lg hover:border-primary transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/30">
                    <EnvelopeIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground mb-2 text-sm sm:text-base">
                      {t("aboutPage.email")}
                    </h3>
                    <a
                      href="mailto:support@online24pharmacy.com"
                      className="text-sm sm:text-base text-primary hover:opacity-80 font-semibold break-all"
                    >
                      support@online24pharmacy.com
                    </a>
                  </div>
                </div>
              </div>

              {/* License */}
              <div className="bg-muted rounded-xl shadow-md border-2 border-border p-5 sm:p-6 hover:shadow-lg hover:border-primary transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/30">
                    <BuildingOfficeIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground mb-2 text-sm sm:text-base">
                      {t("aboutPage.license")}
                    </h3>
                    <p className="text-sm sm:text-base text-foreground font-mono">
                      DGDA/SL/04/2024
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t-2 border-border">
              <div className="flex items-center justify-center gap-3 text-primary">
                <CheckCircleIcon className="w-6 sm:w-8 h-6 sm:h-8" />
                <p className="text-sm sm:text-base lg:text-lg font-bold">
                  {t("aboutPage.trustedByThousands")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
