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

const Input = ({ label, ...props }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-900">
      {label}
    </label>
    <input
      {...props}
      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-gray-400"
    />
  </div>
);

const RadioGroup = ({ label, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-4">
      {label}
    </label>
    <div className="space-y-3">{children}</div>
  </div>
);

const RadioOption = ({ name, value, checked, onChange, children, icon, description }) => (
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
    <label htmlFor={`${name}-${value}`} className={`flex items-center p-3 sm:p-4 bg-white border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all hover:border-gray-300 hover:shadow-md ${
      checked ? "border-emerald-500 bg-emerald-50 shadow-lg" : "border-gray-200"
    }`}>
      <div className="flex items-center gap-3 sm:gap-4 w-full">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-lg sm:text-2xl flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium sm:font-semibold text-gray-900 text-sm sm:text-base">{children}</div>
          <div className="text-xs sm:text-sm text-gray-500 truncate">{description}</div>
        </div>
        <div className={`w-4 h-4 sm:w-5 sm:h-5 border-2 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
          checked ? "border-emerald-500 bg-emerald-500" : "border-gray-300"
        }`}>
          {checked && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>}
        </div>
      </div>
    </label>
  </div>
);

export default function CheckoutPage() {
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



  const subtotal = cart.reduce(
    (sum, item) => {
      const price = item.product?.price || item.price || 0;
      return sum + (typeof price === 'number' ? price : 0) * item.quantity;
    },
    0
  );
  const delivery = subtotal >= 100 ? 0 : 50;
  const total = subtotal + delivery;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone || !formData.address || !formData.area) {
      toast.error("Please fill all required fields");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearCart();
      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch (error) {
      toast.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <SEOHead title="Checkout - Online24 Pharmacy" />
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-md">
        <div className="container mx-auto px-4 py-4">
          {/* Professional Breadcrumbs */}
          <nav className="mb-3" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 text-sm text-gray-500">
              <li>
                <a href="/" className="hover:text-emerald-600 font-medium">
                  Home
                </a>
              </li>
              <li className="px-1 text-gray-400">/</li>
              <li>
                <a href="/cart" className="hover:text-emerald-600 font-medium">
                  Cart
                </a>
              </li>
              <li className="px-1 text-gray-400">/</li>
              <li className="text-gray-900 font-bold" aria-current="page">
                Checkout
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                Checkout
              </h1>
              <p className="text-sm text-gray-600">
                Review your order and complete your purchase
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-cyan-100 border-2 border-emerald-200 text-emerald-700 rounded-full text-sm font-bold">
              <ShoppingCartIcon className="w-5 h-5" />
              <span>{cart.length} Items</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Form Section */}
          <div className="xl:col-span-2 space-y-6">
            <form onSubmit={placeOrder} className="space-y-6">
              {/* Shipping Information */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 lg:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    <MapPinIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      Shipping Information
                    </h2>
                    <p className="text-sm text-gray-600 hidden sm:block">Where should we deliver your order?</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="sm:col-span-2">
                    <Input
                      label="Full Name *"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      label="Phone Number *"
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
                      label="Street Address *"
                      name="address"
                      type="text"
                      placeholder="Enter your street address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <Input
                    label="Area *"
                    name="area"
                    type="text"
                    placeholder="e.g., Dhanmondi, Gulshan"
                    value={formData.area}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="City"
                    name="city"
                    type="text"
                    value={formData.city}
                    disabled
                  />
                  <div className="sm:col-span-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900">
                        Delivery Instructions
                      </label>
                      <textarea
                        name="instructions"
                        placeholder="e.g., Ring bell twice, leave at gate..."
                        value={formData.instructions}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all resize-none placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 lg:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    <CreditCardIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      Payment Method
                    </h2>
                    <p className="text-sm text-gray-600 hidden sm:block">Choose your preferred payment option</p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <RadioOption
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === "cod"}
                    onChange={handleChange}
                    icon="💵"
                    description="Pay when your order arrives"
                  >
                    Cash on Delivery
                  </RadioOption>
                  <RadioOption
                    name="paymentMethod"
                    value="bkash"
                    checked={formData.paymentMethod === "bkash"}
                    onChange={handleChange}
                    icon="📱"
                    description="Mobile financial service"
                  >
                    bKash Payment
                  </RadioOption>
                  <RadioOption
                    name="paymentMethod"
                    value="nagad"
                    checked={formData.paymentMethod === "nagad"}
                    onChange={handleChange}
                    icon="💳"
                    description="Digital payment solution"
                  >
                    Nagad Payment
                  </RadioOption>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300 overflow-hidden ${
                  loading
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 text-white hover:shadow-2xl hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Order</span>
                      <ShoppingCartIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="xl:col-span-1">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 lg:p-8 sticky top-24">
              <div className="flex flex-col sm:flex-row xl:flex-col items-start sm:items-center xl:items-start gap-3 sm:gap-4 mb-6 lg:mb-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <ShoppingCartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Order Summary
                  </h2>
                  <p className="text-sm text-gray-600">{cart.length} items in your cart</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3 sm:space-y-4 mb-6 lg:mb-8 max-h-48 sm:max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-sm sm:text-lg font-bold text-gray-600">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                        {item.product?.name || item.name || 'Product'}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        ৳{((item.product?.price || item.price || 0)).toFixed(2)} each
                      </p>
                    </div>
                    <p className="font-bold text-emerald-600 text-sm sm:text-base">
                      ৳{(((item.product?.price || item.price || 0) * item.quantity) || 0).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 sm:space-y-4 p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">
                    ৳{(subtotal || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-gray-600">Delivery</span>
                  <span className="font-semibold text-emerald-600 text-sm sm:text-base">
                    {delivery === 0 ? "Free" : `৳${(delivery || 0).toFixed(2)}`}
                  </span>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-bold text-gray-900">Total</span>
                  <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                    ৳{(total || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Info Alert */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 text-blue-800 text-xs sm:text-sm font-medium">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Secure checkout • Free delivery over ৳100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
