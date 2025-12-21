import { useState, useEffect, useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import SEOHead from "../components/common/SEOHead";
import { useAuth } from "../contexts/AuthContext";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  XMarkIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { orderApi } from "../utils/apiClient";
import { ROUTES, ORDER_STATUS } from "../utils/constants";
import LoadingSpinner from "../components/common/LoadingSpinner";

export default function OrdersPage() {
  const { t } = useTranslation();
  const [headerOffset, setHeaderOffset] = useState(0);
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});

  // Compute header height dynamically
  useLayoutEffect(() => {
    const el = document.querySelector("header");
    if (!el) return;
    const compute = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      setHeaderOffset(h);
    };
    compute();
    window.addEventListener("resize", compute, { passive: true });
    return () => window.removeEventListener("resize", compute);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await orderApi.getAll();
      setOrders(data.orders || []);
      if (data.orders?.length > 0) {
        toast.success(`Loaded ${data.orders.length} orders`);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      const errorMessage = err.message || "Failed to load orders";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (orderId) => {
    setExpanded((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const statusMeta = {
    [ORDER_STATUS.PENDING]: {
      icon: ClockIcon,
      color: "text-amber-600",
      bg: "bg-amber-50",
      label: "Pending",
    },
    [ORDER_STATUS.CONFIRMED]: {
      icon: CheckCircleIcon,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      label: "Confirmed",
    },
    [ORDER_STATUS.PROCESSING]: {
      icon: TruckIcon,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      label: "Processing",
    },
    [ORDER_STATUS.SHIPPED]: {
      icon: TruckIcon,
      color: "text-purple-600",
      bg: "bg-purple-50",
      label: "Shipped",
    },
    [ORDER_STATUS.DELIVERED]: {
      icon: CheckCircleIcon,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      label: "Delivered",
    },
    [ORDER_STATUS.CANCELLED]: {
      icon: XMarkIcon,
      color: "text-red-600",
      bg: "bg-red-50",
      label: "Cancelled",
    },
  };

  if (!user) {
    return (
      <>
        <SEOHead
          title="My Orders"
          description="View and track your medicine orders"
          url="/orders"
        />
        <div
          className="w-full px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center"
          style={{
            marginTop: `-${headerOffset}px`,
            paddingTop: `calc(${headerOffset}px + 1.5rem)`,
            minHeight: "100vh",
          }}
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 sm:p-12 lg:p-16 text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-red-100 mx-auto mb-4 sm:mb-6">
              <ShoppingBagIcon className="w-8 sm:w-10 h-8 sm:h-10 text-red-600" />
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
              {t("ordersPage.authRequired")}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
              {t("ordersPage.authRequiredDesc")}
            </p>
            <a
              href={ROUTES.LOGIN}
              className="inline-block bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold hover:from-emerald-700 hover:to-green-700 transition-all shadow-md hover:shadow-lg active:scale-95 text-sm sm:text-base"
            >
              {t("ordersPage.signInNow")}
            </a>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <SEOHead
          title="My Orders"
          description="View and track your medicine orders"
          url="/orders"
        />
        <div
          className="w-full px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center"
          style={{
            marginTop: `-${headerOffset}px`,
            paddingTop: `calc(${headerOffset}px + 1.5rem)`,
            minHeight: "100vh",
          }}
        >
          <LoadingSpinner size="lg" text="Loading your orders..." />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title={t("ordersPage.seoTitle")}
        description={t("ordersPage.seoDescription")}
        url="/orders"
      />
      <div
        className="w-full px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 pb-12 sm:pb-16 lg:pb-20"
        style={{
          marginTop: `-${headerOffset}px`,
          paddingTop: `calc(${headerOffset}px + 1.5rem)`,
          minHeight: "100vh",
        }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="mb-0">
            <div className="inline-block mb-3 sm:mb-4">
              <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-100 to-cyan-100 border-2 border-emerald-200 text-emerald-700 rounded-full text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-shadow duration-300">
                <span className="text-lg sm:text-xl">📦</span>
                <span>{t("ordersPage.title")}</span>
              </span>
            </div>
            <div className="flex items-end justify-between gap-4">
              <div className="flex-1">
                <h1 className="font-black text-gray-900 mb-2 sm:mb-3 tracking-tight leading-tight">
                  <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                    {t("ordersPage.subtitle")}
                  </span>
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl">
                  {t("ordersPage.description")}
                </p>
              </div>
              <button
                onClick={fetchOrders}
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-white border-2 border-gray-300 hover:border-emerald-500 hover:text-emerald-600 font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
                title={t("ordersPage.refresh")}
              >
                <ArrowPathIcon className="w-4 sm:w-5 h-4 sm:h-5" />
                <span className="hidden sm:inline">
                  {t("ordersPage.refresh")}
                </span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl bg-red-50 border-2 border-red-300 flex items-start gap-3">
              <span className="text-lg flex-shrink-0">⚠️</span>
              <p className="text-sm sm:text-base text-red-800 font-semibold">
                {error}
              </p>
            </div>
          )}

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 sm:p-12 lg:p-16 text-center">
              <div className="inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-gray-100 mx-auto mb-4 sm:mb-6">
                <ShoppingBagIcon className="w-8 sm:w-10 h-8 sm:h-10 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                {t("ordersPage.noOrders")}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto">
                {t("ordersPage.noOrdersDesc")}
              </p>
              <a
                href={ROUTES.PRODUCTS}
                className="inline-block bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold hover:from-emerald-700 hover:to-green-700 transition-all shadow-md hover:shadow-lg active:scale-95 text-sm sm:text-base"
              >
                {t("ordersPage.browseProducts")}
              </a>
            </div>
          ) : (
            <div className="space-y-5 sm:space-y-6">
              {orders.map((order) => {
                const meta =
                  statusMeta[order.status] || statusMeta[ORDER_STATUS.PENDING];
                const Icon = meta.icon;
                const isExpanded = expanded[order.id];
                return (
                  <div
                    key={order.id}
                    className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {/* Order Header */}
                    <div className="p-5 sm:p-6 lg:p-8">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap mb-3">
                            <h3 className="font-black text-gray-900 text-base sm:text-lg">
                              Order{" "}
                              <span className="text-emerald-600">
                                #{order.orderNumber}
                              </span>
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold ${meta.bg} ${meta.color} border-2`}
                              style={{ borderColor: "currentColor" }}
                            >
                              <Icon className="w-4 h-4" /> {meta.label}
                            </span>
                          </div>
                          <div className="flex items-center flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                            <span className="font-medium">
                              📅{" "}
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                            <span className="hidden sm:inline text-gray-400">
                              •
                            </span>
                            <span className="font-medium">
                              📦 {order.orderItems?.length || 0} items
                            </span>
                            {order.shippingCost > 0 && (
                              <>
                                <span className="hidden md:inline text-gray-400">
                                  •
                                </span>
                                <span className="hidden md:inline font-medium">
                                  🚚 Shipping: ৳{order.shippingCost}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-base sm:text-lg font-black text-gray-900">
                              Total:{" "}
                              <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                ৳{order.totalAmount}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <button
                            onClick={() => toggleExpand(order.id)}
                            className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-gray-100 hover:bg-gray-200 font-bold flex items-center justify-center gap-2 transition-all border-2 border-gray-300"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUpIcon className="w-4 sm:w-5 h-4 sm:h-5" />
                                <span>{t("ordersPage.hideItems")}</span>
                              </>
                            ) : (
                              <>
                                <ChevronDownIcon className="w-4 sm:w-5 h-4 sm:h-5" />
                                <span>{t("ordersPage.viewItems")}</span>
                              </>
                            )}
                          </button>
                          <a
                            href={`/track-order?orderId=${
                              order.orderNumber
                            }&phone=${order.shippingAddress?.phone || ""}`}
                            className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 font-bold shadow-md hover:shadow-lg transition-all active:scale-95 text-center"
                          >
                            {t("ordersPage.trackOrder")}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Order Items */}
                    {isExpanded && (
                      <div className="border-t-2 border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50/20">
                        <ul className="divide-y divide-gray-200">
                          {order.orderItems?.map((item) => (
                            <li
                              key={item.id}
                              className="flex items-start gap-4 sm:gap-6 p-5 sm:p-6 hover:bg-white/50 transition-colors"
                            >
                              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-xl bg-white border-2 border-gray-200 overflow-hidden flex-shrink-0 shadow-sm">
                                <img
                                  src={
                                    Array.isArray(item.product.images)
                                      ? item.product.images[0]
                                      : item.product.images?.[0] ||
                                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI4IiBoZWlnaHQ9IjI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNCAxNEwxNCAyMEgyMFYyMEgyMEwxNCAxNFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTE0IDE0SDE5VjIwSDE5TDE0IDE0eiIgZmlsbD0iIzlDQTNBMiIvPgo8dGV4dCB4PSIxNCIgeT0iMTciIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI2IiBmaWxsPSIjNjM2NkYxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+"
                                  }
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 mb-2">
                                  {item.product.name}
                                </p>
                                <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-600">
                                  <span className="font-medium">
                                    Qty:{" "}
                                    <span className="font-bold text-gray-900">
                                      {item.quantity}
                                    </span>
                                  </span>
                                  <span className="text-gray-400">•</span>
                                  <span className="font-medium">
                                    Unit:{" "}
                                    <span className="font-bold text-gray-900">
                                      ৳{item.unitPrice}
                                    </span>
                                  </span>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-base sm:text-lg font-black text-emerald-600">
                                  ৳{item.totalPrice}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Total
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
