import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../../stores/cartStore";
import { useAuth } from "../../hooks/useAuth";
import { useScrollAwareHeader } from "../../hooks/useScrollAwareHeader";
import ThemeToggle from "../common/ThemeToggle";
import LanguageSwitcher from "../common/LanguageSwitcher";

/* ---------- Constants ---------- */
const Categories = [
  { id: 1, name: "Medicines", slug: "medicines", icon: "💊" },
  { id: 2, name: "Surgical", slug: "surgical", icon: "🏥" },
  { id: 3, name: "Diagnostics", slug: "diagnostics", icon: "🔬" },
  { id: 4, name: "PPE & Safety", slug: "ppe", icon: "🦺" },
  { id: 5, name: "Wound Care", slug: "wound-care", icon: "🩹" },
  { id: 6, name: "Hospital", slug: "hospital", icon: "⚕️" },
];

/* ---------- Icons (unchanged) ---------- */
// (icons unchanged for brevity — keep yours exactly as-is)

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const headerRef = useRef(null);

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

  return (
    <div
      style={{
        transform: headerVisible ? "translateY(0)" : "translateY(-110%)",
        transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
        willChange: "transform",
      }}
    >
      {/* =================== TOP INFO BAR =================== */}
      <div className="hidden md:block bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-900 border-b border-white/10">
        <div className="px-6 h-10 flex items-center justify-between text-xs text-emerald-100">
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
          sticky top-0 z-50 backdrop-blur-xl
          bg-linear-to-br from-emerald-600/95 via-emerald-500/95 to-teal-600/95
          ${isScrolled ? "shadow-2xl" : "shadow-xl"}
        `}
        role="banner"
      >
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-lg">
                <span className="text-emerald-700 font-black text-lg">O24</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-white font-bold leading-tight">
                  Online24 Pharmacy
                </h1>
                <p className="text-[11px] text-white/80">DGDA Licensed</p>
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
                  bg-white/95 text-gray-900
                  focus:ring-2 focus:ring-emerald-300
                  shadow-md
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
                rounded-xl bg-white/20 hover:bg-white/30 transition"
              >
                🛒
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <button
                  onClick={logout}
                  className="hidden lg:flex px-4 py-2 rounded-xl
                  bg-white text-emerald-700 font-semibold shadow"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="hidden lg:flex px-4 py-2 rounded-xl
                  bg-white text-emerald-700 font-semibold shadow"
                >
                  Login
                </Link>
              )}

              {/* Mobile Menu */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden w-10 h-10 rounded-xl bg-white/20"
              >
                ☰
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* =================== DESKTOP NAV =================== */}
      <nav className="hidden lg:block bg-emerald-950 border-t border-white/10">
        <div className="px-6 h-12 flex items-center gap-2">
          {[
            ["Home", "/"],
            ["Products", "/products"],
            ["Categories", "/categories"],
            ["Prescription", "/prescription"],
            ["Orders", "/my-orders"],
            ["Pickup", "/pickup-map"],
            ["Track Order", "/track-order"],
            ["Build a Kit", "/build-kit"],
            ["About", "/about"],
          ].map(([label, link]) => (
            <Link
              key={link}
              to={link}
              className="px-4 py-2 rounded-lg text-sm text-white/90
              hover:bg-white/10 transition"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
