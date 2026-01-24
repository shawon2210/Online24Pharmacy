import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import SEOHead from "../components/common/SEOHead";
import { useCartStore } from "../stores/cartStore";
import {
  ShoppingCartIcon,
  MapPinIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import { PhoneIcon, UserIcon } from "@heroicons/react/24/outline";

import { useTranslation } from "react-i18next";
import { useCreateOrder } from "../hooks/useApi.js";
import { ROUTES } from "../utils/constants";

const Input = ({ label, icon, ...props }) => {
  const { t } = useTranslation();
  const id = props.id || props.name;
  const hasIcon = Boolean(icon);
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {t(label, label)}
      </label>
      <div className="relative">
        {hasIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          id={id}
          aria-required={props.required ? "true" : "false"}
          {...props}
          className={`w-full px-3 py-2 bg-card dark:bg-card border border-border dark:border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary transition-shadow shadow-sm placeholder:text-muted-foreground ${
            hasIcon ? "pl-10" : ""
          }`}
        />
      </div>
    </div>
  );
};

const RadioGroup = ({ label, children }) => {
  const { t } = useTranslation();
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-4">
        {t(label, label)}
      </label>
      <div className="space-y-3">{children}</div>
    </div>
  );
};

const RadioOption = ({
  name,
  value,
  checked,
  onChange,
  children,
  icon,
  description,
}) => {
  // Accent color mapping per payment method for clearer UI (with dark-mode variants)
  const accents = {
    cod: {
      color: "emerald-500",
      bgLight: "bg-emerald-100",
      bgDark: "bg-emerald-900/20",
      textLight: "text-emerald-600",
      textDark: "text-emerald-400",
    },
    bkash: {
      color: "rose-500",
      bgLight: "bg-rose-100",
      bgDark: "bg-rose-900/20",
      textLight: "text-rose-600",
      textDark: "text-rose-400",
    },
    nagad: {
      color: "amber-500",
      bgLight: "bg-amber-100",
      bgDark: "bg-amber-900/20",
      textLight: "text-amber-600",
      textDark: "text-amber-400",
    },
  };

  const accent = accents[value] || {
    color: "blue-500",
    bgLight: "bg-primary/10",
    bgDark: "bg-primary/20",
    textLight: "text-primary",
    textDark: "text-primary",
  };

  const labelBase = `flex items-center p-3 bg-card dark:bg-card border rounded-lg cursor-pointer transition-all hover:shadow-sm`;
  const checkedClasses = checked
    ? `border-${accent.color} bg-opacity-5 ${accent.bgLight} dark:${accent.bgDark} shadow-md`
    : `border-border dark:border-border`;

  const iconWrapper = `w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent.bgLight} dark:${accent.bgDark} ${accent.textLight} dark:${accent.textDark}`;

  return (
    <div className="relative">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
        id={`${name}-${value}`}
      />
      <label
        htmlFor={`${name}-${value}`}
        className={`${labelBase} ${checkedClasses}`}
      >
        <div className="flex items-center gap-3 sm:gap-4 w-full">
          <div className={iconWrapper}>{icon}</div>
          <div className="flex-1 min-w-0">
            <div className="font-medium sm:font-semibold text-foreground dark:text-foreground text-sm sm:text-base">
              {children}
            </div>
            <div className="text-sm text-muted-foreground truncate leading-relaxed">
              {description}
            </div>
          </div>
          <div
            className={`w-4 h-4 sm:w-5 sm:h-5 border-2 rounded-full flex items-center justify-center shrink-0 transition-all ${
              checked
                ? `border-${accent.color} bg-${accent.color}`
                : "border-border"
            }`}
            aria-hidden
          >
            {checked && (
              <div className="w-1.5 h-1.5 bg-background rounded-full" />
            )}
          </div>
        </div>
      </label>
    </div>
  );
};

