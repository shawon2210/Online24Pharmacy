import { useState, useLayoutEffect } from "react";
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
import { orderApi } from "../utils/apiClient";
import { validatePhone } from "../utils/validation";
import { ROUTES, DELIVERY } from "../utils/constants";

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-2.5">
      {label}
    </label>
    <input
      {...props}
      className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm sm:text-base hover:border-emerald-300"
    />
  </div>
);

const RadioGroup = ({ label, children }) => (
  <div>
    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-4 sm:mb-6">
      {label}
    </label>
    <div className="space-y-3">{children}</div>
  </div>
);

const RadioOption = ({ name, value, checked, onChange, children }) => (
  <label
    className={`p-4 sm:p-5 border-2 rounded-xl cursor-pointer flex items-center transition-all ${
      checked
        ? "bg-emerald-50 border-emerald-500 shadow-md"
        : "border-gray-300 hover:border-emerald-300"
    }`}
  >
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
    />
    <span className="ml-3 text-sm sm:text-base font-medium text-gray-900">
      {children}
    </span>
  </label>
);

export default function CheckoutPage() {
  const { t } = useTranslation();
  const [headerOffset, setHeaderOffset] = useState(0);
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

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const delivery =
    subtotal >= DELIVERY.FREE_SHIPPING_THRESHOLD
      ? 0
      : DELIVERY.DEFAULT_SHIPPING_COST;
  const total = subtotal + delivery;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.address ||
      !formData.area
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.valid) {
      toast.error(phoneValidation.error);
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          name: formData.fullName,
          phone: formData.phone,
          street: formData.address,
          area: formData.area,
          city: formData.city,
          instructions: formData.instructions,
        },
        paymentMethod: formData.paymentMethod,
        totalAmount: total,
        shippingCost: delivery,
      };

      const data = await orderApi.create(orderData);

      clearCart();
      toast.success("Order placed successfully!");
      navigate(`${ROUTES.ORDERS}/${data.orderId}`);
    } catch (error) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Checkout - Online24 Pharma" />
      <div
        className="w-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 pb-12 sm:pb-16 lg:pb-20"
        style={{
          marginTop: `-${headerOffset}px`,
          paddingTop: `calc(${headerOffset}px + 1.5rem)`,
          minHeight: "100vh",
        }}
      >
        <div className="w-full mx-auto px-4 sm:px-6 md:max-w-4xl lg:max-w-6xl xl:max-w-7xl">
          {/* Page Header */}
          <div className="mb-0">
            <div className="inline-block mb-3 sm:mb-4">
              <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-100 to-cyan-100 border-2 border-emerald-200 text-emerald-700 rounded-full text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-shadow duration-300">
                <span className="text-lg sm:text-xl">🛍️</span>
                <span>{t("checkoutPage.badge")}</span>
              </span>
            </div>
            <h1 className="font-black text-gray-900 mb-2 sm:mb-3 tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                {t("checkoutPage.title")}
              </span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl">
              {t("checkoutPage.description")}
            </p>
          </div>
        </div>
        <div className="w-full mx-auto px-4 sm:px-6 md:max-w-4xl lg:max-w-6xl xl:max-w-7xl">
          {/* Checkout Form & Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <form onSubmit={placeOrder} className="space-y-8 sm:space-y-10">
                {/* Shipping Information */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 lg:p-10">
                  <div className="flex items-center gap-3 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b-2 border-emerald-500">
                    <div className="p-2 sm:p-3 bg-emerald-100 rounded-lg">
                      <MapPinIcon className="w-5 sm:w-6 h-5 sm:h-6 text-emerald-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                      {t("checkoutPage.shippingInfo")}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="sm:col-span-2">
                      <Input
                        label={t("checkoutPage.fullName")}
                        name="fullName"
                        type="text"
                        placeholder={t("checkoutPage.fullName")}
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
                        placeholder={t("checkoutPage.streetAddress")}
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <Input
                      label={t("checkoutPage.area")}
                      name="area"
                      type="text"
                      placeholder="e.g., Dhanmondi, Gulshan"
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
                      <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-2.5">
                        {t("checkoutPage.deliveryInstructions")}
                      </label>
                      <textarea
                        name="instructions"
                        placeholder="e.g., Ring bell twice, leave at gate..."
                        value={formData.instructions}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-4 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm sm:text-base hover:border-emerald-300 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 lg:p-10">
                  <div className="flex items-center gap-3 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b-2 border-blue-500">
                    <div className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <CreditCardIcon className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                      {t("checkoutPage.paymentMethod")}
                    </h2>
                  </div>

                  <RadioGroup>
                    <RadioOption
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === "cod"}
                      onChange={handleChange}
                    >
                      {t("checkoutPage.cashOnDelivery")}
                    </RadioOption>
                    <RadioOption
                      name="paymentMethod"
                      value="bkash"
                      checked={formData.paymentMethod === "bkash"}
                      onChange={handleChange}
                    >
                      {t("checkoutPage.bkashPayment")}
                    </RadioOption>
                    <RadioOption
                      name="paymentMethod"
                      value="nagad"
                      checked={formData.paymentMethod === "nagad"}
                      onChange={handleChange}
                    >
                      {t("checkoutPage.nagadPayment")}
                    </RadioOption>
                  </RadioGroup>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-4 sm:px-6 py-4 sm:py-5 text-base sm:text-lg font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                    loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 active:scale-95"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      <span>{t("checkoutPage.processingOrder")}</span>
                    </>
                  ) : (
                    <>
                      <span>{t("checkoutPage.placeOrder")}</span>
                      <ShoppingCartIcon className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 sticky"
                style={{ top: `${headerOffset + 1.5 * 16}px` }}
              >
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-emerald-500">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <ShoppingCartIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    {t("checkoutPage.orderSummary")}
                  </h2>
                </div>

                {/* Items List */}
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start text-sm sm:text-base pb-3 border-b border-gray-200"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 line-clamp-2">
                          {item.product.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          Qty:{" "}
                          <span className="font-bold">{item.quantity}</span>
                        </p>
                      </div>
                      <p className="font-bold text-emerald-600 ml-2 text-right">
                        ৳{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 sm:space-y-4 pt-6 sm:pt-8 border-t-2 border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">
                      {t("checkoutPage.subtotal")}
                    </span>
                    <span className="font-bold text-gray-900">
                      ৳{subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">
                      {t("checkoutPage.deliveryFee")}
                    </span>
                    <span className="font-bold text-emerald-600">
                      {delivery === 0
                        ? t("checkoutPage.free")
                        : `৳${delivery.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-gray-200">
                    <span className="text-base sm:text-lg font-bold text-gray-900">
                      {t("checkoutPage.total")}
                    </span>
                    <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      ৳{total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Info Alert */}
                <div className="mt-6 sm:mt-8 p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                  <p className="text-xs sm:text-sm text-blue-800 font-semibold">
                    ✓ {t("checkoutPage.pricesInclusive")}
                  </p>
                  <p className="text-xs sm:text-sm text-blue-700 mt-2">
                    {t("checkoutPage.deliveryNote")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
