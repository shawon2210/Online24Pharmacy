import { TrashIcon } from "@heroicons/react/24/outline";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";

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
    <div className="bg-background dark:bg-card rounded-lg sm:rounded-xl shadow-md dark:shadow-lg border border-border dark:border-foreground p-3 sm:p-4 lg:p-6 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 items-start">
      {/* Product Image */}
      <div className="shrink-0">
        <img
          src={item.product?.images?.[0] || "https://via.placeholder.com/100"}
          alt={item.product?.name}
          className="w-20 sm:w-24 lg:w-28 h-20 sm:h-24 lg:h-28 object-cover rounded-lg sm:rounded-xl"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-foreground dark:text-foreground text-sm sm:text-base lg:text-lg mb-1 line-clamp-2">
          {item.product?.name}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground mb-2">
          {t("cartPage.unitPrice")}: <span className="font-bold text-emerald-600 dark:text-emerald-400">
            ৳{(typeof item.product?.price === 'number' && !isNaN(item.product.price) ? item.product.price : 0).toFixed(2)}
          </span>
        </p>
        {item.product?.requiresPrescription && (
          <div className="inline-block bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg px-2 sm:px-3 py-1 mb-2 sm:mb-3">
            <p className="text-xs font-bold text-orange-700 dark:text-orange-400">
              📊 {t("cartPage.prescriptionRequired")}
            </p>
          </div>
        )}
      </div>

      {/* Quantity Control */}
      <div className="flex items-center gap-1 sm:gap-2 bg-muted dark:bg-foreground rounded-lg p-1.5 sm:p-2 lg:p-3 shrink-0">
        <button
          onClick={handleDecrease}
          className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-lg hover:bg-border dark:hover:bg-muted-foreground text-foreground dark:text-muted font-bold transition-all text-sm sm:text-base"
        >
          −
        </button>
        <span className="px-2 sm:px-3 lg:px-4 font-bold text-foreground dark:text-foreground min-w-[2rem] text-center text-xs sm:text-sm lg:text-base">
          {item.quantity}
        </span>
        <button
          onClick={handleIncrease}
          className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-lg hover:bg-border dark:hover:bg-muted-foreground text-foreground dark:text-muted font-bold transition-all text-sm sm:text-base"
        >
          +
        </button>
      </div>

      {/* Total Price */}
      <div className="shrink-0 text-right">
        <p className="font-black text-emerald-600 dark:text-emerald-400 text-sm sm:text-base lg:text-lg">
          ৳{((typeof item.product?.price === 'number' && !isNaN(item.product.price) ? item.product.price : 0) * item.quantity).toFixed(2)}
        </p>
        <p className="text-xs text-background0 dark:text-muted-foreground mt-0.5 sm:mt-1">{t("cartPage.total")}</p>
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        className="shrink-0 p-2 sm:p-3 lg:p-4 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-all"
        title={t("cartPage.removeItemTitle")}
      >
        <TrashIcon className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6" />
      </button>
    </div>
  );
}
