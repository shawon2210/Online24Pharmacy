import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../../stores/cartStore";
import { useAuth } from "../../hooks/useAuth";
import ThemeToggle from "../common/ThemeToggle";
import LanguageSwitcher from "../common/LanguageSwitcher";
import NotificationBell from "../notifications/NotificationBell";
import {
  UserCircle,
  LogOut,
  ShoppingCart,
  Menu,
  X,
  Shield,
  Heart,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { flushSync } from "react-dom";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const lastScrollTop = useRef(0);
  const avatarRef = useRef(null);
  const dropdownRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const _throttleRef = useRef(0);
  const animationRef = useRef(null);

  const { t: tf } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const cartCount = useCartStore((state) => state.getTotalItems());

  const navLinks = [
    [tf("home"), "/"],
    [tf("products"), "/products"],
    [tf("categories"), "/categories"],
    [tf("prescriptions"), "/prescription"],
    [tf("orders"), "/my-orders"],
    [tf("pickupMapPage.title"), "/pickup-map"],
    [tf("trackOrder"), "/track-order"],
    [tf("buildKit"), "/build-kit"],
    [tf("about"), "/about"],
  ];

  // ✅ Robust scroll direction detection
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.deltaY < 0) {
        // Scrolling up
        flushSync(() => setIsVisible(true));
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
      }
    };

    const checkScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const isScrollingDown = scrollTop > lastScrollTop.current;

      // Update last scroll position first
      lastScrollTop.current = scrollTop <= 0 ? 0 : scrollTop;

      // Always show near top
      if (scrollTop <= 60) {
        flushSync(() => setIsVisible(true));
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
      } else if (!isScrollingDown) {
        // Instantly show on scroll up
        flushSync(() => setIsVisible(true));
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
      } else {
        // Delay hiding on scroll down
        if (!hideTimeoutRef.current) {
          hideTimeoutRef.current = setTimeout(() => {
            setIsVisible(false);
          }, 50);
        }
      }

      animationRef.current = requestAnimationFrame(checkScroll);
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    animationRef.current = requestAnimationFrame(checkScroll);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Dropdown accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsDropdownOpen(false);
    };
    if (isDropdownOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        avatarRef.current &&
        !avatarRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;

  return (
    <header
      className={`
        sticky top-0 z-50 
        bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg
        border-b border-gray-200 dark:border-gray-700
      `}
      style={{
        visibility: isVisible ? "visible" : "hidden",
      }}
    >
      {/* TOP INFO BAR */}
      <div className="hidden md:block bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
        <div className="px-6 h-10 flex items-center justify-between text-xs">
          <div className="flex gap-6">
            <span>📞 +880-1712-353914</span>
            <span>✉️ online24pharmacy@gmail.com</span>
          </div>
          <div className="flex gap-6">
            <span>📍 Dhaka, Bangladesh</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              24/7 Available
            </span>
          </div>
        </div>
      </div>

      {/* MAIN HEADER */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 sm:gap-3 group shrink-0"
          >
            <div className="w-12 h-12 sm:w-11 sm:h-11 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <span className="text-white font-black text-xl sm:text-lg">
                O24
              </span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-gray-800 dark:text-white font-bold leading-tight">
                {tf("footer.brandName")}
              </h1>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {tf("footer.dgdaCertified")}
              </p>
            </div>
          </Link>

          {/* Desktop Search */}
          <form
            onSubmit={handleSearch}
            className="hidden sm:flex flex-1 max-w-xs md:max-w-sm lg:max-w-xl"
          >
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tf("searchPlaceholder", "Search medicines…")}
              className="
                w-full h-10 md:h-11 px-3 md:px-4 rounded-lg md:rounded-xl text-sm md:text-base
                bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white
                focus:ring-2 focus:ring-emerald-500
                border border-transparent focus:border-emerald-500
                placeholder:text-gray-500 dark:placeholder:text-gray-400
              "
            />
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="group relative flex items-center justify-center w-11 h-11 lg:w-10 lg:h-10 rounded-xl hover:bg-gradient-to-br hover:from-emerald-50 hover:to-emerald-100 dark:hover:from-emerald-900/20 dark:hover:to-emerald-800/20 hover:shadow-lg hover:shadow-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 lg:w-4.5 lg:h-4.5 group-hover:scale-110 group-hover:fill-current group-hover:text-emerald-500 transition-all duration-300" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-400/0 to-emerald-500/0 group-hover:from-emerald-400/10 group-hover:to-emerald-500/10 transition-all duration-300" />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="group relative flex items-center justify-center w-11 h-11 lg:w-10 lg:h-10 rounded-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 hover:shadow-lg hover:shadow-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 lg:w-4.5 lg:h-4.5 group-hover:scale-110 transition-transform duration-300" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full min-w-[22px] h-[22px] lg:min-w-[20px] lg:h-[20px] flex items-center justify-center px-1 shadow-lg shadow-red-500/25 animate-pulse ring-2 ring-white dark:ring-gray-900">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/0 to-blue-500/0 group-hover:from-blue-400/10 group-hover:to-blue-500/10 transition-all duration-300" />
            </Link>

            {/* Notifications */}
            <div className="hidden sm:block">
              <NotificationBell />
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px h-6 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent mx-1"></div>

            {/* Theme & Language */}
            <div className="hidden lg:flex items-center gap-1">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px h-6 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent mx-1"></div>

            {/* User Dropdown */}
            {user ? (
              <div className="relative hidden sm:block" ref={avatarRef}>
                <button
                  onClick={toggleDropdown}
                  className="group relative w-11 h-11 lg:w-10 lg:h-10 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                  aria-label="User menu"
                >
                  <img
                    src={
                      user.profilePicture ||
                      `https://i.pravatar.cc/150?u=${user.id}`
                    }
                    alt="User"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-600/0 group-hover:from-emerald-500/10 group-hover:to-emerald-600/10 transition-all duration-300" />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <Motion.div
                      ref={dropdownRef}
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-56 sm:w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-2xl ring-1 ring-emerald-200/60 border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
                      role="menu"
                    >
                      <div className="py-2 px-3">
                        <div className="px-4 py-2 text-sm font-semibold border-b border-gray-200 dark:border-gray-700">
                          {tf("myAccount")}
                        </div>
                        {user?.role === "ADMIN" && (
                          <>
                            <Link
                              to="/admin"
                              className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/20 dark:hover:to-red-800/20 transition-all duration-200 rounded-lg mx-1"
                              onClick={() => setIsDropdownOpen(false)}
                              role="menuitem"
                            >
                              <Shield className="w-5 h-5 mr-3 text-red-500 group-hover:scale-110 transition-transform" />
                              {tf("admin")}
                            </Link>
                            <div className="border-t border-gray-100 dark:border-gray-700 mx-2" />
                          </>
                        )}
                        <Link
                          to="/account"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 dark:hover:from-emerald-900/20 dark:hover:to-emerald-800/20 transition-all duration-200 rounded-lg mx-1"
                          onClick={() => setIsDropdownOpen(false)}
                          role="menuitem"
                        >
                          <UserCircle className="w-5 h-5 mr-3 text-gray-500 group-hover:scale-110 transition-transform" />
                          {tf("myAccount")}
                        </Link>
                        <div className="border-t border-gray-100 dark:border-gray-700 mx-2" />
                        <button
                          onClick={() => {
                            logout();
                            setIsDropdownOpen(false);
                          }}
                          className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/20 dark:hover:to-red-800/20 transition-all duration-200 rounded-lg mx-1"
                          role="menuitem"
                        >
                          <LogOut className="w-5 h-5 mr-3 text-gray-500 group-hover:scale-110 transition-transform" />
                          {tf("logout")}
                        </button>
                      </div>
                    </Motion.div>
                  )}
                </AnimatePresence>

                {isDropdownOpen && !isDesktop && (
                  <div
                    onClick={() => setIsDropdownOpen(false)}
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                  />
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="group hidden sm:flex items-center justify-center gap-1.5 px-3 lg:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
              >
                <UserCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="hidden lg:inline">{tf("login")}</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="group lg:hidden relative w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 shadow-md hover:shadow-lg active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <div className="relative w-5 h-5">
                <span
                  className={`absolute left-0 top-1/2 w-5 h-0.5 bg-current transform -translate-y-1/2 transition-all duration-300 ${isMenuOpen ? "rotate-45" : ""}`}
                ></span>
                <span
                  className={`absolute left-0 top-1/2 w-5 h-0.5 bg-current transform -translate-y-1/2 transition-all duration-300 ${isMenuOpen ? "opacity-0" : ""}`}
                ></span>
                <span
                  className={`absolute left-0 top-1/2 w-5 h-0.5 bg-current transform -translate-y-1/2 transition-all duration-300 ${isMenuOpen ? "-rotate-45" : ""}`}
                ></span>
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-400/0 to-emerald-500/0 group-hover:from-emerald-400/10 group-hover:to-emerald-500/10 transition-all duration-300" />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE NAV */}
      <AnimatePresence>
        {isMenuOpen && (
          <Motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <div className="px-4 py-3 space-y-1">
              {/* Mobile Quick Actions */}
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-200 dark:border-gray-700">
                <Link
                  to="/wishlist"
                  className="group flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-emerald-50 hover:to-emerald-100 dark:hover:from-emerald-900/20 dark:hover:to-emerald-800/20 active:scale-98 transition-all duration-300 shadow-sm hover:shadow-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="w-4 h-4 group-hover:scale-110 group-hover:fill-current group-hover:text-emerald-500 transition-all duration-300" />
                  <span className="text-sm sm:text-base font-medium">
                    {tf("wishlistText")}
                  </span>
                </Link>
                <div className="flex items-center gap-1 lg:hidden">
                  <LanguageSwitcher />
                  <ThemeToggle />
                </div>
              </div>

              {/* Mobile Search */}
              <form
                onSubmit={(e) => {
                  handleSearch(e);
                  setIsMenuOpen(false);
                }}
                className="pb-3 mb-3 border-b border-gray-200 dark:border-gray-700"
              >
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={tf("searchPlaceholder", "Search medicines…")}
                  className="
                    w-full h-11 px-4 rounded-xl
                    bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white
                    focus:ring-2 focus:ring-emerald-500
                    border border-transparent focus:border-emerald-500
                    placeholder:text-gray-500 dark:placeholder:text-gray-400
                  "
                />
              </form>

              {/* Nav Links */}
              {navLinks.map(([label, link]) => (
                <Link
                  key={link}
                  to={link}
                  className="group flex items-center px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 dark:hover:from-emerald-900/20 dark:hover:to-emerald-800/20 hover:text-emerald-700 dark:hover:text-emerald-300 active:scale-98 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    {label}
                  </span>
                </Link>
              ))}

              {/* Mobile User Section */}
              {user ? (
                <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700 space-y-1 sm:hidden">
                  {user?.role === "ADMIN" && (
                    <Link
                      to="/admin"
                      className="group flex items-center px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/20 dark:hover:to-red-800/20 active:scale-98 transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Shield className="w-5 h-5 mr-3 text-red-500 group-hover:scale-110 transition-transform duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {tf("admin")}
                      </span>
                    </Link>
                  )}
                  <Link
                    to="/account"
                    className="group flex items-center px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 dark:hover:from-emerald-900/20 dark:hover:to-emerald-800/20 active:scale-98 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserCircle className="w-5 h-5 mr-3 text-gray-500 group-hover:scale-110 transition-transform duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {tf("myAccount")}
                    </span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="group flex items-center w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/20 dark:hover:to-red-800/20 active:scale-98 transition-all duration-300"
                  >
                    <LogOut className="w-5 h-5 mr-3 text-gray-500 group-hover:scale-110 transition-transform duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {tf("logout")}
                    </span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="group flex items-center justify-center gap-2 px-4 py-2.5 mt-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 active:scale-95 transition-all duration-300 sm:hidden"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    {tf("login")}
                  </span>
                </Link>
              )}
            </div>
          </Motion.nav>
        )}
      </AnimatePresence>

      {/* DESKTOP NAV */}
      <nav className="hidden lg:block bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="px-6 h-12 flex items-center gap-0.5">
          {navLinks.map(([label, link]) => (
            <Link
              key={link}
              to={link}
              className="group px-3 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 dark:hover:from-emerald-900/20 dark:hover:to-emerald-800/20 hover:text-emerald-700 dark:hover:text-emerald-300 active:scale-98 transition-all duration-300"
            >
              <span className="group-hover:translate-y-[-1px] transition-transform duration-300">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
