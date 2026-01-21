import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { Navigate } from "react-router-dom";
import {
  ChartBarIcon,
  UsersIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { fetchAnalytics } from "../../utils/api";
import SEOHead from "../../components/common/SEOHead";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState("30d");
  const { logout } = useAuth();
  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["analytics", timeRange],
    queryFn: fetchAnalytics,
  });

  useEffect(() => {
    if (
      error?.response?.status === 403 ||
      error?.response?.data?.error === "Invalid token"
    ) {
      logout();
    }
  }, [error, logout]);

  const metrics = [
    {
      title: "Total Revenue",
      value: `৳${analytics?.totalRevenue?.toLocaleString() || 0}`,
      change: "+12.5%",
      icon: CurrencyDollarIcon,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Orders",
      value: analytics?.totalOrders?.toLocaleString() || 0,
      change: "+8.2%",
      icon: ShoppingBagIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Customers",
      value: analytics?.totalCustomers?.toLocaleString() || 0,
      change: "+15.3%",
      icon: UsersIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Conversion Rate",
      value: `${analytics?.conversionRate || 0}%`,
      change: "+2.1%",
      icon: ArrowTrendingUpIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  // Sample data for charts (replace with real data when available)
  const salesTrendData = {
    labels: analytics?.salesTrend?.map((item) =>
      new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    ) || ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Revenue (৳)",
        data: analytics?.salesTrend?.map((item) => item.revenue) || [
          12000, 19000, 15000, 25000, 22000, 30000,
        ],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        yAxisID: "y",
      },
      {
        label: "Orders",
        data: analytics?.salesTrend?.map((item) => item.orders) || [
          12, 19, 15, 25, 22, 30,
        ],
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        yAxisID: "y1",
      },
    ],
  };

  const topProductsData = {
    labels:
      analytics?.topProducts?.map(
        (p) => p.name.substring(0, 20) + (p.name.length > 20 ? "..." : ""),
      ) || [],
    datasets: [
      {
        label: "Units Sold",
        data: analytics?.topProducts?.map((p) => p.sales) || [],
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 205, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
          "rgba(255, 159, 64, 0.8)",
          "rgba(201, 203, 207, 0.8)",
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 205, 86, 0.8)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const orderStatusData = {
    labels: ["Completed", "Pending", "Processing", "Cancelled"],
    datasets: [
      {
        data: [
          analytics?.orderStatusDistribution?.completed || 0,
          analytics?.orderStatusDistribution?.pending || 0,
          analytics?.orderStatusDistribution?.processing || 0,
          analytics?.orderStatusDistribution?.cancelled || 0,
        ],
        backgroundColor: [
          "rgba(16, 185, 129, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        beginAtZero: true,
        title: {
          display: true,
          text: "Revenue (৳)",
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        beginAtZero: true,
        title: {
          display: true,
          text: "Orders",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  if (isLoading) {
    return (
      <>
        <SEOHead title="Admin - Analytics" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="bg-background shadow rounded-lg p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading analytics...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEOHead title="Admin - Analytics" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="bg-background shadow rounded-lg p-6">
            <div className="text-center py-8">
              <p className="text-red-600">
                {error?.response?.status === 403
                  ? "Your session has expired. Please log in again."
                  : error?.response?.data?.error ||
                    error?.message ||
                    "Failed to load analytics data"}
              </p>
              {error?.response?.status === 403 ||
              error?.response?.data?.error === "Invalid token" ? null : (
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Admin - Analytics" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="bg-background shadow rounded-lg p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Analytics Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1 sm:mt-0">
              Monitor your pharmacy performance and trends
            </p>
          </div>

          {/* Time Range Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {[
                { value: "7d", label: "Last 7 days" },
                { value: "30d", label: "Last 30 days" },
                { value: "90d", label: "Last 90 days" },
                { value: "1y", label: "Last year" },
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    timeRange === range.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="bg-background border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {metric.title}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground mb-1">
                      {metric.value}
                    </p>
                    <p
                      className={`text-xs sm:text-sm font-medium ${metric.color}`}
                    >
                      {metric.change} from last period
                    </p>
                  </div>
                  <div
                    className={`p-2 sm:p-3 rounded-lg ${metric.bgColor} ml-3`}
                  >
                    <metric.icon
                      className={`w-5 h-5 sm:w-6 sm:h-6 ${metric.color}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            {/* Sales Trend Chart */}
            <div className="xl:col-span-2 bg-background border border-gray-200 rounded-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Sales Trend
                </h3>
                <ClockIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="h-64 sm:h-80">
                <Line data={salesTrendData} options={chartOptions} />
              </div>
            </div>

            {/* Order Status Distribution */}
            <div className="bg-background border border-gray-200 rounded-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Order Status
                </h3>
                <ChartBarIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="h-64 sm:h-80">
                <Doughnut data={orderStatusData} options={doughnutOptions} />
              </div>
            </div>
          </div>

          {/* Second Row Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top Products Chart */}
            <div className="bg-background border border-gray-200 rounded-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Top Products
                </h3>
                <ShoppingBagIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="h-64 sm:h-80">
                {analytics?.topProducts?.length > 0 ? (
                  <Bar data={topProductsData} options={barChartOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No product data available
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-background border border-gray-200 rounded-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Recent Orders
                </h3>
                <ClockIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {analytics?.recentOrders?.length > 0 ? (
                  analytics.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {order.customer.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-sm font-medium text-foreground">
                          ৳{order.totalAmount}
                        </p>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            order.paymentStatus === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.paymentStatus === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No recent orders
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Products List */}
            <div className="bg-background border border-gray-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Top Products
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {analytics?.topProducts?.length > 0 ? (
                  analytics.topProducts.slice(0, 5).map((product, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm text-foreground truncate max-w-xs">
                          {product.name}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {product.sales} sold
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No product sales data available
                  </p>
                )}
              </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-background border border-gray-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Performance Insights
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Revenue Growth
                    </p>
                    <p className="text-xs text-green-600">+12.5% this month</p>
                  </div>
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Order Volume
                    </p>
                    <p className="text-xs text-blue-600">
                      {analytics?.totalOrders?.toLocaleString() || 0} total
                      orders
                    </p>
                  </div>
                  <ShoppingBagIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-purple-800">
                      Customer Base
                    </p>
                    <p className="text-xs text-purple-600">
                      {analytics?.totalCustomers?.toLocaleString() || 0}{" "}
                      registered users
                    </p>
                  </div>
                  <UsersIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-orange-800">
                      Conversion Rate
                    </p>
                    <p className="text-xs text-orange-600">
                      {analytics?.conversionRate || 0}% completion rate
                    </p>
                  </div>
                  <ChartBarIcon className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-background border border-gray-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                  <div className="flex items-center space-x-3">
                    <ChartBarIcon className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        View Detailed Reports
                      </p>
                      <p className="text-xs text-blue-600">
                        Export analytics data
                      </p>
                    </div>
                  </div>
                </button>
                <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-md transition-colors">
                  <div className="flex items-center space-x-3">
                    <UsersIcon className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Customer Insights
                      </p>
                      <p className="text-xs text-green-600">
                        Analyze customer behavior
                      </p>
                    </div>
                  </div>
                </button>
                <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors">
                  <div className="flex items-center space-x-3">
                    <ShoppingBagIcon className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-purple-800">
                        Inventory Report
                      </p>
                      <p className="text-xs text-purple-600">
                        Check stock levels
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
