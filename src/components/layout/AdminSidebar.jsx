import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  HomeIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  UsersIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  ArrowRightOnRectangleIcon,
  ChevronDoubleLeftIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
  { name: "Products", href: "/admin/products", icon: ShoppingBagIcon },
  { name: "Categories", href: "/admin/categories", icon: Squares2X2Icon },
  { name: "Orders", href: "/admin/orders", icon: ClipboardDocumentListIcon },
  { name: "Prescriptions", href: "/admin/prescriptions", icon: DocumentTextIcon },
  { name: "Customers", href: "/admin/customers", icon: UsersIcon },
  { name: "Audit Log", href: "/admin/audit-log", icon: ClipboardDocumentCheckIcon },
  { name: "Analytics", href: "/admin/analytics", icon: ChartBarIcon },
];

export default function AdminSidebar({ isCollapsed, setCollapsed }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (href) => location.pathname.startsWith(href);

  return (
    <div
      className={`hidden lg:flex flex-col bg-gray-800 text-white transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4">
        <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">⚕️</span>
            </div>
            {!isCollapsed && <span className="text-lg font-bold">Admin</span>}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              title={item.name}
              className={`flex items-center p-2 rounded-lg transition-colors ${
                active ? "bg-primary" : "hover:bg-gray-700"
              } ${isCollapsed ? "justify-center" : ""}`}
            >
              <Icon className={`h-6 w-6 flex-shrink-0 ${!isCollapsed ? "mr-3" : ""}`} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Button & User Info */}
      <div className="p-2 border-t border-gray-700">
        <button
          onClick={() => setCollapsed(!isCollapsed)}
          className="w-full flex items-center p-2 rounded-lg hover:bg-gray-700 mb-2"
        >
          <ChevronDoubleLeftIcon
            className={`h-6 w-6 text-gray-400 transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : ""
            } ${!isCollapsed ? "mr-3" : "mx-auto"}`}
          />
          {!isCollapsed && <span className="text-gray-300">Collapse</span>}
        </button>
        <div className="flex items-center p-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium">{user?.firstName?.[0]}</span>
            </div>
            {!isCollapsed && (
                <div className="ml-3">
                    <p className="text-sm font-medium">{user?.firstName}</p>
                </div>
            )}
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center p-2 rounded-lg hover:bg-gray-700 mt-2"
        >
          <ArrowRightOnRectangleIcon className={`h-6 w-6 text-gray-400 ${!isCollapsed ? "mr-3" : "mx-auto"}`} />
          {!isCollapsed && <span className="text-gray-300">Sign out</span>}
        </button>
      </div>
    </div>
  );
}
