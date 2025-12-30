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
  MapPinIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
  { name: "Products", href: "/admin/products", icon: ShoppingBagIcon },
  { name: "Categories", href: "/admin/categories", icon: Squares2X2Icon },
  {
    name: "Pickup Locations",
    href: "/admin/pickup-locations",
    icon: MapPinIcon,
  },
  { name: "Orders", href: "/admin/orders", icon: ClipboardDocumentListIcon },
  {
    name: "Prescriptions",
    href: "/admin/prescriptions",
    icon: DocumentTextIcon,
  },
  { name: "Customers", href: "/admin/customers", icon: UsersIcon },
  {
    name: "Audit Log",
    href: "/admin/audit-log",
    icon: ClipboardDocumentCheckIcon,
  },
  { name: "Analytics", href: "/admin/analytics", icon: ChartBarIcon },
];

export default function AdminSidebar({ isCollapsed, setCollapsed }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (href) => location.pathname.startsWith(href);

  return (
    <div
      className={`flex flex-col bg-card text-card-foreground transition-all duration-300 ease-in-out shadow-lg h-full ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center h-20 px-4">
        <div
          className={`flex items-center gap-3 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-xl">
              ⚕️
            </span>
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold text-foreground">
              Admin Panel
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              title={item.name}
              className={`flex items-center p-3 rounded-lg transition-all duration-200 relative ${
                active
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "hover:bg-muted"
              } ${isCollapsed ? "justify-center" : ""}`}
            >
              <Icon
                className={`h-6 w-6 flex-shrink-0 ${
                  !isCollapsed ? "mr-4" : ""
                }`}
              />
              {!isCollapsed && <span className="font-medium">{item.name}</span>}
              {active && !isCollapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-primary-foreground rounded-r-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Button & User Info */}
      <div className="p-3 border-t border-border">
        <button
          onClick={() => setCollapsed(!isCollapsed)}
          className="w-full hidden lg:flex items-center p-3 rounded-lg hover:bg-muted mb-2 transition-all duration-200"
        >
          <ChevronDoubleLeftIcon
            className={`h-6 w-6 text-muted-foreground transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : ""
            } ${!isCollapsed ? "mr-4" : "mx-auto"}`}
          />
          {!isCollapsed && (
            <span className="text-muted-foreground font-medium">Collapse</span>
          )}
        </button>
        <div
          className={`flex items-center p-3 rounded-lg ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-primary-foreground">
              {user?.firstName?.[0]}
            </span>
          </div>
          {!isCollapsed && (
            <div className="ml-3">
              <p className="text-sm font-semibold text-foreground">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center p-3 rounded-lg hover:bg-destructive hover:text-destructive-foreground mt-2 transition-all duration-200"
        >
          <ArrowRightOnRectangleIcon
            className={`h-6 w-6 text-muted-foreground ${
              !isCollapsed ? "mr-4" : "mx-auto"
            }`}
          />
          {!isCollapsed && (
            <span className="text-muted-foreground font-medium">Sign out</span>
          )}
        </button>
      </div>
    </div>
  );
}
