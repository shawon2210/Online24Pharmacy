import { TrashIcon } from "@heroicons/react/24/outline";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";

/**
 * Individual cart item component
 * Displays product info, quantity controls, and remove button
 */
export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const { t } = useTranslation();

  const handleDecrease = () => {
    const newQty = Math.max(1, item.quantity - 1);
    onUpdateQuantity(item.id, newQty);
    if (newQty === 1) toast.success('Minimum quantity reached');
  };

  const handleIncrease = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
    toast.success('Quantity updated');
  };

  const handleRemove = () => {
    onRemove(item.id);
    toast.success('Item removed from cart');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 flex gap-4 sm:gap-6 items-start">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <img
          src={item.product?.images?.[0] || "https://via.placeholder.com/100"}
          alt={item.product?.name}
          className="w-24 sm:w-28 h-24 sm:h-28 object-cover rounded-xl"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1">
          {item.product?.name}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-2">
          {t("cartPage.unitPrice")}:{" "}
          <span className="font-bold text-emerald-600">
            ৳{item.product?.price.toFixed(2)}
          </span>
        </p>
        {item.product?.requiresPrescription && (
          <div className="inline-block bg-orange-50 border border-orange-200 rounded-lg px-3 py-1 mb-3">
            <p className="text-xs font-bold text-orange-700">
              📊 {t("cartPage.prescriptionRequired")}
            </p>
          </div>
        )}
      </div>

      {/* Quantity Control */}
      <div className="flex items-center gap-2 sm:gap-3 bg-gray-100 rounded-lg p-2 sm:p-3 flex-shrink-0">
        <button
          onClick={handleDecrease}
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-700 font-bold transition-all text-sm sm:text-base"
        >
          −
        </button>
        <span className="px-3 sm:px-4 font-bold text-gray-900 min-w-[2rem] text-center text-sm sm:text-base">
          {item.quantity}
        </span>
        <button
          onClick={handleIncrease}
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-700 font-bold transition-all text-sm sm:text-base"
        >
          +
        </button>
      </div>

      {/* Total Price */}
      <div className="flex-shrink-0 text-right">
        <p className="font-black text-emerald-600 text-base sm:text-lg">
          ৳{(item.product.price * item.quantity).toFixed(2)}
        </p>
        <p className="text-xs text-gray-500 mt-1">{t("cartPage.total")}</p>
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        className="flex-shrink-0 p-3 sm:p-4 rounded-xl hover:bg-red-50 text-red-500 hover:text-red-600 transition-all"
        title="Remove item"
      >
        <TrashIcon className="w-5 sm:w-6 h-5 sm:h-6" />
      </button>
    </div>
  );
}
