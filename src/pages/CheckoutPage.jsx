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

import { useTranslation } from "react-i18next";
const Input = ({ label, ...props }) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {t(label, label)}
      </label>
      <input
        {...props}
        className="w-full px-4 py-3 bg-background border-0 rounded-xl focus:bg-background focus:ring-2 focus:ring-primary transition-all placeholder:text-muted-foreground"
      />
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
}) => (
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
      className={`flex items-center p-3 sm:p-4 bg-background dark:bg-card border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all hover:border-border hover:shadow-md ${
        checked
          ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-lg"
          : "border-border dark:border-gray-700"
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-4 w-full">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted dark:bg-muted rounded-lg flex items-center justify-center text-lg sm:text-2xl shrink-0">          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium sm:font-semibold text-foreground dark:text-foreground text-sm sm:text-base">
            {children}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground truncate">
            {description}
          </div>
        </div>
        <div
          className={`w-4 h-4 sm:w-5 sm:h-5 border-2 rounded-full flex items-center justify-center shrink-0 transition-all ${
            checked ? "border-primary bg-primary" : "border-border"
          }`}
        >
          {checked && (
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-background rounded-full"></div>
          )}
        </div>
      </div>
    </label>
  </div>
);

export default function CheckoutPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    area: "",
    city: "Dhaka",
    instructions: "",
    paymentMethod: "cod",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const cart = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const subtotal = cart.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    return sum + (typeof price === "number" ? price : 0) * item.quantity;
  }, 0);
  const delivery = subtotal >= 100 ? 0 : 50;
  const total = subtotal + delivery;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const placeOrder = async (e) => {
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

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      clearCart();
      toast.success(t("checkoutPage.orderPlaced"));
      navigate("/orders");
    } catch (_error) {
      toast.error(t("checkoutPage.orderFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={t("checkoutPage.seoTitle")} />

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-card/95 dark:bg-card/95 backdrop-blur-md shadow-md border-b border-border dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          {/* Professional Breadcrumbs */}
          <nav className="mb-3" aria-label={t("breadcrumb")}>
            <ol className="flex items-center gap-1 text-sm text-foreground dark:text-muted-foreground">
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
              <h1 className="text-2xl md:text-3xl font-black text-primary dark:text-primary mb-1">
                {t("checkout")}
              </h1>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">
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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Form Section */}
          <div className="xl:col-span-2 space-y-6">
            <form onSubmit={placeOrder} className="space-y-6">
              <div className="bg-card/70 dark:bg-card/70 backdrop-blur-xl rounded-2xl border border-border/50 dark:border-gray-700/50 shadow-xl p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 lg:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary dark:bg-primary/80 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    <MapPinIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="sm:col-span-2">
                    <Input
                      label={t("checkoutPage.fullName")}
                      name="fullName"
                      type="text"
                      placeholder={t("checkoutPage.fullNamePlaceholder")}
                      value={formData.fullName}
                      onChange={handleChange}
                      required
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
                    />
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
                          "checkoutPage.deliveryInstructionsPlaceholder"
                        )}
                        value={formData.instructions}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-4 py-3 bg-background border-0 rounded-xl focus:bg-background focus:ring-2 focus:ring-primary transition-all resize-none placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-card/70 dark:bg-card/70 backdrop-blur-xl rounded-2xl border border-border/50 dark:border-gray-700/50 shadow-xl p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 lg:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 dark:bg-blue-600/80 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    <CreditCardIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground">
                      {t("checkoutPage.paymentMethod")}
                    </h2>
                    <p className="text-sm text-muted-foreground hidden sm:block">
                      {t("checkoutPage.choosePayment")}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
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

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300 overflow-hidden ${
                  loading
                    ? "bg-border dark:bg-border text-foreground/50 cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90 text-white hover:shadow-2xl hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0"
                }`}
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                      <span>{t("checkoutPage.processing")}</span>
                    </>
                  ) : (
                    <>
                      <span>{t("checkoutPage.completeOrder")}</span>
                      <ShoppingCartIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="xl:col-span-1">
            <div className="bg-card/70 dark:bg-card/70 backdrop-blur-xl rounded-2xl border border-border/50 dark:border-gray-700/50 shadow-xl p-6 lg:p-8 sticky top-24">
              <div className="flex flex-col sm:flex-row xl:flex-col items-start sm:items-center xl:items-start gap-3 sm:gap-4 mb-6 lg:mb-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary dark:bg-primary/80 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <ShoppingCartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
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
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-background rounded-xl"
                  >
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-muted dark:bg-muted rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-sm sm:text-lg font-bold text-muted-foreground">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm sm:text-base truncate">
                        {item.product?.name || item.name || t("product")}
                      </p>
                      <p className="text-xs sm:text-sm text-background0">
                        {t("checkoutPage.each", {
                          price: (
                            item.product?.price ||
                            item.price ||
                            0
                          ).toFixed(2),
                        })}
                      </p>
                    </div>
                    <p className="font-bold text-primary text-sm sm:text-base">
                      ৳
                      {(
                        (item.product?.price || item.price || 0) *
                          item.quantity || 0
                      ).toFixed(2)}
                    </p>
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
