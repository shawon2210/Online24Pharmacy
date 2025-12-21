import { useQuery } from "@tanstack/react-query";
import {
  ChartBarIcon,
  UsersIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { fetchAnalytics } from "../../utils/api";
import SEOHead from "../../components/common/SEOHead";
import { useTranslation } from "react-i18next";

export default function AdminAnalytics() {
  const { t: _t } = useTranslation();
  const { data: analytics } = useQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
  });

  const metrics = [
    {
      title: "Total Revenue",
      value: `৳${analytics?.totalRevenue || 0}`,
      change: "+12.5%",
      icon: CurrencyDollarIcon,
      color: "text-green-600",
    },
    {
      title: "Orders",
      value: analytics?.totalOrders || 0,
      change: "+8.2%",
      icon: ShoppingBagIcon,
      color: "text-blue-600",
    },
    {
      title: "Customers",
      value: analytics?.totalCustomers || 0,
      change: "+15.3%",
      icon: UsersIcon,
      color: "text-purple-600",
    },
    {
      title: "Conversion Rate",
      value: `${analytics?.conversionRate || 0}%`,
      change: "+2.1%",
      icon: ChartBarIcon,
      color: "text-orange-600",
    },
  ];

  return (
    <>
      <SEOHead
        title="Analytics"
        description="Admin analytics dashboard — revenue, orders and conversion metrics."
        url="/admin/analytics"
      />
      <div className="min-h-screen bg-gray-50 py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Analytics Dashboard
          </h1>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metric.value}
                    </p>
                    <p className={`text-sm ${metric.color}`}>{metric.change}</p>
                  </div>
                  <metric.icon className={`w-8 h-8 ${metric.color}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                Chart placeholder - integrate with Chart.js or similar
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Top Products</h3>
              <div className="space-y-3">
                {analytics?.topProducts?.map((product, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-gray-900">
                      {product.name}
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                      {product.sales}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
