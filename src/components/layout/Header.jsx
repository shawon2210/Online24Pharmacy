import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCartIcon,
  UserIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  HeartIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import { useCartStore } from "../../stores/cartStore";
import { useAuth } from "../../hooks/useAuth";
import LanguageSwitcher from "../common/LanguageSwitcher";

const categories = [
  { id: 1, name: "Medicines", slug: "medicines", icon: "💊" },
  { id: 2, name: "Surgical", slug: "surgical", icon: "🏥" },
  { id: 3, name: "Diagnostics", slug: "diagnostics", icon: "🔬" },
  { id: 4, name: "PPE & Safety", slug: "ppe", icon: "🦺" },
  { id: 5, name: "Wound Care", slug: "wound-care", icon: "🩹" },
  { id: 6, name: "Hospital", slug: "hospital", icon: "⚕️" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(
    () =>
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
  const { t } = useTranslation();
  const tf = (key, fallback) => {
    try {
      const res = t(key);
      if (res && res !== key) return res;
    } catch (e) {
      // swallow
    }
    return typeof fallback !== "undefined" ? fallback : key;
  };
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const cartCount = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full backdrop-blur-md bg-gradient-to-r from-emerald-600/95 via-emerald-500/95 to-teal-500/95 shadow-lg transition-all duration-300 ${
          isScrolled ? "shadow-2xl" : ""
        }`}
        role="banner"
        aria-label={tf("mainSiteHeader", "Online24 Pharmacy")}
      >
        {/* Top Info Bar */}
        <div className="hidden lg:block border-b border-white/10 bg-emerald-700/20">
          <div className="w-full px-6 xl:px-8">
            <div className="flex items-center justify-between h-9 text-xs text-white/90 max-w-[1920px] mx-auto">
              <div className="flex items-center gap-8">
                <a
                  href="tel:+8801234567890"
                  className="flex items-center gap-2 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                  aria-label={tf("callSupport", "Call support")}
                  tabIndex={0}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span className="underline decoration-dotted underline-offset-2">
                    {tf("footer.phone", "+8801766998555")}
                  </span>
                </a>
                <a
                  href="mailto:support@online24pharmacy.com"
                  className="flex items-center gap-2 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                  aria-label={tf("emailSupport", "Email support")}
                  tabIndex={0}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="underline decoration-dotted underline-offset-2">
                    {tf("footer.email", "support@online24pharmacy.com")}
                  </span>
                </a>
              </div>
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="sr-only">{tf("location", "Location")}</span>
                  {tf("footer.address", "Dhaka, Bangladesh")}
                </span>
                <span className="flex items-center gap-2 font-semibold">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                  <span className="sr-only">
                    {tf("availability", "Availability")}
                  </span>
                  {tf("availability247", "Open 24/7")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="w-full px-6 xl:px-8 py-3">
          <div className="flex items-center justify-between gap-4 max-w-[1920px] mx-auto">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 sm:gap-3 flex-shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label={tf("goToHomepage", "Go to homepage")}
            >
              <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-100 to-teal-100 rounded-lg sm:rounded-xl shadow-2xl group-hover:scale-110 group-focus-visible:scale-110 transition-all duration-300 animate-pulse"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-2xl group-hover:rotate-6 group-focus-visible:rotate-6 transition-all duration-300 border-2 border-white/40">
                  <span className="text-white text-sm sm:text-xl font-black tracking-tighter drop-shadow-lg">
                    O24
                  </span>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base sm:text-xl font-black text-white drop-shadow-lg tracking-tight bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                  {tf("footer.brandName", "Online24 Pharmacy")}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="relative">
                    <div className="absolute inset-0 w-2 h-2 bg-emerald-300 rounded-full blur-sm"></div>
                    <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-[10px] sm:text-xs text-white/95 font-bold tracking-wide">
                    {tf("footer.licensedCertified", "Licensed & Certified")}
                  </p>
                </div>
              </div>
            </Link>

            {/* Desktop Search */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-3xl mx-8"
              role="search"
              aria-label={tf("siteSearch", "Search the site")}
            >
              <div className="relative w-full group">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors z-10" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={tf(
                    "searchPlaceholder",
                    "Search for medicines, health products..."
                  )}
                  className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white shadow-lg border-2 border-white/50 text-gray-700 placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                  aria-label={tf(
                    "searchPlaceholder",
                    "Search for medicines, health products..."
                  )}
                />
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Language Toggle */}
              <LanguageSwitcher />
              {/* Theme Toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className="group relative flex items-center justify-center w-11 h-11 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 border border-white/20 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                aria-label={
                  isDark
                    ? tf("switchToLight", "Switch to Light")
                    : tf("switchToDark", "Switch to Dark")
                }
                tabIndex={0}
              >
                {isDark ? (
                  <SunIcon className="w-5 h-5 text-yellow-300 drop-shadow-lg" />
                ) : (
                  <MoonIcon className="w-5 h-5 text-blue-100 drop-shadow-lg" />
                )}
                <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-gray-900/90 backdrop-blur-sm text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                  {isDark
                    ? tf("lightMode", "Light Mode")
                    : tf("darkMode", "Dark Mode")}
                </span>
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="hidden sm:flex group relative items-center justify-center w-11 h-11 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 border border-white/20 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                aria-label={tf("viewWishlist", "View wishlist")}
                tabIndex={0}
              >
                <HeartIcon className="w-5 h-5 text-white drop-shadow-lg" />
                <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-gray-900/90 backdrop-blur-sm text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                  {tf("wishlist", "Wishlist")}
                </span>
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="group relative flex items-center justify-center w-11 h-11 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 border border-white/20 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                aria-label={tf("viewCart", "View cart")}
                tabIndex={0}
              >
                <ShoppingCartIcon className="w-5 h-5 text-white drop-shadow-lg" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1.5 bg-gradient-to-br from-red-500 via-red-600 to-pink-600 text-white text-[11px] rounded-full flex items-center justify-center font-bold shadow-xl ring-2 ring-white/40 animate-pulse">
                    {cartCount}
                  </span>
                )}
                <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-gray-900/90 backdrop-blur-sm text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                  {tf("cart", "Cart")}
                </span>
              </Link>
              {user ? (
                <div className="hidden lg:block relative group">
                  <button
                    className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full hover:ring-2 hover:ring-white/30 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 active:scale-95"
                    aria-haspopup="true"
                    aria-expanded="false"
                    aria-label={t("openUserMenu")}
                    tabIndex={0}
                  >
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shadow-lg"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white flex items-center justify-center text-emerald-600 font-black text-base sm:text-lg shadow-lg">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>
                  <div className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all z-50 overflow-hidden">
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <UserIcon className="w-4 h-4" />
                        {t("profile")}
                      </Link>
                      <Link
                        to="/my-orders"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <ShoppingCartIcon className="w-4 h-4" />
                        {t("orders")}
                      </Link>
                      <Link
                        to="/my-prescriptions"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        {t("prescriptions")}
                      </Link>
                      <Link
                        to="/addresses"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {t("addresses", "Addresses")}
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {t("settings", "Settings")}
                      </Link>
                      <hr className="my-2 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        {t("logout")}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
                  >
                    <UserIcon className="w-5 h-5" />
                    {t("login")}
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-emerald-600 font-bold hover:bg-emerald-50 transition-all shadow-lg"
                  >
                    {t("register", "Sign Up")}
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden flex items-center justify-center w-11 h-11 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 border border-white/20 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                aria-label={isMenuOpen ? t("closeMenu") : t("openMenu")}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                tabIndex={0}
              >
                {isMenuOpen ? (
                  <XMarkIcon className="w-6 h-6 text-white drop-shadow-lg" />
                ) : (
                  <Bars3Icon className="w-6 h-6 text-white drop-shadow-lg" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="md:hidden mt-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-emerald-600/70 z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("search")}
                className="w-full h-7 pl-7 pr-2 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white text-[11px] font-medium focus:outline-none focus:bg-white/30 focus:border-white/50 placeholder:text-white/70 transition-all shadow-sm"
              />
            </div>
          </form>
        </div>
      </header>

      {/* Navigation */}
      <nav className="hidden lg:block w-full bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-b-2 border-gray-200 dark:border-gray-700 shadow-md">
        <div className="w-full px-6 xl:px-8">
          <div className="flex items-center gap-2 h-14 max-w-[1920px] mx-auto">
            <Link
              to="/"
              className="relative px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all duration-300 hover:scale-105 group"
            >
              <span className="relative z-10">{t("home", "Home")}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <Link
              to="/products"
              className="relative px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all duration-300 hover:scale-105 group"
            >
              <span className="relative z-10">{t("products")}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <div className="relative group">
              <Link
                to="/categories"
                className="relative px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <span className="relative z-10">{t("categories")}</span>
                <svg
                  className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              <div className="absolute left-0 top-full mt-2 w-[520px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                <div className="grid grid-cols-2 gap-2 p-4">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/categories/${cat.slug}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 transition-all duration-300 hover:scale-105 group/item"
                    >
                      <span className="text-3xl group-hover/item:scale-110 transition-transform">
                        {cat.icon}
                      </span>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400">
                        {t(cat.name)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link
              to="/prescription"
              className="relative px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all duration-300 hover:scale-105 group"
            >
              <span className="relative z-10">
                {t("prescriptions", "Prescription")}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <Link
              to="/build-kit"
              className="relative px-5 py-2.5 text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 rounded-xl transition-all duration-300 hover:scale-105 group"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                {t("buildKit", "Build Kit")}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <Link
              to="/pickup-map"
              className="relative px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all duration-300 hover:scale-105 group"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                {t("pickupMap", "Pickup Map")}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <Link
              to="/my-orders"
              className="relative px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all duration-300 hover:scale-105 group"
            >
              <span className="relative z-10">{t("orders", "My Orders")}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <Link
              to="/track-order"
              className="relative px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all duration-300 hover:scale-105 group"
            >
              <span className="relative z-10">
                {t("trackOrder", "Track Order")}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <Link
              to="/about"
              className="relative px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all duration-300 hover:scale-105 group"
            >
              <span className="relative z-10">{t("about", "About")}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[60] flex flex-col"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="flex-1 bg-black/50 backdrop-blur-sm"></div>
          <div
            className="flex-none bg-white dark:bg-gray-900 max-h-[calc(100vh-140px)] overflow-y-auto pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* User Section */}
            {user ? (
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4">
                <div className="flex items-center gap-3">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover shadow-lg ring-2 ring-white/50"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-emerald-600 font-black text-lg shadow-lg">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-white font-bold text-base">
                      {user.name}
                    </p>
                    <p className="text-emerald-100 text-xs">{user.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600">
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white text-emerald-600 font-bold py-3 rounded-xl hover:bg-emerald-50 transition-all"
                  >
                    <UserIcon className="w-5 h-5" />
                    {t("login")}
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 text-white font-bold py-3 rounded-xl hover:bg-emerald-800 transition-all"
                  >
                    {t("signUp")}
                  </Link>
                </div>
              </div>
            )}

            <div className="p-4 space-y-1">
              {/* Main Navigation */}
              <div className="space-y-1">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span className="font-medium">{t("home", "Home")}</span>
                </Link>
                <Link
                  to="/products"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <span className="font-medium">{t("products")}</span>
                </Link>
                <Link
                  to="/prescription"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="font-medium">
                    {t("prescriptions", "Prescription")}
                  </span>
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                >
                  <HeartIcon className="w-5 h-5" />
                  <span className="font-medium">{t("wishlist")}</span>
                </Link>
              </div>

              {/* Categories */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t("categories")}
                </p>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/categories/${cat.slug}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="font-medium">{t(cat.name)}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* User Menu */}
              {user && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("myAccount", "My Account")}
                  </p>
                  <div className="space-y-1">
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                    >
                      <UserIcon className="w-5 h-5" />
                      <span className="font-medium">{t("profile")}</span>
                    </Link>
                    <Link
                      to="/my-orders"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                    >
                      <ShoppingCartIcon className="w-5 h-5" />
                      <span className="font-medium">{t("orders")}</span>
                    </Link>
                    <Link
                      to="/my-prescriptions"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="font-medium">{t("prescriptions")}</span>
                    </Link>
                    <Link
                      to="/addresses"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="font-medium">
                        {t("addresses", "Addresses")}
                      </span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="font-medium">
                        {t("settings", "Settings")}
                      </span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Other Links */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-1">
                  <Link
                    to="/track-order"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                    <span className="font-medium">
                      {t("trackOrder", "Track Order")}
                    </span>
                  </Link>
                  <Link
                    to="/about"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium">
                      {t("aboutUs", "About Us")}
                    </span>
                  </Link>
                </div>
              </div>

              {/* Logout */}
              {user && (
                <div className="pt-4">
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-xl transition-all font-bold"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    {t("logout")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
