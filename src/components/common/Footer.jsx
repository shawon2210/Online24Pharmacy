import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

export default function Footer() {
  const { t } = useTranslation();
  const footerLinks = {
    company: [
      { label: t("footer.aboutUs", "About Us"), to: "/about" },
      { label: t("footer.careers", "Careers"), to: "/careers" },
      { label: t("footer.press", "Press"), to: "/press" },
      { label: t("footer.blog", "Blog"), to: "/blog" },
    ],
    support: [
      { label: t("footer.contactUs", "Contact Us"), to: "/contact" },
      { label: t("footer.faqs", "FAQs"), to: "/faq" },
      {
        label: t("footer.shippingReturns", "Shipping & Returns"),
        to: "/shipping",
      },
      { label: t("footer.trackOrder", "Track Order"), to: "/track-order" },
    ],
    legal: [
      { label: t("footer.privacyPolicy", "Privacy Policy"), to: "/privacy" },
      { label: t("footer.termsOfService", "Terms of Service"), to: "/terms" },
      { label: t("footer.refundPolicy", "Refund Policy"), to: "/refund" },
      { label: t("footer.cookiePolicy", "Cookie Policy"), to: "/cookies" },
    ],
  };

  const paymentMethods = [
    { name: "bKash", color: "from-pink-500 to-pink-600" },
    { name: "Nagad", color: "from-orange-500 to-orange-600" },
    { name: "Visa", color: "from-blue-600 to-blue-700" },
    { name: "COD", color: "from-gray-600 to-gray-700" },
  ];

  return (
    <footer className="bg-background dark:bg-card border-t border-border dark:border-card">
      {/* Newsletter Section */}
      <div className="bg-linear-to-br from-emerald-600 to-teal-600 py-8 sm:py-10 px-3 sm:px-4 md:px-0">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl bg-white/90 dark:bg-card/90 shadow-2xl px-4 sm:px-6 md:px-10 py-6 sm:py-8 flex flex-col md:flex-row items-center md:items-end gap-4 sm:gap-6 md:gap-10 border border-emerald-100 dark:border-emerald-900/40 relative overflow-hidden">
            <div className="flex flex-col items-center md:items-start w-full md:w-2/3">
              <div className="flex items-center gap-3 mb-2">
                <svg
                  className="w-8 h-8 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="3"
                    fill="#10b981"
                    className="text-emerald-600"
                  />
                  <path
                    d="M3 7l9 6 9-6"
                    stroke="#fff"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h3 className="text-lg sm:text-xl font-extrabold text-emerald-700 dark:text-emerald-300 tracking-tight">
                  {t(
                    "footer.subscribeNewsletter",
                    "Subscribe to Our Newsletter"
                  )}
                </h3>
              </div>
              <p className="text-sm text-foreground dark:text-muted mb-2 md:mb-0 text-center md:text-left max-w-md">
                {t(
                  "footer.newsletterDesc",
                  "Get exclusive deals, health tips, and updates delivered to your inbox. Join our community and stay informed!"
                )}
              </p>
            </div>
            <form
              className="flex flex-col sm:flex-row w-full md:w-auto gap-3 sm:gap-2 items-center md:items-end"
              autoComplete="off"
            >
              <input
                type="email"
                placeholder={t(
                  "footer.emailPlaceholder",
                  "Enter your email address"
                )}
                className="flex-1 min-w-45 sm:w-64 px-4 py-3 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-background dark:bg-card text-foreground dark:text-background placeholder-gray-400 dark:placeholder-gray-500 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-background font-bold text-base shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {t("footer.subscribe", "Subscribe")}
              </button>
            </form>
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-emerald-100 dark:bg-emerald-900/30 rounded-full opacity-40 blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-teal-100 dark:bg-teal-900/30 rounded-full opacity-30 blur-2xl pointer-events-none"></div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-12 xl:gap-16">
          {/* Brand Section */}
          <div className="lg:col-span-2 flex flex-col h-full justify-between pb-6 lg:pb-0 border-b lg:border-b-0 border-border dark:border-card">
            <Link to="/" className="inline-flex items-center gap-3 mb-5 group">
              <div className="w-12 h-12 bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <span className="text-background text-2xl font-black tracking-tight drop-shadow">
                  O24
                </span>
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-foreground dark:text-background tracking-tight leading-tight">
                  {t("footer.brandName", "Online24 Pharmacy")}
                </h2>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  {t("footer.licensedCertified", "Licensed & Certified")}
                </p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-6 max-w-md leading-relaxed">
              {t(
                "footer.brandDesc",
                "Your trusted online pharmacy providing quality medicines and healthcare products with fast delivery across Bangladesh."
              )}
            </p>
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm mt-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {t("footer.dgdaCertified", "DGDA Certified")}
            </div>

            <div className="mt-8 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground">
                <PhoneIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t("footer.phone", "+880-1234-567890")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground">
                <EnvelopeIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t("footer.email", "support@online24pharmacy.com")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground">
                <MapPinIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t("footer.address", "Dhaka, Bangladesh")}</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div className="flex flex-col gap-2">
            <h3 className="text-base font-extrabold text-foreground dark:text-background mb-4 tracking-wide uppercase">
              {t("footer.company", "Company")}
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground dark:text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors duration-200 pl-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="flex flex-col gap-2">
            <h3 className="text-base font-extrabold text-foreground dark:text-background mb-4 tracking-wide uppercase">
              {t("footer.support", "Support")}
            </h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground dark:text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors duration-200 pl-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col gap-2">
            <h3 className="text-base font-extrabold text-foreground dark:text-background mb-4 tracking-wide uppercase">
              {t("footer.legal", "Legal")}
            </h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground dark:text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors duration-200 pl-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border dark:border-card">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-5 sm:py-7">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
            {/* Copyright */}
            <p className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground text-center sm:text-left order-2 sm:order-1">
              © {new Date().getFullYear()}{" "}
              {t("footer.brandName", "Online24 Pharmacy")}. All rights reserved.
            </p>

            {/* Payment Methods */}
            <div className="flex flex-col items-center sm:flex-row gap-2 sm:gap-3 order-1 sm:order-2">
              <span className="text-xs text-muted-foreground dark:text-muted-foreground font-semibold tracking-wide">
                {t("footer.weAccept", "We Accept:")}
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
                {paymentMethods.map((method) => (
                  <span
                    key={method.name}
                    className={`bg-linear-to-br ${method.color} text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-xs font-bold shadow-md tracking-wide`}
                  >
                    {method.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2 order-3">
              <a
                href="#"
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-muted dark:bg-card text-muted-foreground dark:text-muted-foreground hover:bg-emerald-600 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-muted dark:bg-card text-muted-foreground dark:text-muted-foreground hover:bg-emerald-600 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-muted dark:bg-card text-muted-foreground dark:text-muted-foreground hover:bg-emerald-600 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
