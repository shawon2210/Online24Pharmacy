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
  // Helper for translation fallback
  const tf = (key, options, fallback) => {
    const translated = t(key, options);
    if (translated === key) return fallback || translated;
    return translated;
  };
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
        className="w-full min-h-screen bg-gradient-to-br from-[#e0f7fa] via-[#f8fafc] to-[#e0f2fe] flex flex-col items-center justify-start pb-8 sm:pb-12 lg:pb-16"
        style={{
          marginTop: `-${headerOffset}px`,
          paddingTop: `${headerOffset}px`,
        }}
      >
        <div className="w-full max-w-5xl mx-auto px-2 xs:px-4 sm:px-8 lg:px-20 py-2 xs:py-4 sm:py-7 lg:py-10 flex flex-col gap-8 xs:gap-10 md:gap-12">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center gap-2 xs:gap-3 mb-2 xs:mb-3 w-full px-1 xs:px-2 animate-fade-in">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md border border-emerald-200 text-emerald-700 rounded-full text-base font-extrabold shadow-lg animate-bounce-in">
              <span className="text-2xl animate-bounce">📦</span>
              <span>
                {tf("trackOrderPage.badge", undefined, "Track Your Order")}
              </span>
            </span>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent mt-2 mb-1 drop-shadow-xl tracking-tight animate-slide-up">
              {tf("trackOrderPage.title", undefined, "Order Tracking Portal")}
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto font-medium animate-fade-in delay-100">
              {tf(
                "trackOrderPage.description",
                undefined,
                "Easily track your order status by entering your Order ID and phone number. Stay updated on your delivery every step of the way!"
              )}
            </p>
          </div>

          {/* Search Form Card */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200 p-2 xs:p-4 sm:p-8 md:p-12 mb-6 xs:mb-8 flex flex-col gap-7 xs:gap-8 transition-all duration-500 w-full animate-fade-in">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-7 xs:gap-8 w-full"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 xs:gap-7 md:gap-10 w-full">
                <div className="flex flex-col gap-1 xs:gap-2">
                  <label
                    className="block text-sm font-bold text-gray-700 tracking-wide mb-1"
                    htmlFor="order-id-input"
                  >
                    {tf("trackOrderPage.orderIdLabel", undefined, "Order ID")}
                  </label>
                  <div className="relative w-full">
                    <input
                      id="order-id-input"
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder={tf(
                        "trackOrderPage.orderIdPlaceholder",
                        undefined,
                        "Enter your Order ID"
                      )}
                      className="w-full px-3 xs:px-4 py-2 xs:py-3 border-2 border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-base xs:text-lg bg-white/90 hover:border-emerald-300 shadow-sm font-semibold tracking-wide"
                      required
                      autoComplete="off"
                      inputMode="text"
                    />
                    <MagnifyingGlassIcon className="absolute right-2 xs:right-3 top-2 xs:top-3 w-5 xs:w-6 h-5 xs:h-6 text-emerald-400 pointer-events-none transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>
                <div className="flex flex-col gap-1 xs:gap-2">
                  <label
                    className="block text-sm font-bold text-gray-700 tracking-wide mb-1"
                    htmlFor="phone-input"
                  >
                    {tf(
                      "trackOrderPage.phoneNumberLabel",
                      undefined,
                      "Phone Number"
                    )}
                  </label>
                  <input
                    id="phone-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={tf(
                      "trackOrderPage.phoneNumberPlaceholder",
                      undefined,
                      "Enter your phone number"
                    )}
                    className="w-full px-3 xs:px-4 py-2 xs:py-3 border-2 border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all text-base xs:text-lg bg-white/90 hover:border-emerald-300 shadow-sm font-semibold tracking-wide"
                    required
                    autoComplete="off"
                    inputMode="tel"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white py-2.5 xs:py-3 px-5 xs:px-8 rounded-2xl font-extrabold text-base xs:text-lg shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 xs:gap-3 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed active:scale-98 focus:ring-2 focus:ring-cyan-400"
                tabIndex={0}
                aria-label={tf(
                  "trackOrderPage.trackButton",
                  undefined,
                  "Track Order"
                )}
              >
                <MagnifyingGlassIcon className="w-5 xs:w-6 h-5 xs:h-6 flex-shrink-0 animate-pulse transition-transform duration-300 group-hover:scale-110" />
                {loading ? (
                  <span className="flex items-center gap-1 xs:gap-2">
                    <div className="w-4 xs:w-5 h-4 xs:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {tf(
                      "trackOrderPage.trackingButton",
                      undefined,
                      "Tracking..."
                    )}
                  </span>
                ) : (
                  tf("trackOrderPage.trackButton", undefined, "Track Order")
                )}
              </button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-3 p-4 bg-red-100/90 border border-red-300 rounded-xl text-red-700 text-base xs:text-lg font-bold flex items-center gap-2 xs:gap-3 animate-shake w-full shadow-md transition-all duration-300">
                <span className="text-xl xs:text-2xl">⚠️</span>
                <span>
                  {tf(
                    "trackOrderPage.orderNotFound",
                    undefined,
                    "Order not found. Please check your Order ID and phone number."
                  )}
                </span>
              </div>
            )}

            {/* Order Results */}
            {orderData && (
              <div className="mt-7 xs:mt-8 p-4 xs:p-6 sm:p-8 bg-gradient-to-br from-emerald-100/90 to-cyan-100/90 border border-emerald-200 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 w-full overflow-x-auto animate-fade-in">
                <div className="flex items-center gap-2 xs:gap-3 mb-4 xs:mb-6 sm:mb-7 flex-wrap animate-slide-up">
                  <CheckCircleIcon className="w-10 sm:w-12 h-10 sm:h-12 text-emerald-600 flex-shrink-0 animate-bounce" />
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    Order #{orderData.orderNumber}
                  </h3>
                </div>

                <div className="space-y-2 xs:space-y-3 sm:space-y-5">
                  <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center py-1.5 xs:py-2.5 sm:py-3 px-2 xs:px-3 sm:px-5 bg-white/95 rounded-xl border border-emerald-200 shadow-sm gap-1 xs:gap-0 transition-all duration-300">
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

                  <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center py-1.5 xs:py-2.5 sm:py-3 px-2 xs:px-3 sm:px-5 bg-white/95 rounded-xl border border-emerald-200 shadow-sm gap-1 xs:gap-0 transition-all duration-300">
                    <span className="text-gray-600 font-medium">
                      Total Amount:
                    </span>
                    <span className="font-bold text-lg text-emerald-700">
                      ৳{orderData.totalAmount}
                    </span>
                  </div>

                  <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center py-1.5 xs:py-2.5 sm:py-3 px-2 xs:px-3 sm:px-5 bg-white/95 rounded-xl border border-emerald-200 shadow-sm gap-1 xs:gap-0 transition-all duration-300">
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
                  <div className="pt-3 xs:pt-4 sm:pt-5 mt-3 xs:mt-4 sm:mt-5 border-t-2 border-emerald-200">
                    <h4 className="font-extrabold text-gray-900 mb-2 xs:mb-3 text-base sm:text-lg flex items-center gap-2 animate-fade-in">
                      <span className="text-xl">📋</span> Order Items:
                    </h4>
                    <div className="space-y-1 xs:space-y-2">
                      {orderData.orderItems?.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col xs:flex-row justify-between items-start xs:items-center p-1.5 xs:p-2 sm:p-3 bg-white/95 rounded-xl text-xs xs:text-sm sm:text-base border border-emerald-100 shadow-sm gap-1 xs:gap-0 transition-all duration-300 animate-slide-up"
                        >
                          <span className="text-gray-700 font-semibold">
                            {item.product?.name}
                          </span>
                          <span className="bg-emerald-100 text-emerald-800 px-2 xs:px-3 py-0.5 xs:py-1 rounded-full font-bold text-xs xs:text-base">
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
            <div className="mt-8 xs:mt-10 text-center pt-6 xs:pt-8 border-t border-gray-200 w-full px-1 xs:px-2 animate-fade-in">
              <p className="text-xs xs:text-sm sm:text-base text-gray-700 mb-1 xs:mb-2 font-medium tracking-wide">
                {tf(
                  "trackOrderPage.haveAccountForTracking",
                  undefined,
                  "Have an account? Sign in for full order history and faster tracking."
                )}
              </p>
              <Link
                to="/login"
                className="inline-block bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 text-white px-5 xs:px-7 sm:px-10 py-2 xs:py-2.5 sm:py-3 rounded-2xl font-extrabold hover:from-blue-700 hover:to-emerald-700 transition-all duration-300 active:scale-98 text-xs xs:text-sm sm:text-base shadow-lg animate-slide-up"
              >
                {tf(
                  "trackOrderPage.signInToAccount",
                  undefined,
                  "Sign In to Your Account"
                )}
              </Link>
            </div>
          </div>

          {/* Order Status Timeline */}
          <div className="mb-0 mt-10 xs:mt-14 w-full animate-fade-in">
            <h2 className="text-xl xs:text-2xl md:text-3xl font-extrabold text-gray-900 mb-6 xs:mb-8 text-center tracking-tight w-full drop-shadow-lg animate-slide-up">
              {tf(
                "trackOrderPage.orderStatusTimeline",
                undefined,
                "Order Status Timeline"
              )}
            </h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 xs:gap-6 md:gap-8 w-full">
              <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-3 xs:p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-emerald-400 group cursor-pointer animate-fade-in">
                <div className="flex items-center gap-2 xs:gap-3 mb-2 xs:mb-3 sm:mb-4">
                  <div className="w-14 sm:w-16 h-14 sm:h-16 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <CheckCircleIcon className="w-8 sm:w-10 h-8 sm:h-10 text-emerald-600" />
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">
                    {tf(
                      "trackOrderPage.orderPlaced",
                      undefined,
                      "Order Placed"
                    )}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-gray-700 font-medium">
                  {tf(
                    "trackOrderPage.orderConfirmedDesc",
                    undefined,
                    "Your order has been placed and confirmed. We'll start processing it soon."
                  )}
                </p>
              </div>

              <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-3 xs:p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-blue-400 group cursor-pointer animate-fade-in">
                <div className="flex items-center gap-2 xs:gap-3 mb-2 xs:mb-3 sm:mb-4">
                  <div className="w-14 sm:w-16 h-14 sm:h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <TruckIcon className="w-8 sm:w-10 h-8 sm:h-10 text-blue-600" />
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">
                    {tf("trackOrderPage.shipped", undefined, "Shipped")}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-gray-700 font-medium">
                  {tf(
                    "trackOrderPage.outForDeliveryDesc",
                    undefined,
                    "Your order is on the way to your address. Track its journey here."
                  )}
                </p>
              </div>

              <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-3 xs:p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-green-400 group cursor-pointer animate-fade-in">
                <div className="flex items-center gap-2 xs:gap-3 mb-2 xs:mb-3 sm:mb-4">
                  <div className="w-14 sm:w-16 h-14 sm:h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <CheckCircleIcon className="w-8 sm:w-10 h-8 sm:h-10 text-green-600" />
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">
                    {tf("trackOrderPage.delivered", undefined, "Delivered")}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-gray-700 font-medium">
                  {tf(
                    "trackOrderPage.deliveredDesc",
                    undefined,
                    "Your order has been delivered. Thank you for choosing Online24 Pharmacy!"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
