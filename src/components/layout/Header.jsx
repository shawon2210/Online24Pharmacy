import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCartIcon, 
  UserIcon, 
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  HeartIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

const categories = [
  { id: 1, name: 'Medicines', slug: 'medicines', icon: '💊' },
  { id: 2, name: 'Surgical', slug: 'surgical', icon: '🏥' },
  { id: 3, name: 'Diagnostics', slug: 'diagnostics', icon: '🔬' },
  { id: 4, name: 'PPE & Safety', slug: 'ppe', icon: '🦺' },
  { id: 5, name: 'Wound Care', slug: 'wound-care', icon: '🩹' },
  { id: 6, name: 'Hospital', slug: 'hospital', icon: '⚕️' }
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(() => 
    localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <header className={`sticky top-0 z-50 w-full backdrop-blur-md bg-gradient-to-r from-emerald-600/95 via-emerald-500/95 to-teal-500/95 shadow-lg transition-all duration-300 ${isScrolled ? 'shadow-2xl' : ''}`}>
        {/* Top Info Bar */}
        <div className="hidden lg:block border-b border-white/10 bg-emerald-700/20">
          <div className="w-full px-6 xl:px-8">
            <div className="flex items-center justify-between h-9 text-xs text-white/90 max-w-[1920px] mx-auto">
              <div className="flex items-center gap-8">
                <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>
                  +880 1234-567890
                </span>
                <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
                  support@online24pharmacy.com
                </span>
              </div>
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                  Dhaka, Bangladesh
                </span>
                <span className="flex items-center gap-2 font-semibold">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                  24/7 Available
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="w-full px-6 xl:px-8 py-3">
          <div className="flex items-center justify-between gap-4 max-w-[1920px] mx-auto">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-100 to-teal-100 rounded-2xl shadow-2xl group-hover:scale-110 transition-all duration-300 animate-pulse"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-all duration-300 border-2 border-white/40">
                  <span className="text-white text-2xl font-black tracking-tighter drop-shadow-lg">O24</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black text-white drop-shadow-lg tracking-tight bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">Online24 Pharmacy</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="relative">
                    <div className="absolute inset-0 w-2 h-2 bg-emerald-300 rounded-full blur-sm"></div>
                    <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-xs text-white/95 font-bold tracking-wide">Licensed & Certified</p>
                </div>
              </div>
            </Link>

            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-3xl mx-8">
              <div className="relative w-full group">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors z-10" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search medicines, health products, prescriptions..."
                  className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white shadow-lg border-2 border-white/50 text-gray-700 placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white transition-all"
                />
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2.5">
              {/* Theme Toggle */}
              <button 
                onClick={() => setIsDark(!isDark)} 
                className="group relative flex items-center justify-center w-11 h-11 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 border border-white/20 shadow-lg"
                aria-label="Toggle theme"
              >
                {isDark ? 
                  <SunIcon className="w-5 h-5 text-yellow-300 drop-shadow-lg" /> : 
                  <MoonIcon className="w-5 h-5 text-blue-100 drop-shadow-lg" />
                }
                <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-gray-900/90 backdrop-blur-sm text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>
              
              {/* Wishlist */}
              <Link 
                to="/wishlist" 
                className="hidden sm:flex group relative items-center justify-center w-11 h-11 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 border border-white/20 shadow-lg"
              >
                <HeartIcon className="w-5 h-5 text-white drop-shadow-lg" />
                <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-gray-900/90 backdrop-blur-sm text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">Wishlist</span>
              </Link>
              
              {/* Cart */}
              <Link 
                to="/cart" 
                className="group relative flex items-center justify-center w-11 h-11 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 border border-white/20 shadow-lg"
              >
                <ShoppingCartIcon className="w-5 h-5 text-white drop-shadow-lg" />
                <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5 bg-gradient-to-br from-red-500 via-red-600 to-pink-600 text-white text-[11px] rounded-full flex items-center justify-center font-bold shadow-xl ring-2 ring-white/40 animate-pulse">0</span>
                <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-gray-900/90 backdrop-blur-sm text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">Cart</span>
              </Link>
              {user ? (
                <div className="hidden lg:block relative group">
                  <button className="flex items-center gap-3 h-11 px-5 rounded-2xl bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white/30 shadow-xl">
                    <div className="relative">
                      <div className="absolute inset-0 w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full blur-sm"></div>
                      <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-white via-emerald-50 to-teal-50 flex items-center justify-center text-emerald-700 font-black text-sm shadow-lg ring-2 ring-white/50">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-white drop-shadow-lg">{user.name}</span>
                    <svg className="w-4 h-4 text-white/90 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <div className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                    <div className="py-2">
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors">
                        <UserIcon className="w-4 h-4" />
                        My Profile
                      </Link>
                      <Link to="/my-orders" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors">
                        <ShoppingCartIcon className="w-4 h-4" />
                        My Orders
                      </Link>
                      <Link to="/my-prescriptions" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        My Prescriptions
                      </Link>
                      <Link to="/addresses" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Addresses
                      </Link>
                      <Link to="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Settings
                      </Link>
                      <hr className="my-2 border-gray-200 dark:border-gray-700" />
                      <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link 
                  to="/auth/login" 
                  className="hidden lg:flex items-center gap-2.5 h-11 px-6 rounded-2xl bg-gradient-to-r from-white to-emerald-50 text-emerald-600 hover:from-emerald-50 hover:to-white transition-all duration-300 font-black text-sm shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 border-2 border-white/50"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <UserIcon className="w-3 h-3 text-white" />
                  </div>
                  Login
                </Link>
              )}
              
              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="lg:hidden flex items-center justify-center w-11 h-11 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 border border-white/20 shadow-lg"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <XMarkIcon className="w-6 h-6 text-white drop-shadow-lg" /> : <Bars3Icon className="w-6 h-6 text-white drop-shadow-lg" />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="md:hidden px-6 pb-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicines..."
                className="w-full h-11 pl-12 pr-4 rounded-xl bg-white shadow-lg border-2 border-white/50 text-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </form>
        </div>
      </header>

      {/* Navigation */}
      <nav className="hidden lg:block w-full bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-b-2 border-gray-200 dark:border-gray-700 shadow-md">
        <div className="w-full px-6 xl:px-8">
          <div className="flex items-center gap-2 h-14 max-w-[1920px] mx-auto">
            <Link to="/" className="relative px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all duration-300 hover:scale-105 group">
              <span className="relative z-10">Home</span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <div className="relative group">
              <button className="relative px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2">
                <span className="relative z-10">Categories</span>
                <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
              <div className="absolute left-0 top-full mt-2 w-[520px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                <div className="grid grid-cols-2 gap-2 p-4">
                  {categories.map((cat) => (
                    <Link key={cat.id} to={`/category/${cat.slug}`} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 transition-all duration-300 hover:scale-105 group/item">
                      <span className="text-3xl group-hover/item:scale-110 transition-transform">{cat.icon}</span>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link to="/prescription" className="relative px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all duration-300 hover:scale-105 group">
              <span className="relative z-10">Prescription</span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <Link to="/build-kit" className="relative px-5 py-2.5 text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 rounded-xl transition-all duration-300 hover:scale-105 group">
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                Build Kit
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <Link to="/my-orders" className="relative px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all duration-300 hover:scale-105 group">
              <span className="relative z-10">My Orders</span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <Link to="/track-order" className="relative px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all duration-300 hover:scale-105 group">
              <span className="relative z-10">Track Order</span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <Link to="/about" className="relative px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all duration-300 hover:scale-105 group">
              <span className="relative z-10">About</span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">Home</Link>
            <Link to="/products" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">Products</Link>
            <Link to="/prescriptions" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">Prescription</Link>
            <Link to="/my-orders" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">My Orders</Link>
            <Link to="/track-order" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">Track Order</Link>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">About</Link>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
              <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Categories</p>
              {categories.map((cat) => (
                <Link key={cat.id} to={`/category/${cat.slug}`} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">
                  <span className="text-xl">{cat.icon}</span>
                  {cat.name}
                </Link>
              ))}
            </div>
            {user ? (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-1">
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">My Profile</Link>
                <Link to="/my-orders" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">My Orders</Link>
                <Link to="/my-prescriptions" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">My Prescriptions</Link>
                <Link to="/addresses" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">Addresses</Link>
                <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">Wishlist</Link>
                <Link to="/settings" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">Settings</Link>
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md">Logout</button>
              </div>
            ) : (
              <Link to="/auth/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md text-center mt-2">Login</Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
