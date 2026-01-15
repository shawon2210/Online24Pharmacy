import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  MagnifyingGlassIcon,
  TruckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import SEOHead from "../components/common/SEOHead";
import { getApiBaseUrl } from "../utils/apiBase";

export default function TrackOrderPage() {
  const { t } = useTranslation();
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrack = useCallback(
    async (id, ph) => {
      setError("");
      setOrderData(null);
      setLoading(true);
      try {
        const API_URL = getApiBaseUrl();
        const csrfToken = document
          .querySelector('meta[name="csrf-token"]')
          ?.getAttribute("content");
        const headers = { "Content-Type": "application/json" };
        if (csrfToken) {
          headers["X-CSRF-Token"] = csrfToken;
        }
        const response = await fetch(`${API_URL}/api/orders/track`, {
          method: "POST",
          headers,
          body: JSON.stringify({ orderId: id, phone: ph }),
        });

        const contentType = response.headers.get("content-type") || "";
        const rawText = await response.text();

        // Try to parse JSON; if we got HTML, the backend is likely down or the proxy/base URL is wrong.
        let data = null;
        if (contentType.includes("application/json")) {
          data = rawText ? JSON.parse(rawText) : null;
        } else {
          const trimmed = (rawText || "").trim();
          if (
            trimmed.startsWith("<!DOCTYPE") ||
            trimmed.startsWith("<html") ||
            trimmed.startsWith("<")
          ) {
            throw new Error(
              t(
                "trackOrderPage.apiUnavailable",
                "Unable to reach the order tracking service. If you're running locally, start the backend with `npm run server` and try again."
              )
            );
          }
          // Fallback: attempt JSON parse anyway.
          data = trimmed ? JSON.parse(trimmed) : null;
        }

        if (!response.ok) {
          throw new Error(data?.error || t("trackOrderPage.orderNotFound"));
        }

        setOrderData(data);
      } catch (err) {
        setError(err.message || t("trackOrderPage.orderNotFound"));
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderIdParam = params.get("orderId");
    const phoneParam = params.get("phone");
    if (orderIdParam && phoneParam) {
      setOrderId(orderIdParam);
      setPhone(phoneParam);
      handleTrack(orderIdParam, phoneParam);
    }
  }, [handleTrack]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleTrack(orderId, phone);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("trackOrderPage.seoTitle")}
        description={t("trackOrderPage.seoDescription")}
        url="/track-order"
      />

      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md shadow-md border-b border-border">
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
                {t("trackOrderPage.title")}
              </li>
            </ol>
          </nav>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-primary mb-1">
                {t("trackOrderPage.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("trackOrderPage.description")}
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/10 border-2 border-primary/30 text-primary rounded-full text-sm font-bold">
              <TruckIcon className="w-5 h-5" />
              <span>{t("trackOrderPage.badge")}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
          <div className="bg-card rounded-xl shadow-lg border border-border p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label
                    className="block text-sm font-bold text-foreground"
                    htmlFor="order-id-input"
                  >
                    {t("trackOrderPage.orderIdLabel")}
                  </label>
                  <div className="relative">
                    <input
                      id="order-id-input"
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder={t("trackOrderPage.orderIdPlaceholder")}
                      className="w-full pr-12 px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base bg-background text-foreground shadow-sm"
                      required
                      autoComplete="off"
                      inputMode="text"
                    />
                    <MagnifyingGlassIcon className="absolute right-3 top-3.5 w-5 h-5 text-primary pointer-events-none" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    className="block text-sm font-bold text-foreground"
                    htmlFor="phone-input"
                  >
                    {t("trackOrderPage.phoneNumberLabel")}
                  </label>
                  <input
                    id="phone-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("trackOrderPage.phoneNumberPlaceholder")}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base bg-background text-foreground shadow-sm"
                    required
                    autoComplete="off"
                    inputMode="tel"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-extrabold text-base shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label={t("trackOrderPage.trackButton")}
              >
                <MagnifyingGlassIcon className="w-5 h-5 shrink-0" />
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    {t("trackOrderPage.trackingButton")}
                  </span>
                ) : (
                  t("trackOrderPage.trackButton")
                )}
              </button>
            </form>

            {error && (
              <div className="mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                <span className="text-lg shrink-0">⚠️</span>
                <p className="text-sm sm:text-base text-destructive font-semibold">
                  {error || t("trackOrderPage.orderNotFound")}
                </p>
              </div>
            )}

            {orderData && (
              <div className="mt-6 bg-card rounded-xl shadow-lg border border-border p-6">
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  <CheckCircleIcon className="w-10 h-10 text-primary shrink-0" />
                  <h3 className="text-xl sm:text-2xl font-extrabold text-foreground">
                    {t("ordersPage.order", { defaultValue: "Order" })} #
                    {orderData.orderNumber}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-muted rounded-lg border border-border gap-2">
                    <span className="text-muted-foreground font-medium">
                      {t("trackOrderPage.status")}:
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-primary/10 border border-primary/20 text-primary">
                      {orderData.status.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-muted rounded-lg border border-border gap-2">
                    <span className="text-muted-foreground font-medium">
                      {t("trackOrderPage.totalAmount")}:
                    </span>
                    <span className="font-bold text-lg text-foreground">
                      ৳{orderData.totalAmount}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-muted rounded-lg border border-border gap-2">
                    <span className="text-muted-foreground font-medium">
                      {t("trackOrderPage.orderDate")}:
                    </span>
                    <span className="font-semibold text-foreground">
                      {new Date(orderData.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h4 className="font-bold text-foreground mb-3 text-base flex items-center gap-2">
                      <span className="text-lg">📋</span>
                      {t("trackOrderPage.orderItems")}
                    </h4>
                    <div className="bg-muted rounded-lg p-4 border border-border space-y-3">
                      {orderData.orderItems?.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-3 rounded-lg border border-border"
                        >
                          <span className="text-foreground font-semibold">
                            {item.product?.name}
                          </span>
                          <span className="mt-2 sm:mt-0 px-3 py-1 rounded-full text-sm font-bold bg-primary/10 border border-primary/20 text-primary">
                            x{item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 text-center pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3 font-medium">
                {t("trackOrderPage.haveAccountForTracking")}
              </p>
              <div className="flex justify-center">
                <Link
                  to="/login"
                  className="w-full sm:w-auto max-w-sm inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-extrabold transition-colors shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {t("trackOrderPage.signInToAccount")}
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-lg border border-border p-4 sm:p-5 relative overflow-hidden">
            <div className="relative flex items-start sm:items-center justify-between gap-3 mb-3">
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight text-blue-600 dark:text-blue-600 drop-shadow-sm">
                  {t("trackOrderPage.orderStatusTimeline")}
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1.5 leading-relaxed max-w-3xl">
                  {t("trackOrderPage.orderStatusTimelineDesc", {
                    defaultValue:
                      "A quick overview of the typical steps your order goes through.",
                  })}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-extrabold whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                <span className="text-sm leading-none">⏱</span>
                <span>
                  {t("trackOrderPage.timelineBadge", {
                    defaultValue: "Live updates",
                  })}
                </span>
              </div>
            </div>

            {(() => {
              const steps = [
                {
                  key: "placed",
                  Icon: CheckCircleIcon,
                  title: t("trackOrderPage.orderPlaced"),
                  description: t("trackOrderPage.orderConfirmedDesc"),
                  frameClass:
                    "from-blue-500/60 via-blue-600/35 to-indigo-600/60",
                  iconClass: "from-blue-600 via-blue-600 to-indigo-600",
                },
                {
                  key: "shipped",
                  Icon: TruckIcon,
                  title: t("trackOrderPage.shipped"),
                  description: t("trackOrderPage.outForDeliveryDesc"),
                  frameClass:
                    "from-sky-500/60 via-blue-600/35 to-indigo-600/60",
                  iconClass: "from-sky-600 via-blue-600 to-indigo-600",
                },
                {
                  key: "delivered",
                  Icon: CheckCircleIcon,
                  title: t("trackOrderPage.delivered"),
                  description: t("trackOrderPage.deliveredDesc"),
                  frameClass: "from-cyan-500/55 via-sky-500/30 to-blue-600/55",
                  iconClass: "from-cyan-600 via-sky-600 to-blue-600",
                },
              ];

              return (
                <ol className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  {steps.map((step, index) => {
                    const isLast = index === steps.length - 1;
                    const StepIcon = step.Icon;

                    return (
                      <li
                        key={step.key}
                        className={`relative h-full min-w-0 ${
                          isLast ? "" : "pb-5 md:pb-0"
                        }`}
                      >
                        {!isLast && (
                          <>
                            <div className="md:hidden absolute left-5 top-11 bottom-0 w-px bg-linear-to-b from-blue-400/70 via-blue-300/35 to-transparent" />
                            <div className="hidden md:block absolute top-5 -right-5 w-5 h-px bg-linear-to-r from-blue-400/70 via-blue-300/35 to-transparent" />
                          </>
                        )}

                        <div
                          className={`group h-full rounded-2xl p-px bg-linear-to-r ${step.frameClass}`}
                        >
                          <div className="relative h-full rounded-2xl bg-card/90 backdrop-blur border border-border/60 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl overflow-hidden">
                            <div
                              className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r ${step.iconClass}`}
                            />
                            <div
                              className={`pointer-events-none absolute -top-12 -left-12 h-36 w-36 rounded-full blur-3xl opacity-25 bg-linear-to-br ${step.frameClass}`}
                            />
                            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative flex items-start gap-3">
                              <div className="relative shrink-0">
                                <div
                                  className={`w-9 h-9 rounded-xl bg-linear-to-br ${step.iconClass} text-white flex items-center justify-center shadow-sm`}
                                >
                                  <StepIcon className="w-5 h-5" />
                                </div>
                              </div>

                              <div className="min-w-0 flex-1">
                                <h3 className="font-extrabold text-foreground text-sm sm:text-base leading-tight">
                                  {step.title}
                                </h3>
                                <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed wrap-break-word">
                                  {step.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
