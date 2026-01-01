import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  ShoppingBagIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

const menuItems = [
  { id: 1, name: "Home", path: "/", icon: HomeIcon },
  { id: 2, name: "Products", path: "/products", icon: ShoppingBagIcon },
  { id: 3, name: "Orders", path: "/orders", icon: ClipboardDocumentListIcon },
  { id: 4, name: "Wishlist", path: "/wishlist", icon: HeartIcon },
  { id: 5, name: "Profile", path: "/profile", icon: UserIcon },
];

export default function FloatingSidebar() {
  const [isExpanded, setIsExpanded] = useState(true); // expanded by default
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Mobile sidebar drawer
  const mobileSidebar = (
    <>
      <button
        className="fixed bottom-6 left-6 z-50 md:hidden bg-emerald-600 text-white p-4 rounded-full shadow-2xl border-4 border-white dark:border-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
        style={{ boxShadow: "0 8px 32px 0 rgba(0,0,0,0.25)" }}
      >
        <Bars3Icon className="w-7 h-7" />
      </button>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 max-w-[80vw] h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-2xl animate-slideInLeft pt-[4.5rem] z-50">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <span className="font-bold text-lg">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close sidebar"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="w-6 h-6 flex-shrink-0" />
                    <span className="font-medium whitespace-nowrap">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );

  // Desktop sidebar
  const desktopSidebar = (
    <aside
      className={`hidden md:flex fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-50 ${
        isExpanded ? "w-64" : "w-16"
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(true)}
    >
      <div className="flex flex-col h-full py-4">
        <nav className="flex-1 px-2 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="w-6 h-6 flex-shrink-0" />
                <span className="font-medium whitespace-nowrap transition-opacity duration-200 opacity-100">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );

  return (
    <>
      {mobileSidebar}
      {desktopSidebar}
    </>
  );
}
