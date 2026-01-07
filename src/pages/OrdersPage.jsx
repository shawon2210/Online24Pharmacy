import { useState, useLayoutEffect, useCallback } from "react";
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

  const fetchOrders = useCallback(async () => {
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
  }, [t]);

  useLayoutEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleExpand = (orderId) => {
    setExpanded((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const statusMeta = {
    [ORDER_STATUS.PENDING]: {
      icon: ClockIcon,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-muted dark:bg-amber-900/30",
      label: t("ordersPage.status.pending"),
    },
    [ORDER_STATUS.CONFIRMED]: {
      icon: CheckCircleIcon,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
      label: t("ordersPage.status.confirmed"),
    },
    [ORDER_STATUS.PROCESSING]: {
      icon: TruckIcon,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
      label: t("ordersPage.status.processing"),
    },
    [ORDER_STATUS.SHIPPED]: {
      icon: TruckIcon,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-muted dark:bg-purple-900/30",
      label: t("ordersPage.status.shipped"),
    },
    [ORDER_STATUS.DELIVERED]: {
      icon: CheckCircleIcon,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
      label: t("ordersPage.status.delivered"),
    },
    [ORDER_STATUS.CANCELLED]: {
      icon: XMarkIcon,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/30",
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
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md shadow-md border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <nav className="mb-3" aria-label={t("breadcrumb")}>
              <ol className="flex items-center gap-1 text-sm text-foreground">
                <li>
                  <a href="/" className="hover:text-primary font-medium">
                    {t("home")}
                  </a>
                </li>
                <li className="px-1 text-muted-foreground">/</li>
                <li className="text-foreground font-bold" aria-current="page">
                  {t("ordersPage.title")}
                </li>
              </ol>
            </nav>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-primary mb-1">
                  {t("ordersPage.title")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t("ordersPage.description")}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div
          className="w-full px-4 sm:px-6 lg:px-8 bg-background flex items-center justify-center"
          style={{
            marginTop: `-${headerOffset}px`,
            paddingTop: `calc(${headerOffset}px + 1.5rem)`,
            minHeight: "100vh",
          }}
        >
          <div className="bg-card rounded-2xl shadow-lg border border-border p-8 sm:p-12 lg:p-16 text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-muted dark:bg-red-900/30 mx-auto mb-4 sm:mb-6">
              <ShoppingBagIcon className="w-8 sm:w-10 h-8 sm:h-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-2 sm:mb-3">
              {t("ordersPage.authRequired")}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
              {t("ordersPage.authRequiredDesc")}
            </p>
            <a
              href={ROUTES.LOGIN}
              className="inline-block bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95 text-sm sm:text-base"
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
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md shadow-md border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <nav className="mb-3" aria-label={t("breadcrumb")}>
              <ol className="flex items-center gap-1 text-sm text-foreground">
                <li>
                  <a href="/" className="hover:text-primary font-medium">
                    {t("home")}
                  </a>
                </li>
                <li className="px-1 text-muted-foreground">/</li>
                <li className="text-foreground font-bold" aria-current="page">
                  {t("ordersPage.title")}
                </li>
              </ol>
            </nav>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-primary mb-1">
                  {t("ordersPage.title")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t("ordersPage.description")}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div
          className="w-full px-4 sm:px-6 lg:px-8 bg-background flex items-center justify-center"
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
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md shadow-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <nav className="mb-3" aria-label={t("breadcrumb")}>
            <ol className="flex items-center gap-1 text-sm text-foreground">
              <li>
                <a href="/" className="hover:text-primary font-medium">
                  {t("home")}
                </a>
              </li>
              <li className="px-1 text-muted-foreground">/</li>
              <li className="text-foreground font-bold" aria-current="page">
                {t("ordersPage.title")}
              </li>
            </ol>
          </nav>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-primary mb-1">
                {t("ordersPage.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("ordersPage.description")}
              </p>
            </div>
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 px-4 xs:px-6 py-2 xs:py-2.5 text-sm xs:text-base rounded-xl bg-card border-2 border-border hover:border-primary hover:text-primary font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
              title={t("ordersPage.refresh")}
            >
              <ArrowPathIcon className="w-5 h-5" />
              <span className="hidden xs:inline">
                {t("ordersPage.refresh")}
              </span>
            </button>
          </div>
        </div>
      </div>
      <div
        className="w-full min-h-screen bg-background flex flex-col items-center justify-start pb-8 sm:pb-12 lg:pb-16"
        style={{
          marginTop: `-${headerOffset}px`,
          paddingTop: `calc(${headerOffset}px + 1.5rem)`,
        }}
      >
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">
          {error && (
            <div className="p-4 rounded-2xl bg-muted dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 flex items-start gap-3">
              <span className="text-lg shrink-0">⚠️</span>
              <p className="text-sm sm:text-base text-red-800 dark:text-red-300 font-semibold">
                {error}
              </p>
            </div>
          )}

          {orders.length === 0 ? (
            <div className="bg-card rounded-3xl shadow-2xl border border-border p-8 sm:p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-muted mx-auto mb-4">
                <ShoppingBagIcon className="w-8 sm:w-10 h-8 sm:h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl xs:text-2xl font-bold text-foreground mb-2">
                {t("ordersPage.noOrders")}
              </h3>
              <p className="text-base xs:text-lg text-foreground mb-6 max-w-md mx-auto">
                {t("ordersPage.noOrdersDesc")}
              </p>
              <a
                href={ROUTES.PRODUCTS}
                className="inline-block bg-primary hover:bg-primary/90 text-white px-6 xs:px-8 py-2.5 xs:py-3 rounded-2xl font-extrabold transition-all shadow-lg hover:shadow-xl active:scale-98 text-base xs:text-lg"
              >
                {t("ordersPage.browseProducts")}
              </a>
            </div>
          ) : (
            <div className="space-y-5 xs:space-y-6">
              {orders.map((order) => {
                const meta =
                  statusMeta[order.status] || statusMeta[ORDER_STATUS.PENDING];
                const Icon = meta.icon;
                const isExpanded = expanded[order.id];
                return (
                  <div
                    key={order.id}
                    className="bg-card border-2 border-border rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500"
                  >
                    <div className="p-4 xs:p-5 sm:p-7 lg:p-10">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 xs:gap-5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 xs:gap-3 flex-wrap mb-2 xs:mb-3">
                            <h3 className="font-black text-foreground text-lg xs:text-xl">
                              {t("ordersPage.order") + " "}
                              <span className="text-primary">
                                #{order.orderNumber}
                              </span>
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs xs:text-sm font-bold ${meta.bg} ${meta.color} border-2`}
                              style={{ borderColor: "currentColor" }}
                            >
                              <Icon className="w-4 h-4" /> {meta.label}
                            </span>
                          </div>
                          <div className="flex items-center flex-wrap gap-2 xs:gap-3 text-xs xs:text-sm text-muted-foreground">
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
                            <span className="hidden sm:inline text-muted-foreground">
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
                                <span className="hidden md:inline text-muted-foreground">
                                  •
                                </span>
                                <span className="hidden md:inline font-medium">
                                  🚚 {t("ordersPage.shipping")}: ৳
                                  {order.shippingCost}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="mt-2 xs:mt-3 pt-2 xs:pt-3 border-t border-border">
                            <p className="text-lg xs:text-xl font-black text-foreground">
                              {t("ordersPage.total") + ": "}
                              <span className="text-primary">
                                ৳{order.totalAmount}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 xs:gap-3 flex-wrap">
                          <button
                            onClick={() => toggleExpand(order.id)}
                            className="flex-1 xs:flex-none px-4 xs:px-6 py-2 xs:py-2.5 text-sm xs:text-base rounded-xl bg-muted hover:bg-border font-bold flex items-center justify-center gap-2 transition-all border-2 border-border text-foreground"
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
                            className="flex-1 xs:flex-none px-4 xs:px-6 py-2 xs:py-2.5 text-sm xs:text-base rounded-xl bg-primary hover:bg-primary/90 text-white font-extrabold shadow-lg hover:shadow-xl transition-all active:scale-98 text-center"
                          >
                            {t("ordersPage.trackOrder")}
                          </a>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t-2 border-border bg-muted/40 dark:bg-slate-800/40">
                        <ul className="divide-y divide-border">
                          {order.orderItems?.map((item) => (
                            <li
                              key={item.id}
                              className="flex items-start gap-3 xs:gap-5 p-4 xs:p-5 hover:bg-muted/60 dark:hover:bg-slate-700/60 transition-colors"
                            >
                              <div className="w-16 xs:w-20 h-16 xs:h-20 rounded-xl bg-background dark:bg-slate-900 border-2 border-border overflow-hidden shrink-0 shadow-sm">
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
                                <p className="text-base xs:text-lg font-bold text-foreground line-clamp-2 mb-1 xs:mb-2">
                                  {item.product.name}
                                </p>
                                <div className="flex items-center gap-3 xs:gap-4 text-xs xs:text-sm text-muted-foreground">
                                  <span className="font-medium">
                                    {t("ordersPage.qty") + ": "}
                                    <span className="font-bold text-foreground">
                                      {item.quantity}
                                    </span>
                                  </span>
                                  <span className="text-muted-foreground">
                                    •
                                  </span>
                                  <span className="font-medium">
                                    {t("ordersPage.unit") + ": "}
                                    <span className="font-bold text-foreground">
                                      ৳{item.unitPrice}
                                    </span>
                                  </span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-lg xs:text-xl font-black text-primary">
                                  ৳{item.totalPrice}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
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
