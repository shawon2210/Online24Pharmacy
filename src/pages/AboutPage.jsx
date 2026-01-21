import { useTranslation } from "react-i18next";
import { useEffect } from "react";
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
  BriefcaseIcon,
  NewspaperIcon,
  PencilSquareIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  TruckIcon as ShippingIcon,
  ScaleIcon,
  LockClosedIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  CookieIcon,
} from "@heroicons/react/24/outline";

export default function AboutPage() {
  const { t } = useTranslation();

  // Handle smooth scrolling to anchor sections
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("aboutPage.seoTitle")}
        description={t("aboutPage.seoDescription")}
        url="/about"
      />

      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md shadow-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <nav className="mb-3" aria-label={t("breadcrumb")}>
            <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-foreground">
              <li>
                <a href="/" className="hover:text-primary font-medium">
                  {t("home")}
                </a>
              </li>
              <li className="px-1 text-muted-foreground">/</li>
              <li
                className="text-foreground font-bold min-w-0 truncate max-w-[75vw] sm:max-w-none"
                aria-current="page"
              >
                {t("aboutPage.seoTitle", {
                  defaultValue: t("aboutUs", { defaultValue: "About Us" }),
                })}
              </li>
            </ol>
          </nav>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-primary mb-1 leading-tight wrap-break-word">
                {t("aboutPage.title")}
              </h1>
              <p className="text-sm text-muted-foreground leading-snug max-w-prose">
                {t("aboutPage.subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          {/* Introduction Section */}
          <div className="bg-card rounded-xl shadow-lg border border-border p-6">
            <p className="text-base sm:text-lg text-foreground leading-relaxed">
              {t("aboutPage.intro1")}
              <span className="font-bold text-primary">
                {t("aboutPage.intro2")}
              </span>
              {t("aboutPage.intro3")}
            </p>
          </div>

          {/* Mission & Compliance Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Mission Card */}
            <div className="bg-card rounded-xl shadow-lg border border-border p-6">
              <div className="inline-flex items-center justify-center w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-primary mb-4 sm:mb-5">
                <UserGroupIcon className="w-6 sm:w-7 h-6 sm:h-7 text-primary-foreground" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground mb-3 sm:mb-4">
                {t("aboutPage.missionTitle")}
              </h2>
              <p className="text-sm sm:text-base text-foreground leading-relaxed">
                {t("aboutPage.missionText")}
              </p>
            </div>

            {/* DGDA Compliance Card */}
            <div className="bg-card rounded-xl shadow-lg border border-border p-6">
              <div className="inline-flex items-center justify-center w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-primary mb-4 sm:mb-5">
                <ShieldCheckIcon className="w-6 sm:w-7 h-6 sm:h-7 text-primary-foreground" />
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
          <div className="bg-card rounded-xl shadow-lg border border-border p-6">
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
                <div className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/30">
                  <TruckIcon className="w-6 h-6 text-primary" />
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
                <div className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/30">
                  <UserGroupIcon className="w-6 h-6 text-primary" />
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

          {/* Company Information Section */}
          <div
            id="company"
            className="bg-card rounded-xl shadow-lg border border-border p-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-2 sm:mb-3">
                Company
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Learn more about Online24 Pharmacy
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* About Us */}
              <div className="bg-muted rounded-lg border border-border p-5 text-center hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/30 mb-4 mx-auto">
                  <UserGroupIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-sm sm:text-base">
                  About Us
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Our mission, vision, and commitment to healthcare excellence
                </p>
              </div>

              {/* Careers */}
              <div className="bg-muted rounded-lg border border-border p-5 text-center hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/30 mb-4 mx-auto">
                  <BriefcaseIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-sm sm:text-base">
                  Careers
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Join our team of healthcare professionals
                </p>
              </div>

              {/* Press */}
              <div className="bg-muted rounded-lg border border-border p-5 text-center hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/30 mb-4 mx-auto">
                  <NewspaperIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-sm sm:text-base">
                  Press
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Media resources and company news
                </p>
              </div>

              {/* Blog */}
              <div className="bg-muted rounded-lg border border-border p-5 text-center hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/30 mb-4 mx-auto">
                  <PencilSquareIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-sm sm:text-base">
                  Blog
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Health tips, news, and educational content
                </p>
              </div>
            </div>
          </div>

          {/* Support Information Section */}
          <div
            id="support"
            className="bg-card rounded-xl shadow-lg border border-border p-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-2 sm:mb-3">
                Support
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Get help and find answers to your questions
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Contact Us */}
              <div className="bg-muted rounded-lg border border-border p-5 text-center hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/30 mb-4 mx-auto">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-sm sm:text-base">
                  Contact Us
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Reach out to our support team for assistance
                </p>
              </div>

              {/* FAQs */}
              <div className="bg-muted rounded-lg border border-border p-5 text-center hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/30 mb-4 mx-auto">
                  <QuestionMarkCircleIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-sm sm:text-base">
                  FAQs
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Find answers to commonly asked questions
                </p>
              </div>

              {/* Shipping & Returns */}
              <div className="bg-muted rounded-lg border border-border p-5 text-center hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/30 mb-4 mx-auto">
                  <ShippingIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-sm sm:text-base">
                  Shipping & Returns
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Learn about delivery and return policies
                </p>
              </div>
            </div>
          </div>

          {/* Legal Information Section */}
          <div
            id="legal"
            className="bg-card rounded-xl shadow-lg border border-border p-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-2 sm:mb-3">
                Legal
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Important legal information and policies
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Privacy Policy */}
              <div className="bg-muted rounded-lg border border-border p-5 text-center hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/30 mb-4 mx-auto">
                  <LockClosedIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-sm sm:text-base">
                  Privacy Policy
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  How we protect and handle your personal data
                </p>
              </div>

              {/* Terms of Service */}
              <div className="bg-muted rounded-lg border border-border p-5 text-center hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/30 mb-4 mx-auto">
                  <DocumentTextIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-sm sm:text-base">
                  Terms of Service
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Rules and guidelines for using our services
                </p>
              </div>

              {/* Refund Policy */}
              <div className="bg-muted rounded-lg border border-border p-5 text-center hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/30 mb-4 mx-auto">
                  <ArrowPathIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-sm sm:text-base">
                  Refund Policy
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Learn about our refund and return procedures
                </p>
              </div>

              {/* Cookie Policy */}
              <div className="bg-muted rounded-lg border border-border p-5 text-center hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/30 mb-4 mx-auto">
                  <CookieIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-sm sm:text-base">
                  Cookie Policy
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Information about cookies and tracking technologies
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-card rounded-xl shadow-lg border border-border p-6">
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
              <div className="bg-muted rounded-lg border border-border p-5 sm:p-6">
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
              <div className="bg-muted rounded-lg border border-border p-5 sm:p-6">
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
              <div className="bg-muted rounded-lg border border-border p-5 sm:p-6">
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
              <div className="bg-muted rounded-lg border border-border p-5 sm:p-6">
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
            <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-border">
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
    </div>
  );
}
