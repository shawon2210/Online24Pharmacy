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
  // translation with fallback helper
  const tf = (key, options, fallback) => {
    const translated = t(key, options);
    if (translated === key) return fallback || translated;
    return translated;
  };
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
        toast.success(
          t("ordersPage.ordersLoaded", { count: data.orders.length })
        );
      }
    } catch (err) {
      console.error(t("ordersPage.fetchOrdersError"), err);
      const errorMessage = err.message || t("ordersPage.failedToLoadOrders");
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
      label: t("ordersPage.status.pending"),
    },
    [ORDER_STATUS.CONFIRMED]: {
      icon: CheckCircleIcon,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      label: t("ordersPage.status.confirmed"),
    },
    [ORDER_STATUS.PROCESSING]: {
      icon: TruckIcon,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      label: t("ordersPage.status.processing"),
    },
    [ORDER_STATUS.SHIPPED]: {
      icon: TruckIcon,
      color: "text-purple-600",
      bg: "bg-purple-50",
      label: t("ordersPage.status.shipped"),
    },
    [ORDER_STATUS.DELIVERED]: {
      icon: CheckCircleIcon,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      label: t("ordersPage.status.delivered"),
    },
    [ORDER_STATUS.CANCELLED]: {
      icon: XMarkIcon,
      color: "text-red-600",
      bg: "bg-red-50",
      label: t("ordersPage.status.cancelled"),
    },
  };

  if (!user) {
    return (
      <>
        <SEOHead
          title={t("ordersPage.seoTitle")}
          description={t("ordersPage.seoDescription")}
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
          title={t("ordersPage.seoTitle")}
          description={t("ordersPage.seoDescription")}
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
          <LoadingSpinner size="lg" text={t("ordersPage.loading")} />
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
        className="w-full min-h-screen bg-gradient-to-br from-[#e0f7fa] via-[#f8fafc] to-[#e0f2fe] flex flex-col items-center justify-start pb-8 sm:pb-12 lg:pb-16"
        style={{
          marginTop: `-${headerOffset}px`,
          paddingTop: `calc(${headerOffset}px + 1.5rem)`,
        }}
      >
        <div className="w-full max-w-5xl mx-auto px-2 xs:px-4 sm:px-8 lg:px-20 py-2 xs:py-4 sm:py-7 lg:py-10 flex flex-col gap-8 xs:gap-10 md:gap-12 animate-fade-in">
          {/* Page Header */}
          <div className="mb-0 animate-fade-in">
            <div className="inline-block mb-2 xs:mb-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-emerald-200 text-emerald-700 rounded-full text-sm font-extrabold shadow-lg animate-bounce-in">
                <span className="text-xl animate-bounce">📦</span>
                <span>{tf("ordersPage.title", undefined, "My Orders")}</span>
              </span>
            </div>
            <div className="flex items-end justify-between gap-3 xs:gap-4">
              <div className="flex-1">
                <h1 className="font-black text-gray-900 mb-1 xs:mb-2 tracking-tight leading-tight text-3xl xs:text-4xl bg-gradient-to-r from-emerald-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent animate-slide-up">
                  {tf(
                    "ordersPage.subtitle",
                    undefined,
                    "Order History & Tracking"
                  )}
                </h1>
                <p className="text-base xs:text-lg text-gray-700 max-w-3xl animate-fade-in delay-100">
                  {tf(
                    "ordersPage.description",
                    undefined,
                    "View all your past orders, track status, and reorder easily."
                  )}
                </p>
              </div>
              <button
                onClick={fetchOrders}
                className="flex items-center gap-2 px-4 xs:px-6 py-2 xs:py-2.5 text-sm xs:text-base rounded-xl bg-white border-2 border-gray-300 hover:border-emerald-500 hover:text-emerald-600 font-bold shadow-md hover:shadow-lg transition-all active:scale-95 animate-fade-in"
                title={tf("ordersPage.refresh", undefined, "Refresh")}
              >
                <ArrowPathIcon className="w-5 h-5" />
                <span className="hidden xs:inline">
                  {tf("ordersPage.refresh", undefined, "Refresh")}
                </span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 xs:mb-6 p-3 xs:p-4 rounded-2xl bg-red-100/90 border-2 border-red-300 flex items-start gap-2 xs:gap-3 animate-shake shadow-md transition-all duration-300">
              <span className="text-lg flex-shrink-0">⚠️</span>
              <p className="text-sm sm:text-base text-red-800 font-semibold">
                {error}
              </p>
            </div>
          )}

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200 p-6 xs:p-8 sm:p-12 text-center animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-gray-100 mx-auto mb-3 xs:mb-4">
                <ShoppingBagIcon className="w-8 sm:w-10 h-8 sm:h-10 text-gray-400" />
              </div>
              <h3 className="text-xl xs:text-2xl font-bold text-gray-900 mb-1 xs:mb-2">
                {tf("ordersPage.noOrders", undefined, "No Orders Found")}
              </h3>
              <p className="text-base xs:text-lg text-gray-700 mb-4 xs:mb-6 max-w-md mx-auto">
                {tf(
                  "ordersPage.noOrdersDesc",
                  undefined,
                  "You haven't placed any orders yet. Start shopping now!"
                )}
              </p>
              <a
                href={ROUTES.PRODUCTS}
                className="inline-block bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 xs:px-8 py-2.5 xs:py-3 rounded-2xl font-extrabold hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg hover:shadow-xl active:scale-98 text-base xs:text-lg animate-slide-up"
              >
                {tf("ordersPage.browseProducts", undefined, "Browse Products")}
              </a>
            </div>
          ) : (
            <div className="space-y-5 xs:space-y-6 animate-fade-in">
              {orders.map((order) => {
                const meta =
                  statusMeta[order.status] || statusMeta[ORDER_STATUS.PENDING];
                const Icon = meta.icon;
                const isExpanded = expanded[order.id];
                return (
                  <div
                    key={order.id}
                    className="bg-white/90 backdrop-blur-lg border-2 border-gray-200 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 animate-fade-in"
                  >
                    {/* Order Header */}
                    <div className="p-4 xs:p-5 sm:p-7 lg:p-10">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 xs:gap-5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 xs:gap-3 flex-wrap mb-2 xs:mb-3 animate-slide-up">
                            <h3 className="font-black text-gray-900 text-lg xs:text-xl">
                              {t("ordersPage.order") + " "}
                              <span className="text-emerald-600">
                                #{order.orderNumber}
                              </span>
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs xs:text-sm font-bold ${meta.bg} ${meta.color} border-2 animate-fade-in`}
                              style={{ borderColor: "currentColor" }}
                            >
                              <Icon className="w-4 h-4" /> {meta.label}
                            </span>
                          </div>
                          <div className="flex items-center flex-wrap gap-2 xs:gap-3 text-xs xs:text-sm text-gray-600">
                            <span className="font-medium">
                              📅 {t("ordersPage.placedOn")}{" "}
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
                              📦{" "}
                              {t("ordersPage.items", {
                                count: order.orderItems?.length || 0,
                              })}
                            </span>
                            {order.shippingCost > 0 && (
                              <>
                                <span className="hidden md:inline text-gray-400">
                                  •
                                </span>
                                <span className="hidden md:inline font-medium">
                                  🚚 {t("ordersPage.shipping")}: ৳
                                  {order.shippingCost}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="mt-2 xs:mt-3 pt-2 xs:pt-3 border-t border-gray-200">
                            <p className="text-lg xs:text-xl font-black text-gray-900 animate-fade-in">
                              {t("ordersPage.total") + ": "}
                              <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                ৳{order.totalAmount}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 xs:gap-3 flex-wrap">
                          <button
                            onClick={() => toggleExpand(order.id)}
                            className="flex-1 xs:flex-none px-4 xs:px-6 py-2 xs:py-2.5 text-sm xs:text-base rounded-xl bg-gray-100 hover:bg-gray-200 font-bold flex items-center justify-center gap-2 transition-all border-2 border-gray-300 animate-fade-in"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUpIcon className="w-5 h-5" />
                                <span>{t("ordersPage.hideItems")}</span>
                              </>
                            ) : (
                              <>
                                <ChevronDownIcon className="w-5 h-5" />
                                <span>{t("ordersPage.viewItems")}</span>
                              </>
                            )}
                          </button>
                          <a
                            href={`/track-order?orderId=${
                              order.orderNumber
                            }&phone=${order.shippingAddress?.phone || ""}`}
                            className="flex-1 xs:flex-none px-4 xs:px-6 py-2 xs:py-2.5 text-sm xs:text-base rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 font-extrabold shadow-lg hover:shadow-xl transition-all active:scale-98 text-center animate-slide-up"
                          >
                            {t("ordersPage.trackOrder")}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Order Items */}
                    {isExpanded && (
                      <div className="border-t-2 border-gray-200 bg-gradient-to-br from-emerald-50 to-blue-50/20 animate-fade-in">
                        <ul className="divide-y divide-gray-200">
                          {order.orderItems?.map((item) => (
                            <li
                              key={item.id}
                              className="flex items-start gap-3 xs:gap-5 p-4 xs:p-5 hover:bg-white/60 transition-colors animate-slide-up"
                            >
                              <div className="w-16 xs:w-20 h-16 xs:h-20 rounded-xl bg-white border-2 border-gray-200 overflow-hidden flex-shrink-0 shadow-sm">
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
                                <p className="text-base xs:text-lg font-bold text-gray-900 line-clamp-2 mb-1 xs:mb-2 animate-fade-in">
                                  {item.product.name}
                                </p>
                                <div className="flex items-center gap-3 xs:gap-4 text-xs xs:text-sm text-gray-600">
                                  <span className="font-medium">
                                    {t("ordersPage.qty") + ": "}
                                    <span className="font-bold text-gray-900">
                                      {item.quantity}
                                    </span>
                                  </span>
                                  <span className="text-gray-400">•</span>
                                  <span className="font-medium">
                                    {t("ordersPage.unit") + ": "}
                                    <span className="font-bold text-gray-900">
                                      ৳{item.unitPrice}
                                    </span>
                                  </span>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-lg xs:text-xl font-black text-emerald-600 animate-slide-up">
                                  ৳{item.totalPrice}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {t("ordersPage.total")}
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