export default function CheckoutPage() {
  const { t } = useTranslation();
  const [showSummary, setShowSummary] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    area: "",
    city: "Dhaka",
    instructions: "",
    paymentMethod: "cod",
  });
  const {
    mutate: createOrder,
    isLoading: loading,
    isError,
    error: createOrderError,
  } = useCreateOrder();
  const cart = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const navigate = useNavigate();

  const subtotal = cart.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    return sum + (typeof price === "number" ? price : 0) * item.quantity;
  }, 0);
  const delivery = subtotal >= 100 ? 0 : 50;
  const total = subtotal + delivery;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.address ||
      !formData.area
    ) {
      toast.error(t("checkoutPage.fillRequiredFields"));
      return;
    }

    if (cart.length === 0) {
      toast.error(t("checkoutPage.cartEmpty"));
      return;
    }

    const shippingAddress = {
      fullName: formData.fullName,
      phone: formData.phone,
      address: formData.address,
      area: formData.area,
      city: formData.city,
      instructions: formData.instructions,
    };

    createOrder(
      { ...formData, items: cart, total, shippingAddress },
      {
        onSuccess: (data) => {
          clearCart();
          navigate(`/order/confirmation/${data.id}`, { replace: true });
        },
        onError: (error) => {
          const status = error?.response?.status;
          const apiError = error?.response?.data?.error || error?.message;

          // If auth is missing/expired, reset auth state and send user to login.
          if (
            error?.code === "AUTH_REQUIRED" ||
            status === 401 ||
            status === 403 ||
            apiError === "Invalid token"
          ) {
            localStorage.removeItem("auth_token");
            sessionStorage.removeItem("auth_user");
            toast.error(
              t(
                "auth.sessionExpired",
                "Your session has expired. Please sign in again.",
              ),
            );
            navigate("/login", { replace: true });
          }
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={t("checkoutPage.seoTitle")} />

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-card/95 dark:bg-card/95 backdrop-blur-md shadow-md border-b border-border dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          {/* Professional Breadcrumbs */}
          <nav className="mb-3" aria-label={t("breadcrumb")}>
            <ol className="flex items-center gap-1 text-sm text-muted-foreground">
              <li>
                <a
                  href="/"
                  className="hover:text-primary dark:hover:text-primary font-medium"
                >
                  {t("home")}
                </a>
              </li>
              <li className="px-1 text-muted-foreground">/</li>
              <li>
                <a
                  href="/cart"
                  className="hover:text-primary dark:hover:text-primary font-medium"
                >
                  {t("cart")}
                </a>
              </li>
              <li className="px-1 text-muted-foreground">/</li>
              <li
                className="text-foreground dark:text-foreground font-bold"
                aria-current="page"
              >
                {t("checkout")}
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-primary dark:text-primary mb-1">
                {t("checkout")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("checkoutPage.reviewOrder")}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 border-2 border-primary/30 dark:border-primary/40 text-primary dark:text-primary rounded-full text-sm font-bold">
              <ShoppingCartIcon className="w-5 h-5" />
              <span>
                {cart.length} {t("items")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        {isError && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-200/60 bg-red-50/70 text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100 px-4 sm:px-6 py-4"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-red-600 shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-sm sm:text-base">
                  {t(
                    "checkoutPage.orderCreateFailed",
                    "Failed to create order",
                  )}
                </p>
                <p className="text-xs sm:text-sm text-red-800/90 dark:text-red-200/90 mt-1 wrap-break-word">
                  {createOrderError?.response?.data?.error ||
                    createOrderError?.message ||
                    t("checkoutPage.tryAgain", "Please try again in a moment.")}
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Form Section - Mobile: extra bottom padding for sticky button */}
          <div className="lg:col-span-2 space-y-6 pb-20 sm:pb-20 lg:pb-6">
            {/* Mobile collapsible order summary */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setShowSummary((s) => !s)}
                className="w-full flex items-center justify-between p-3 bg-card/60 rounded-xl border border-border hover:shadow-sm"
                aria-expanded={showSummary}
              >
                <div className="flex items-center gap-3">
                  <ShoppingCartIcon className="w-5 h-5 text-primary" />
                  <div className="text-sm font-semibold">
                    {t("checkoutPage.orderSummary")}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({cart.length} {t("items")})
                    </span>
                  </div>
                </div>
                <div className="text-sm font-bold text-primary">
                  ৳{(total || 0).toFixed(2)}
                </div>
              </button>

              {showSummary && (
                <div className="mt-3 space-y-2">
                  {cart.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="flex items-center gap-3 p-3 bg-background rounded-lg"
                    >
                      <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center font-semibold text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-sm">
                          {item.product?.name || item.name || t("product")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("checkoutPage.each", {
                            price: (
                              item.product?.price ||
                              item.price ||
                              0
                            ).toFixed(2),
                          })}
                        </p>
                      </div>
                      <div className="text-sm font-semibold text-foreground">
                        x{item.quantity}
                      </div>
                      <div className="text-sm font-bold text-primary">
                        ৳
                        {(
                          (item.product?.price || item.price || 0) *
                            item.quantity || 0
                        ).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form
              id="checkout-form"
              onSubmit={handlePlaceOrder}
              className="space-y-6"
            >
              <div className="bg-card/70 dark:bg-card/70 backdrop-blur-xl rounded-xl border border-border/50 dark:border-gray-700/50 shadow-sm p-4 sm:p-5 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 lg:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary dark:bg-primary/80 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    <MapPinIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground">
                      {t("checkoutPage.shippingInfo")}
                    </h2>
                    <p className="text-sm text-muted-foreground hidden sm:block">
                      {t("checkoutPage.whereDeliver")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="sm:col-span-2">
                    <Input
                      label={t("checkoutPage.fullName")}
                      name="fullName"
                      type="text"
                      placeholder={t("checkoutPage.fullNamePlaceholder")}
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      icon={<UserIcon className="w-4 h-4 text-primary" />}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      label={t("checkoutPage.phoneNumber")}
                      name="phone"
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      inputMode="tel"
                      pattern="[0-9]{11}"
                      aria-describedby="phone-help"
                      icon={<PhoneIcon className="w-4 h-4 text-primary" />}
                    />
                    <p
                      id="phone-help"
                      className="text-xs text-muted-foreground mt-1"
                    >
                      {t("checkoutPage.phoneHelp", "Format: 01XXXXXXXXX")}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      label={t("checkoutPage.streetAddress")}
                      name="address"
                      type="text"
                      placeholder={t("checkoutPage.streetAddressPlaceholder")}
                      value={formData.address}
                      onChange={handleChange}
                      required
                      icon={<MapPinIcon className="w-4 h-4 text-primary" />}
                    />
                  </div>
                  <Input
                    label={t("checkoutPage.area")}
                    name="area"
                    type="text"
                    placeholder={t("checkoutPage.areaPlaceholder")}
                    value={formData.area}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label={t("checkoutPage.city")}
                    name="city"
                    type="text"
                    value={formData.city}
                    disabled
                  />
                  <div className="sm:col-span-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {t("checkoutPage.deliveryInstructions")}
                      </label>
                      <textarea
                        name="instructions"
                        placeholder={t(
                          "checkoutPage.deliveryInstructionsPlaceholder",
                        )}
                        value={formData.instructions}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow resize-none placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-card/70 dark:bg-card/70 backdrop-blur-xl rounded-xl border border-border/50 dark:border-gray-700/50 shadow-sm p-4 sm:p-5 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 lg:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 dark:bg-blue-800 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    <CreditCardIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground">
                      {t("checkoutPage.paymentMethod")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t("checkoutPage.choosePayment")}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <RadioOption
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === "cod"}
                    onChange={handleChange}
                    icon="💵"
                    description={t("checkoutPage.payOnArrival")}
                  >
                    {t("checkoutPage.cashOnDelivery")}
                  </RadioOption>
                  <RadioOption
                    name="paymentMethod"
                    value="bkash"
                    checked={formData.paymentMethod === "bkash"}
                    onChange={handleChange}
                    icon="📱"
                    description={t("checkoutPage.mobileFinancial")}
                  >
                    {t("checkoutPage.bkashPayment")}
                  </RadioOption>
                  <RadioOption
                    name="paymentMethod"
                    value="nagad"
                    checked={formData.paymentMethod === "nagad"}
                    onChange={handleChange}
                    icon="💳"
                    description={t("checkoutPage.digitalPayment")}
                  >
                    {t("checkoutPage.nagadPayment")}
                  </RadioOption>
                </div>
              </div>

              {/* Place Order CTA (sticky on mobile, inline on desktop) */}
              <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border pb-safe transition-all duration-300 lg:hidden">
                <div className="max-w-xl mx-auto px-4 py-3 lg:max-w-none lg:mx-0 lg:px-0 lg:py-0">
                  <div className="flex items-center justify-between gap-4 lg:gap-6">
                    <div className="flex flex-col shrink-0 lg:hidden">
                      <span className="text-xs text-muted-foreground">
                        {t("checkoutPage.total")}
                      </span>
                      <span className="text-lg font-bold text-primary">
                        ৳{(total || 0).toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`group relative flex-1 w-full px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300 overflow-hidden shadow-lg lg:shadow-xl active:scale-[0.99] ${
                        loading
                          ? "bg-border text-foreground/50 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/25"
                      }`}
                    >
                      {!loading && (
                        <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      )}
                      <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                        {loading ? (
                          <>
                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                            <span>{t("checkoutPage.processing")}</span>
                          </>
                        ) : (
                          <>
                            <span>{t("checkoutPage.completeOrder")}</span>
                            <ShoppingCartIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary - Now visible on large screens */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-card/70 dark:bg-card/70 backdrop-blur-xl rounded-xl border border-border/50 dark:border-gray-700/50 shadow-sm p-5 lg:p-6 sticky top-28">
              <div className="flex flex-col sm:flex-row xl:flex-col items-start sm:items-center xl:items-start gap-3 sm:gap-4 mb-6 lg:mb-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary dark:bg-primary/80 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <ShoppingCartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    {t("checkoutPage.orderSummary")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t("checkoutPage.itemsInCart", { count: cart.length })}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3 sm:space-y-4 mb-6 lg:mb-8 max-h-48 sm:max-h-64 overflow-y-auto">
                {cart.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-background rounded-xl"
                  >
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-muted dark:bg-muted rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 font-semibold text-sm sm:text-lg">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm sm:text-base truncate">
                        {item.product?.name || item.name || t("product")}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t("checkoutPage.each", {
                          price: (
                            item.product?.price ||
                            item.price ||
                            0
                          ).toFixed(2),
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-muted-foreground">
                        x{item.quantity}
                      </span>
                      <p className="font-bold text-primary text-sm sm:text-base">
                        ৳
                        {(
                          (item.product?.price || item.price || 0) *
                            item.quantity || 0
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 sm:space-y-4 p-4 sm:p-6 bg-muted/40 dark:bg-card/40 rounded-xl sm:rounded-2xl">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-muted-foreground">
                    {t("checkoutPage.subtotal")}
                  </span>
                  <span className="font-semibold text-foreground text-sm sm:text-base">
                    ৳{(subtotal || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-muted-foreground">
                    {t("checkoutPage.delivery")}
                  </span>
                  <span className="font-semibold text-primary text-sm sm:text-base">
                    {delivery === 0
                      ? t("checkoutPage.free")
                      : `৳${(delivery || 0).toFixed(2)}`}
                  </span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-bold text-foreground">
                    {t("checkoutPage.total")}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-primary">
                    ৳{(total || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Desktop-only Complete Order Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={loading}
                  className={`group relative w-full px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 overflow-hidden shadow-lg ${
                    loading
                      ? "bg-border text-foreground/50 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/25"
                  }`}
                >
                  {!loading && (
                    <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  )}
                  <div className="relative flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                        <span>{t("checkoutPage.processing")}</span>
                      </>
                    ) : (
                      <>
                        <span>{t("checkoutPage.completeOrder")}</span>
                        <ShoppingCartIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              </div>

              {/* Info Alert */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-muted/40 dark:bg-card/40 rounded-xl border border-border dark:border-border">
                <div className="flex items-center gap-2 text-primary text-xs sm:text-sm font-medium">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{t("checkoutPage.secureCheckout")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
