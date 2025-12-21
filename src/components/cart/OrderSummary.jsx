import { Link, useNavigate } from "react-router-dom";
import { ShoppingCartIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ROUTES, DELIVERY } from "../../utils/constants";

/**
 * Order summary sidebar component
 * Displays pricing breakdown and checkout button
 */
export default function OrderSummary({
  subtotal = 0,
  delivery = 0,
  total = 0,
  canCheckout,
  headerOffset,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!canCheckout) {
      toast.error("Please upload prescriptions for required items");
      return;
    }
    navigate(ROUTES.CHECKOUT);
  };

  // Ensure values are numbers
  const safeSubtotal =
    typeof subtotal === "number" && !isNaN(subtotal) ? subtotal : 0;
  const safeDelivery =
    typeof delivery === "number" && !isNaN(delivery) ? delivery : 0;
  const safeTotal = typeof total === "number" && !isNaN(total) ? total : 0;

  return (
    <div
      className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 sticky top-0"
      style={{ top: `${headerOffset + 1.5 * 16}px` }}
    >
      <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-emerald-500">
        <div className="p-2 sm:p-3 bg-emerald-100 rounded-lg">
          <ShoppingCartIcon className="w-5 sm:w-6 h-5 sm:h-6 text-emerald-600" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          {t("cartPage.orderSummary")}
        </h2>
      </div>

      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base text-gray-600">
            {t("cartPage.subtotal")}
          </span>
          <span className="font-bold text-gray-900">
            ৳{safeSubtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base text-gray-600">
            {t("cartPage.deliveryFee")}
          </span>
          <span className="font-bold text-emerald-600">
            {safeDelivery === 0
              ? t("cartPage.free")
              : `৳${safeDelivery.toFixed(2)}`}
          </span>
        </div>
        {safeSubtotal < DELIVERY.FREE_SHIPPING_THRESHOLD && (
          <div className="text-xs text-gray-500">
            Add ৳{(DELIVERY.FREE_SHIPPING_THRESHOLD - safeSubtotal).toFixed(2)}{" "}
            more for free shipping
          </div>
        )}
        <div className="border-t-2 border-gray-200 pt-3 sm:pt-4 flex justify-between items-center">
          <span className="text-base sm:text-lg font-bold text-gray-900">
            {t("cartPage.totalPrice")}
          </span>
          <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            ৳{safeTotal.toFixed(2)}
          </span>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={!canCheckout}
        className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
          canCheckout
            ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 active:scale-95"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        <span>{t("cartPage.proceedCheckout")}</span>
        <ArrowRightIcon className="w-5 h-5" />
      </button>

      {!canCheckout && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
          <p className="text-xs sm:text-sm text-orange-800 font-semibold">
            {t("cartPage.prescriptionWarning")}
          </p>
        </div>
      )}

      <Link
        to={ROUTES.PRODUCTS}
        className="block text-center mt-4 sm:mt-6 text-sm sm:text-base font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
      >
        {t("cartPage.continueShopping")}
      </Link>
    </div>
  );
}
