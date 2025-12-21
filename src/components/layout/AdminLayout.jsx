import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { Bars3Icon } from "@heroicons/react/24/outline";

function MobileSidebar({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden transition-opacity duration-300">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative h-full">
        <AdminSidebar isCollapsed={false} setCollapsed={() => {}} />
      </div>
    </div>
  );
}

function MobileHeader({ onMenuClick }) {
  return (
    <header className="lg:hidden sticky top-0 bg-white shadow-sm z-20">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700"
            onClick={onMenuClick}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <span className="text-lg font-bold">Admin Panel</span>
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout({ children }) {
  const [isCollapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:z-30">
        <AdminSidebar isCollapsed={isCollapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-20" : "lg:pl-60"
        }`}
      >
        <MobileHeader onMenuClick={() => setMobileOpen(true)} />
        <main className="w-full py-6 md:py-10">{children}</main>
      </div>
    </div>
  );
}
