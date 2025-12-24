import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function AdminLayout({ children }) {
  const [isCollapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
        <div className="relative h-full w-64">
          <AdminSidebar isCollapsed={false} setCollapsed={() => {}} />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:z-30">
        <AdminSidebar isCollapsed={isCollapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <header className="lg:hidden sticky top-0 bg-white shadow-sm z-20">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-700"
                onClick={() => setMobileOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <span className="text-lg font-bold">Admin Panel</span>
            </div>
          </div>
        </header>
        <main className="w-full py-6 md:py-10 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
