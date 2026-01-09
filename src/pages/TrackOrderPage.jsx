import { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  MagnifyingGlassIcon,
  TruckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import SEOHead from "../components/common/SEOHead";

export default function TrackOrderPage() {
  const { t } = useTranslation();
  const [headerOffset, setHeaderOffset] = useState(0);
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleTrack = useCallback(
    async (id, ph) => {
      setError("");
      setOrderData(null);
      setLoading(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
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
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setOrderData(data);
      } catch (err) {
        setError(err.message || t("orderNotFound"));
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
    <>
      <SEOHead
        title={t("trackOrderPage.seoTitle")}
        description={t("trackOrderPage.seoDescription")}
        url="/track-order"
      />
      <div className="sticky top-0 z-40 bg-background/95 dark:bg-card/95 backdrop-blur-md shadow-md border-b border-border">
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
          </div>
        </div>
      </div>
      <div
        className="w-full min-h-screen bg-background dark:bg-slate-950 flex flex-col items-center justify-start pb-8 sm:pb-12 lg:pb-16"
        style={{
          marginTop: `-${headerOffset}px`,
          paddingTop: `${headerOffset}px`,
        }}
      >
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">
          <div className="bg-card border border-border rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 mb-6 xs:mb-8 flex flex-col gap-7 xs:gap-8 transition-all duration-500 w-full">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-7 xs:gap-8 w-full"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 xs:gap-7 md:gap-10 w-full">
                <div className="flex flex-col gap-1 xs:gap-2">
                  <label
                    className="block text-sm font-bold text-foreground tracking-wide mb-1"
                    htmlFor="order-id-input"
                  >
                    {t("trackOrderPage.orderIdLabel")}
                  </label>
                  <div className="relative w-full">
                    <input
                      id="order-id-input"
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder={t("trackOrderPage.orderIdPlaceholder")}
                      className="w-full pr-14 xs:pr-16 px-3 xs:px-4 py-2 xs:py-3 border-2 border-border dark:border-border rounded-xl focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/20 focus:border-primary dark:focus:border-primary transition-all text-base xs:text-lg bg-background dark:bg-slate-800 text-foreground hover:border-primary/70 dark:hover:border-primary/70 shadow-sm font-semibold tracking-wide"
                      required
                      autoComplete="off"
                      inputMode="text"
                    />
                    <MagnifyingGlassIcon className="absolute right-2 xs:right-3 top-2 xs:top-3 w-5 xs:w-6 h-5 xs:h-6 text-primary pointer-events-none transition-transform duration-300" />
                  </div>
                </div>
                <div className="flex flex-col gap-1 xs:gap-2">
                  <label
                    className="block text-sm font-bold text-foreground tracking-wide mb-1"
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
                    className="w-full px-3 xs:px-4 py-2 xs:py-3 border-2 border-emerald-200 dark:border-emerald-700 rounded-xl focus:ring-2 focus:ring-emerald-400 dark:focus:ring-emerald-600 focus:border-emerald-400 dark:focus:border-emerald-600 transition-all text-base xs:text-lg bg-background dark:bg-slate-800 text-foreground hover:border-emerald-300 dark:hover:border-emerald-600 shadow-sm font-semibold tracking-wide"
                    required
                    autoComplete="off"
                    inputMode="tel"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-800 hover:bg-emerald-700 text-white py-2.5 xs:py-3 px-5 xs:px-8 rounded-2xl font-extrabold text-base xs:text-lg shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 xs:gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
                
                tabIndex={0}
                aria-label={t("trackOrderPage.trackButton")}
              >
                <MagnifyingGlassIcon className="w-5 xs:w-6 h-5 xs:h-6 shrink-0 animate-pulse" />
                {loading ? (
                  <span className="flex items-center gap-1 xs:gap-2">
                    <div className="w-4 xs:w-5 h-4 xs:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t("trackOrderPage.trackingButton")}
                  </span>
                ) : (
                  t("trackOrderPage.trackButton")
                )}
              </button>
            </form>

            {error && (
              <div className="mt-3 p-4 bg-muted dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl text-foreground dark:text-red-300 text-base xs:text-lg font-bold flex items-center gap-2 xs:gap-3 w-full shadow-md">
                <span className="text-xl xs:text-2xl">⚠️</span>
                <span>{t("trackOrderPage.orderNotFound")}</span>
              </div>
            )}

            {orderData && (
              <div className="mt-7 xs:mt-8 p-4 xs:p-6 sm:p-8 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-3xl shadow-xl w-full ring-1 ring-emerald-100 dark:ring-0">
                <div className="flex items-center gap-2 xs:gap-3 mb-4 xs:mb-6 sm:mb-7 flex-wrap">
                  <CheckCircleIcon className="w-10 sm:w-12 h-10 sm:h-12 text-emerald-600 dark:text-emerald-400 shrink-0 animate-bounce" />
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    Order #{orderData.orderNumber}
                  </h3>
                </div>

                <div className="space-y-2 xs:space-y-3 sm:space-y-5">
                  <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center py-1.5 xs:py-2.5 sm:py-3 px-2 xs:px-3 sm:px-5 bg-background dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-700 shadow-sm gap-1 xs:gap-0">
                    <span className="text-muted-foreground font-medium">
                      {t("trackOrderPage.status")}:
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        orderData.status === "delivered"
                          ? "bg-muted dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300"
                          : orderData.status === "out_for_delivery"
                          ? "bg-muted dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300"
                          : "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300"
                      }`}
                    >
                      {orderData.status.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </div>

                  <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center py-1.5 xs:py-2.5 sm:py-3 px-2 xs:px-3 sm:px-5 bg-background dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-700 shadow-sm gap-1 xs:gap-0">
                    <span className="text-muted-foreground font-medium">
                      {t("trackOrderPage.totalAmount")}:
                    </span>
                    <span className="font-bold text-lg text-foreground dark:text-emerald-400">
                      ৳{orderData.totalAmount}
                    </span>
                  </div>

                  <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center py-1.5 xs:py-2.5 sm:py-3 px-2 xs:px-3 sm:px-5 bg-background dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-700 shadow-sm gap-1 xs:gap-0">
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

                  <div className="pt-3 xs:pt-4 sm:pt-5 mt-3 xs:mt-4 sm:mt-5 border-t-2 border-emerald-200 dark:border-emerald-700">
                    <h4 className="font-extrabold text-foreground mb-2 xs:mb-3 text-base sm:text-lg flex items-center gap-2">
                      <span className="text-xl">📋</span>{" "}
                      {t("trackOrderPage.orderItems")}:
                    </h4>
                    <div className="space-y-1 xs:space-y-2">
                      {orderData.orderItems?.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col xs:flex-row justify-between items-start xs:items-center p-1.5 xs:p-2 sm:p-3 bg-background dark:bg-slate-800 rounded-xl text-xs xs:text-sm sm:text-base border border-emerald-100 dark:border-emerald-700 shadow-sm gap-1 xs:gap-0"
                        >
                          <span className="text-foreground font-semibold break-words">
                            {item.product?.name}
                          </span>
                          <span className="bg-muted dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-2 xs:px-3 py-0.5 xs:py-1 rounded-full font-bold text-xs xs:text-base">
                            x{item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 xs:mt-10 text-center pt-6 xs:pt-8 border-t border-border w-full px-1 xs:px-2">
              <p className="text-xs xs:text-sm sm:text-base text-foreground mb-1 xs:mb-2 font-medium tracking-wide">
                {t("trackOrderPage.haveAccount")}
              </p>
              <Link
                to="/login"
                className="inline-block bg-emerald-800 hover:bg-emerald-700 text-white px-5 xs:px-7 sm:px-10 py-2 xs:py-2.5 sm:py-3 rounded-2xl font-extrabold transition-all duration-300 active:scale-98 text-xs xs:text-sm sm:text-base shadow-lg"
              >
                {t("trackOrderPage.signIn")}
              </Link>
            </div>
          </div>

          <div className="mb-0 mt-10 xs:mt-14 w-full">
            <h2 className="text-xl xs:text-2xl md:text-3xl font-extrabold text-foreground mb-6 xs:mb-8 text-center tracking-tight w-full">
              {t("trackOrderPage.timeline")}
            </h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 xs:gap-6 md:gap-8 w-full">
              <div className="bg-card border-2 border-transparent hover:border-emerald-400 dark:hover:border-emerald-600 rounded-3xl p-3 xs:p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-500 group cursor-pointer">
                <div className="flex items-center gap-2 xs:gap-3 mb-2 xs:mb-3 sm:mb-4">
                  <div className="w-14 sm:w-16 h-14 sm:h-16 bg-muted dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <CheckCircleIcon className="w-8 sm:w-10 h-8 sm:h-10 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-extrabold text-foreground text-base sm:text-lg">
                    {t("trackOrderPage.placed")}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-foreground font-medium break-words">
                  {t("trackOrderPage.placedDesc")}
                </p>
              </div>

              <div className="bg-card border-2 border-transparent hover:border-blue-400 dark:hover:border-blue-600 rounded-3xl p-3 xs:p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-500 group cursor-pointer">
                <div className="flex items-center gap-2 xs:gap-3 mb-2 xs:mb-3 sm:mb-4">
                  <div className="w-14 sm:w-16 h-14 sm:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <TruckIcon className="w-8 sm:w-10 h-8 sm:h-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-extrabold text-foreground text-base sm:text-lg">
                    {t("trackOrderPage.shipped")}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-foreground font-medium">
                  {t("trackOrderPage.shippedDesc")}
                </p>
              </div>

              <div className="bg-card border-2 border-transparent hover:border-green-400 dark:hover:border-green-600 rounded-3xl p-3 xs:p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-500 group cursor-pointer">
                <div className="flex items-center gap-2 xs:gap-3 mb-2 xs:mb-3 sm:mb-4">
                  <div className="w-14 sm:w-16 h-14 sm:h-16 bg-muted dark:bg-green-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <CheckCircleIcon className="w-8 sm:w-10 h-8 sm:h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-extrabold text-foreground text-base sm:text-lg">
                    {t("trackOrderPage.delivered")}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-foreground font-medium">
                  {t("trackOrderPage.deliveredDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
