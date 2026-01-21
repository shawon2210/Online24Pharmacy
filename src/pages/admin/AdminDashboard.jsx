/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import AdminNotificationBell from "../../components/notifications/AdminNotificationBell";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/analytics/dashboard");
      setAnalytics(response.data);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Revenue",
      value: `৳${analytics?.totalRevenue?.toLocaleString() || 0}`,
      icon: "💰",
      color: "bg-emerald-600",
      change: "+12.5%",
    },
    {
      label: "Total Orders",
      value: analytics?.totalOrders?.toLocaleString() || 0,
      icon: "📦",
      color: "bg-blue-600",
      change: "+8.2%",
    },
    {
      label: "Total Customers",
      value: analytics?.totalCustomers?.toLocaleString() || 0,
      icon: "👥",
      color: "bg-purple-600",
      change: "+15.3%",
    },
    {
      label: "Conversion Rate",
      value: `${analytics?.conversionRate || 0}%`,
      icon: "📈",
      color: "bg-orange-600",
      change: "+2.1%",
    },
  ];

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-background min-h-screen">
      {/* Header with Time */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium">
            Here's what's happening with your pharmacy today
          </p>
        </div>
        <div className="flex items-center gap-4">
          <AdminNotificationBell />
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-semibold text-muted-foreground">
              Today
            </span>
            <span className="text-lg font-bold text-foreground">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="group relative bg-background dark:bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-border hover:border-emerald-200 dark:hover:border-emerald-700 hover:-translate-y-1 overflow-hidden"
          >
            {/* Background Gradient */}
            <div
              className={`absolute inset-0 ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
            />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform duration-300`}
                >
                  {stat.icon}
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {stat.change}
                </span>
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {stat.label}
              </p>
              <p className="text-3xl font-black text-foreground">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <span>Quick actions</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/admin/products"
            className="group relative bg-emerald-600 dark:bg-emerald-700 rounded-xl p-6 shadow-md hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-background opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="relative z-10 flex items-center space-x-4">
              <div className="w-14 h-14 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                ➕
              </div>
              <div className="flex-1">
                <p className="font-bold text-background text-lg mb-1">
                  Add product
                </p>
                <p className="text-sm text-emerald-50 dark:text-emerald-200">
                  Create a new medicine
                </p>
              </div>
              <svg
                className="w-5 h-5 text-background opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
          <Link
            to="/admin/shops"
            className="group relative bg-cyan-600 dark:bg-cyan-700 rounded-xl p-6 shadow-md hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-background opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="relative z-10 flex items-center space-x-4">
              <div className="w-14 h-14 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🏪
              </div>
              <div className="flex-1">
                <p className="font-bold text-background text-lg mb-1">
                  Manage Pickup Shops
                </p>
                <p className="text-sm text-cyan-50 dark:text-cyan-200">
                  Upload & edit pickup locations
                </p>
              </div>
              <svg
                className="w-5 h-5 text-background opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
          <Link
            to="/admin/prescriptions"
            className="group relative bg-amber-600 dark:bg-amber-700 rounded-xl p-6 shadow-md hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-background opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="relative z-10 flex items-center space-x-4">
              <div className="w-14 h-14 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                📋
              </div>
              <div className="flex-1">
                <p className="font-bold text-background text-lg mb-1">
                  Review prescriptions
                </p>
                <p className="text-sm text-amber-50 dark:text-amber-200">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-white/30 dark:bg-black/30 rounded-full text-xs font-bold mr-1">
                    {analytics?.pendingPrescriptions || 0}
                  </span>
                  prescriptions awaiting review
                </p>
              </div>
              <svg
                className="w-5 h-5 text-background opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
          <Link
            to="/admin/orders"
            className="group relative bg-blue-600 dark:bg-blue-700 rounded-xl p-6 shadow-md hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-background opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="relative z-10 flex items-center space-x-4">
              <div className="w-14 h-14 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                📦
              </div>
              <div className="flex-1">
                <p className="font-bold text-background text-lg mb-1">
                  Manage Orders
                </p>
                <p className="text-sm text-blue-50 dark:text-blue-200">
                  View and update orders
                </p>
              </div>
              <svg
                className="w-5 h-5 text-background opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
          <Link
            to="/admin/reviews"
            className="group relative bg-purple-600 dark:bg-purple-700 rounded-xl p-6 shadow-md hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-background opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="relative z-10 flex items-center space-x-4">
              <div className="w-14 h-14 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                ⭐
              </div>
              <div className="flex-1">
                <p className="font-bold text-background text-lg mb-1">
                  Moderate Reviews
                </p>
                <p className="text-sm text-purple-50 dark:text-purple-200">
                  Approve/reject reviews
                </p>
              </div>
              <svg
                className="w-5 h-5 text-background opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-background dark:bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center text-background font-bold">
                📊
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Latest orders
                </h3>
                <p className="text-sm text-muted-foreground">
                  Real-time activity from your customers
                </p>
              </div>
            </div>
            <Link
              to="/admin/orders"
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View all orders
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100 dark:bg-card/50">
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background dark:bg-card">
              {analytics?.recentOrders?.map((order, idx) => (
                <tr
                  key={order.id}
                  className={`border-b border-border hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all duration-200 ${
                    idx % 2 === 0
                      ? "bg-background dark:bg-card"
                      : "bg-background/30 dark:bg-card/30"
                  }`}
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-foreground">
                      #{order.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {order.customer.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      ৳{order.totalAmount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border-2 ${
                        order.status === "completed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : order.status === "shipped"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          order.status === "completed"
                            ? "bg-emerald-500"
                            : order.status === "shipped"
                              ? "bg-blue-500"
                              : "bg-amber-500"
                        }`}
                      />
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      View
                    </Link>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-muted-foreground"
                  >
                    No recent orders
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
