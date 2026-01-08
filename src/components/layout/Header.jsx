import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../../stores/cartStore";
import { useAuth } from "../../hooks/useAuth";
import { useScrollAwareHeader } from "../../hooks/useScrollAwareHeader";
import ThemeToggle from "../common/ThemeToggle";
import LanguageSwitcher from "../common/LanguageSwitcher";
import { UserCircle, LogOut, ShoppingCart, Menu, X } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const headerRef = useRef(null);
  const dropdownRef = useRef(null);

  const { t } = useTranslation();
  const { headerVisible, isScrolled } = useScrollAwareHeader();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const cartCount = useCartStore((state) => state.getTotalItems());

  const tf = (key, fallback) => {
    try {
      const res = t(key);
      if (res && res !== key) return res;
    } catch (_e) {
      // Translation key not found
    }
    return fallback ?? key;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navLinks = [
    ["Home", "/"],
    ["Products", "/products"],
    ["Categories", "/categories"],
    ["Prescription", "/prescription"],
    ["Orders", "/my-orders"],
    ["Pickup", "/pickup-map"],
    ["Track Order", "/track-order"],
    ["Build a Kit", "/build-kit"],
    ["About", "/about"],
  ];

  return (
    <div
      style={{
        transform: headerVisible ? "translateY(0)" : "translateY(-110%)",
        transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
        willChange: "transform",
      }}
    >
      {/* =================== TOP INFO BAR =================== */}
      <div className="hidden md:block bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 h-10 flex items-center justify-between text-xs">
          <div className="flex gap-6">
            <span>📞 +880-1234-567890</span>
            <span>✉ support@online24pharmacy.com</span>
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

      {/* =================== MAIN HEADER =================== */}
      <header
        ref={headerRef}
        className={`
          sticky top-0 z-50 
          bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg
          ${isScrolled ? "shadow-lg" : ""}
        `}
        role="banner"
      >
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-lg">O24</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-gray-800 dark:text-white font-bold leading-tight">
                  Online24 Pharmacy
                </h1>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  DGDA Licensed
                </p>
              </div>
            </Link>

            {/* Desktop Search */}
            <form
              onSubmit={handleSearch}
              className="hidden md:block flex-1 max-w-xl"
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
                "
              />
            </form>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <ThemeToggle />

              <Link
                to="/cart"
                className="relative w-10 h-10 flex items-center justify-center
                rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-white
                hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div
                  className="relative"
                  ref={dropdownRef}
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <img
                    src={
                      user.profilePicture ||
                      `https://i.pravatar.cc/150?u=${user.id}`
                    }
                    alt="User"
                    className="w-10 h-10 rounded-full cursor-pointer"
                  />
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <Motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="py-1">
                          <Link
                            to="/account"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <UserCircle className="w-5 h-5 mr-2 text-gray-500" />
                            Account
                          </Link>
                          <div className="border-t border-gray-100 dark:border-gray-700" />
                          <button
                            onClick={() => {
                              logout();
                              setIsDropdownOpen(false);
                            }}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <LogOut className="w-5 h-5 mr-2 text-gray-500" />
                            Logout
                          </button>
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden lg:flex px-4 py-2 rounded-xl
                  bg-emerald-500 text-white font-semibold shadow hover:bg-emerald-600 transition"
                >
                  Login
                </Link>
              )}

              {/* Mobile Menu */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-white"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* =================== MOBILE NAV =================== */}
        <AnimatePresence>
          {isMenuOpen && (
            <Motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="px-4 py-2">
                {navLinks.map(([label, link]) => (
                  <Link
                    key={link}
                    to={link}
                    className="block px-4 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </Motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* =================== DESKTOP NAV =================== */}
      <nav className="hidden lg:block bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="px-6 h-12 flex items-center gap-2">
          {navLinks.map(([label, link]) => (
            <Link
              key={link}
              to={link}
              className="px-4 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
