import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  LayoutDashboard,
  Menu,
  X,
  ShoppingCart,
  Users,
  ListOrdered,
  Stethoscope,
  MessageSquare,
  LogOut,
  Bell,
} from "lucide-react";

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const navLinkClasses = ({ isActive }) =>
    `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? "bg-emerald-700 text-background"
        : "text-muted hover:bg-emerald-600 hover:text-background"
    }`;

  return (
    <>
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen bg-card text-background transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-6 px-4">
            <NavLink to="/admin" className="flex items-center">
              <span className="self-center text-xl font-semibold whitespace-nowrap text-background">
                Admin Panel
              </span>
            </NavLink>
            <button
              onClick={toggleSidebar}
              className="md:hidden text-background"
            >
              <X size={24} />
            </button>
          </div>
          <ul className="space-y-2">
            <li>
              <NavLink to="/admin" end className={navLinkClasses}>
                <LayoutDashboard className="mr-3" size={20} />
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/products" className={navLinkClasses}>
                <ShoppingCart className="mr-3" size={20} />
                Products
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/categories" className={navLinkClasses}>
                <ListOrdered className="mr-3" size={20} />
                Categories
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/orders" className={navLinkClasses}>
                <ListOrdered className="mr-3" size={20} />
                Orders
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/customers" className={navLinkClasses}>
                <Users className="mr-3" size={20} />
                Customers
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/prescriptions" className={navLinkClasses}>
                <Stethoscope className="mr-3" size={20} />
                Prescriptions
              </NavLink>
            </li>
            {/* Add more links as needed */}
          </ul>
        </div>
      </aside>
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
        ></div>
      )}
    </>
  );
};

const AdminHeader = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-20 bg-background shadow-md md:left-64">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <button
          onClick={toggleSidebar}
          className="text-muted-foreground md:hidden"
        >
          <Menu size={24} />
        </button>
        <div className="hidden md:block">
          {/* Can add breadcrumbs here later */}
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative text-muted-foreground hover:text-emerald-600">
            <Bell size={22} />
            <span className="absolute top-0 right-0 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </button>
          <div className="flex items-center">
            <span className="text-sm font-medium text-foreground mr-2">
              Welcome, {user?.firstName || "Admin"}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center text-sm text-muted-foreground hover:text-red-600"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="bg-background min-h-screen">
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <AdminHeader toggleSidebar={toggleSidebar} />
      <main className="pt-16 md:ml-64">
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
