import { getProductImage } from "../../utils/imagePlaceholders";

/**
 * OrderItemDisplay - A reusable component to display a single order item
 *
 * @param {object} props
 * @param {object} props.item - The order item object
 * @param {boolean} props.compact - Use compact layout for smaller displays
 * @param {function} props.t - Translation function
 */
export default function OrderItemDisplay({ item, compact = false, t }) {
  const imageUrl = getProductImage(item.product?.images, compact);
  const sizeClass = compact ? "w-16 h-16" : "w-16 h-16 sm:w-20 sm:h-20";

  return (
    <li className="flex items-start gap-3 xs:gap-5 hover:bg-muted/40 transition-colors">
      <div
        className={`${sizeClass} rounded-xl bg-muted/30 border-2 border-border overflow-hidden shrink-0 shadow-sm`}
      >
        <img
          src={imageUrl}
          alt={item.product?.name || t("ordersPage.productImage")}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`font-bold text-foreground line-clamp-2 mb-1 ${
            compact ? "text-sm" : "text-base xs:text-lg"
          }`}
        >
          {item.product?.name || t("ordersPage.unknownProduct")}
        </p>

        {!compact && (
          <div className="flex items-center gap-3 xs:gap-4 text-xs xs:text-sm text-muted-foreground">
            <span className="font-medium">
              {t("ordersPage.qty")}:{" "}
              <span className="font-bold text-foreground">{item.quantity}</span>
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="font-medium">
              {t("ordersPage.unit")}:{" "}
              <span className="font-bold text-foreground">
                ৳{item.unitPrice}
              </span>
            </span>
          </div>
        )}
      </div>

      <div className="text-right shrink-0">
        <p
          className={`font-black text-emerald-600 dark:text-blue-400 ${
            compact ? "text-base" : "text-lg xs:text-xl"
          }`}
        >
          ৳{item.totalPrice}
        </p>
        {!compact && (
          <p className="text-xs text-muted-foreground mt-1">
            {t("ordersPage.total")}
          </p>
        )}
      </div>
    </li>
  );
}
