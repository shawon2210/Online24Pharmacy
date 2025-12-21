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

  const handleTrack = useCallback(
    async (id, ph) => {
      setError("");
      setOrderData(null);
      setLoading(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const response = await fetch(`${API_URL}/api/orders/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
      <div
        className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 pb-12 sm:pb-16 lg:pb-20"
        style={{
          marginTop: `-${headerOffset}px`,
          paddingTop: `${headerOffset}px`,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          {/* Header Section */}
          <div className="text-center mb-0">
            <div className="inline-block mb-3 sm:mb-4">
              <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-100 to-cyan-100 border-2 border-emerald-200 text-emerald-700 rounded-full text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-shadow duration-300">
                <span className="text-lg sm:text-xl">📦</span>
                <span>{t("trackOrderPage.badge")}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mb-2 sm:mb-3 leading-tight">
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                {t("trackOrderPage.title")}
              </span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              {t("trackOrderPage.description")}
            </p>
          </div>

          {/* Search Form Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 md:p-8 lg:p-10 mb-8 sm:mb-10 lg:mb-12 hover:shadow-xl transition-shadow duration-300">
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div className="responsive-grid">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 sm:mb-3">
                    {t("trackOrderPage.orderIdLabel")}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder={t("trackOrderPage.orderIdPlaceholder")}
                      className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm sm:text-base hover:border-emerald-300"
                      required
                    />
                    <MagnifyingGlassIcon className="absolute right-4 top-3.5 sm:top-4 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 sm:mb-3">
                    {t("trackOrderPage.phoneNumberLabel")}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("trackOrderPage.phoneNumberPlaceholder")}
                    className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm sm:text-base hover:border-emerald-300"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-3 sm:py-4 px-6 rounded-xl font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed active:scale-95"
              >
                <MagnifyingGlassIcon className="w-5 h-5 flex-shrink-0" />
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t("trackOrderPage.trackingButton")}
                  </span>
                ) : (
                  t("trackOrderPage.trackButton")
                )}
              </button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-6 sm:mt-8 p-4 sm:p-5 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm sm:text-base font-medium">
                ⚠️ {t("trackOrderPage.orderNotFound")}
              </div>
            )}

            {/* Order Results */}
            {orderData && (
              <div className="mt-6 sm:mt-8 p-4 sm:p-6 md:p-8 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-2xl hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                  <CheckCircleIcon className="w-8 sm:w-10 h-8 sm:h-10 text-emerald-600 flex-shrink-0" />
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Order #{orderData.orderNumber}
                  </h3>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center py-2 sm:py-3 px-3 sm:px-4 bg-white rounded-lg border border-emerald-200">
                    <span className="text-gray-600 font-medium">Status:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        orderData.status === "delivered"
                          ? "bg-emerald-100 text-emerald-800"
                          : orderData.status === "out_for_delivery"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {orderData.status.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 sm:py-3 px-3 sm:px-4 bg-white rounded-lg border border-emerald-200">
                    <span className="text-gray-600 font-medium">
                      Total Amount:
                    </span>
                    <span className="font-bold text-lg text-emerald-700">
                      ৳{orderData.totalAmount}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 sm:py-3 px-3 sm:px-4 bg-white rounded-lg border border-emerald-200">
                    <span className="text-gray-600 font-medium">
                      Order Date:
                    </span>
                    <span className="font-semibold">
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

                  {/* Items List */}
                  <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t-2 border-emerald-200">
                    <h4 className="font-bold text-gray-900 mb-3 text-sm sm:text-base">
                      📋 Order Items:
                    </h4>
                    <div className="space-y-2">
                      {orderData.orderItems?.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center p-2 sm:p-3 bg-white rounded-lg text-xs sm:text-sm border border-emerald-100"
                        >
                          <span className="text-gray-700 font-medium">
                            {item.product?.name}
                          </span>
                          <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
                            x{item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sign In Prompt */}
            <div className="mt-6 sm:mt-8 text-center pt-6 sm:pt-8 border-t border-gray-200">
              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                {t("trackOrderPage.haveAccountForTracking")}
              </p>
              <Link
                to="/login"
                className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 active:scale-95 text-sm sm:text-base"
              >
                {t("trackOrderPage.signInToAccount")}
              </Link>
            </div>
          </div>

          {/* Order Status Timeline */}
          <div className="mb-0">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
              {t("trackOrderPage.orderStatusTimeline")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-emerald-300 group cursor-pointer">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <CheckCircleIcon className="w-6 sm:w-8 h-6 sm:h-8 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                    {t("trackOrderPage.orderPlaced")}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  {t("trackOrderPage.orderConfirmedDesc")}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-blue-300 group cursor-pointer">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <TruckIcon className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                    {t("trackOrderPage.shipped")}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  {t("trackOrderPage.outForDeliveryDesc")}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-green-300 group cursor-pointer">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <CheckCircleIcon className="w-6 sm:w-8 h-6 sm:h-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                    {t("trackOrderPage.delivered")}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
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
