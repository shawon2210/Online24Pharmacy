import {
  useMemo,
  useState,
  useLayoutEffect,
  useCallback,
  useEffect,
} from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import SEOHead from "../components/common/SEOHead";
import { useAuth } from "../hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { orderApi } from "../utils/apiClient";
import { ROUTES, ORDER_STATUS } from "../utils/constants";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { ORDER_STATUS_CONFIG } from "../hooks/useOrderStatus";
import OrderItemDisplay from "../components/order/OrderItemDisplay";

export default function OrdersPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const highlightOrderId = location.state?.highlightOrderId;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");

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
      if (err?.status === 401 || err?.status === 403) {
        toast.error(
          t(
            "auth.sessionExpired",
            "Your session has expired. Please sign in again."
          )
        );
        // Clears storage and updates auth state.
        await logout();
        return;
      }

      console.error(t("ordersPage.fetchOrdersError"), err);
      const errorMessage = err.message || t("ordersPage.failedToLoadOrders");
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [t, logout]);

  useLayoutEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!highlightOrderId || orders.length === 0) return;

    const exists = orders.some((o) => o.id === highlightOrderId);
    if (!exists) return;

    setStatusFilter("all");
    setExpanded((prev) => ({ ...prev, [highlightOrderId]: true }));

    // Scroll within the list container after it renders.
    const timer = window.setTimeout(() => {
      const el = document.getElementById(`order-${highlightOrderId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);

    // Clear navigation state so back/refresh doesn't keep re-highlighting.
    navigate(location.pathname, { replace: true });

    return () => window.clearTimeout(timer);
  }, [highlightOrderId, orders, navigate, location.pathname]);

  const toggleExpand = (orderId) => {
    setExpanded((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  // Helper function to get translated status label
  const getStatusLabel = (status) => {
    const labelMap = {
      [ORDER_STATUS.PENDING]: t("ordersPage.status.pending"),
      [ORDER_STATUS.CONFIRMED]: t("ordersPage.status.confirmed"),
      [ORDER_STATUS.PROCESSING]: t("ordersPage.status.processing"),
      [ORDER_STATUS.SHIPPED]: t("ordersPage.status.shipped"),
      [ORDER_STATUS.DELIVERED]: t("ordersPage.status.delivered"),
      [ORDER_STATUS.CANCELLED]: t("ordersPage.status.cancelled"),
    };
    return labelMap[status] || t("ordersPage.status.pending");
  };

  // Helper function to get status metadata with translations
  const getStatusMeta = (status) => {
    const config =
      ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG[ORDER_STATUS.PENDING];
    return {
      ...config,
      label: getStatusLabel(status),
    };
  };

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  // Render header component
  const renderHeader = (variant = "default") => {
    const isAuthRequired = variant === "authRequired";
    const isLoading = variant === "loading";

    const headerClasses =
      "bg-card/95 backdrop-blur-md shadow-md border-b border-border";

    return (
      <div className={`sticky top-0 z-40 ${headerClasses}`}>
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
                {t("ordersPage.subtitle")}
              </p>
            </div>
            {!isAuthRequired && !isLoading && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border-2 border-primary/30 text-primary rounded-full text-sm font-bold">
                  <ShoppingBagIcon className="w-5 h-5" />
                  <span>
                    {orders.length} {t("orders")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={fetchOrders}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 border-2 border-primary/30 text-primary rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
                  title={t("ordersPage.refresh", { defaultValue: "Refresh" })}
                >
                  <ArrowPathIcon className="w-5 h-5" />
                  <span>
                    {t("ordersPage.refresh", { defaultValue: "Refresh" })}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead
          title={t("ordersPage.seoTitle")}
          description={t("ordersPage.seoDescription")}
          url="/orders"
        />
        {renderHeader("authRequired")}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-card rounded-xl shadow-lg border border-border p-8 sm:p-10 lg:p-12 text-center max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-destructive/10 border border-destructive/20 mx-auto mb-4 sm:mb-6">
              <ShoppingBagIcon className="w-8 sm:w-10 h-8 sm:h-10 text-destructive" />
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-2 sm:mb-3">
              {t("ordersPage.authRequired")}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
              {t("ordersPage.authRequiredDesc")}
            </p>
            <a
              href={ROUTES.LOGIN}
              className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold transition-all shadow-md dark:shadow-lg hover:shadow-lg dark:hover:shadow-xl active:scale-95 text-sm sm:text-base"
            >
              {t("ordersPage.signInNow")}
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead
          title={t("ordersPage.seoTitle")}
          description={t("ordersPage.seoDescription")}
          url="/orders"
        />
        {renderHeader("loading")}
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <LoadingSpinner size="lg" text={t("ordersPage.loading")} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("ordersPage.seoTitle")}
        description={t("ordersPage.seoDescription")}
        url="/orders"
      />
      {renderHeader("default")}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
              <span className="text-lg shrink-0">⚠️</span>
              <p className="text-sm sm:text-base text-destructive font-semibold">
                {error}
              </p>
            </div>
          )}

          {/* Quick Filters (matches Build-a-Kit card section) */}
          <div className="bg-card rounded-xl shadow-lg border border-border p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <ShoppingBagIcon className="w-5 h-5 text-primary" />
                {t("ordersPage.title")}
              </h2>

              <button
                type="button"
                onClick={fetchOrders}
                className="px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-primary/10 hover:text-primary transition-colors border border-border flex items-center gap-2"
                title={t("ordersPage.refresh")}
              >
                <ArrowPathIcon className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {t("ordersPage.refresh")}
                </span>
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors border border-border ${
                  statusFilter === "all"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {t("all", { defaultValue: "All" })}
              </button>

              {Object.values(ORDER_STATUS).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors border border-border ${
                    statusFilter === status
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {getStatusLabel(status)}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-lg border border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <ShoppingBagIcon className="w-5 h-5 text-primary" />
              {t("ordersPage.orders", { defaultValue: "Orders" })}
            </h2>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mx-auto mb-4">
                  <ShoppingBagIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {statusFilter === "all"
                    ? t("ordersPage.noOrders")
                    : t("ordersPage.noOrders", { defaultValue: "No orders" })}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  {t("ordersPage.noOrdersDesc")}
                </p>
                <a
                  href={ROUTES.PRODUCTS}
                  className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  {t("ordersPage.browseProducts")}
                </a>
              </div>
            ) : (
              <div className="bg-muted rounded-lg p-4 max-h-[70vh] sm:max-h-96 overflow-y-auto border border-border space-y-4">
                {filteredOrders.map((order) => {
                  const meta = getStatusMeta(order.status);
                  const Icon = meta.icon;
                  const isExpanded = expanded[order.id];
                  const isHighlighted = order.id === highlightOrderId;

                  return (
                    <div
                      key={order.id}
                      id={`order-${order.id}`}
                      className={`bg-card p-4 rounded-lg shadow-sm border transition-shadow ${
                        isHighlighted
                          ? "border-primary/50 ring-2 ring-primary/30 bg-primary/5"
                          : "border-border hover:shadow-md"
                      }`}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-bold text-foreground text-base">
                              {t("ordersPage.order") + " "}
                              <span className="text-primary">
                                #{order.orderNumber}
                              </span>
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {t("ordersPage.placedOn")}{" "}
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${meta.bg} ${meta.color}`}
                          >
                            <Icon className="w-4 h-4" /> {meta.label}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                          <p className="text-sm font-bold text-foreground">
                            {t("ordersPage.total") + ": "}
                            <span className="text-primary">
                              ৳{order.totalAmount}
                            </span>
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleExpand(order.id)}
                              className="px-3 py-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary font-semibold transition-colors border border-border text-sm"
                            >
                              {isExpanded
                                ? t("ordersPage.hideItems")
                                : t("ordersPage.viewItems")}
                            </button>
                            <a
                              href={`/track-order?orderId=${
                                order.orderNumber
                              }&phone=${order.shippingAddress?.phone || ""}`}
                              className="px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all shadow-sm hover:shadow-md active:scale-95 text-sm"
                            >
                              {t("ordersPage.trackOrder")}
                            </a>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 rounded-lg border border-border bg-background">
                          <ul className="divide-y divide-border">
                            {order.orderItems?.map((item) => (
                              <OrderItemDisplay
                                key={item.id}
                                item={item}
                                t={t}
                              />
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
      </div>
    </div>
  );
}
