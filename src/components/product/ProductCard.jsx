import { useState, memo } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, RotateCw, XCircle } from "lucide-react";
import { useCartStore } from "../../stores/cartStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const sizeVariants = {
  xs: {
    container: "rounded-md sm:rounded-lg p-1 sm:p-1 md:p-1.5",
    categoryText: "text-[9px] sm:text-[10px]",
    nameText: "text-[10px] sm:text-[11px] md:text-[12px] leading-snug",
    priceText: "text-[11px] sm:text-xs md:text-sm",
    strikeText: "text-[9px] sm:text-[10px]",
    buttonSize: "h-6 w-6 sm:h-6.5 sm:w-6.5 md:h-7 md:w-7",
    imagePadding: "p-0.5 sm:p-0.5 md:p-1",
  },
  s: {
    container: "rounded-md sm:rounded-lg p-1.5 sm:p-1.5 md:p-2",
    categoryText: "text-[9px] sm:text-[10px] md:text-[11px]",
    nameText: "text-[11px] sm:text-[12px] md:text-sm",
    priceText: "text-[12px] sm:text-sm md:text-base",
    strikeText: "text-[9px] sm:text-[10px] md:text-[11px]",
    buttonSize: "h-6.5 w-6.5 sm:h-7 sm:w-7 md:h-8 md:w-8",
    imagePadding: "p-0.75 sm:p-1 md:p-1.5",
  },
  md: {
    container: "rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-3",
    categoryText: "text-[9px] sm:text-[10px] md:text-xs",
    nameText: "text-[10px] sm:text-xs md:text-sm",
    priceText: "text-xs sm:text-sm md:text-base lg:text-lg",
    strikeText: "text-[9px] sm:text-[10px] md:text-xs",
    buttonSize: "h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10",
    imagePadding: "p-1.5 sm:p-2 md:p-3",
  },
};

const ProductCard = memo(({ product, size = "xs" }) => {
  const variant = sizeVariants[size] || sizeVariants.md;
  const [isAdding, setIsAdding] = useState(false);
  const [imgError, setImgError] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const name = product?.name || "Product";
  const category =
    product?.category?.name || product?.category || "Uncategorized";
  const price = product?.price || 0;
  const discountPrice = product?.discountPrice;
  const finalPrice = discountPrice || price;
  const stock = product?.stockQuantity || product?.stock || 0;
  const isPrescriptionRequired = product?.isPrescriptionRequired;
  const slug =
    product?.slug ||
    (product?.name || "product").toLowerCase().replace(/\s+/g, "-");
  const inStock = stock > 0;
  const hasDiscount = discountPrice && discountPrice < price;

  const img = product?.image || product?.images?.[0];
  const imgUrl =
    !img || imgError
      ? `https://via.placeholder.com/300?text=${encodeURIComponent(name)}`
      : img.startsWith("http")
      ? img
      : `${API_URL}${img}`;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock || isAdding) return;
    setIsAdding(true);
    addItem(product, 1);
    setTimeout(() => setIsAdding(false), 800);
  };

  return (
    <Link
      to={`/product/${slug}`}
      className={`group relative flex flex-col ${variant.container} border border-border dark:border-gray-700 bg-background dark:bg-card shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full overflow-hidden`}
    >
      {/* Badges */}
      <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 z-10 flex flex-col gap-0.5 sm:gap-1">
        {isPrescriptionRequired && (
          <span className="rounded-full bg-red-100 dark:bg-red-900/40 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] md:text-xs font-bold text-red-600 dark:text-red-400 shadow-sm">
            Rx
          </span>
        )}
        {hasDiscount && (
          <span className="rounded-full bg-linear-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] md:text-xs font-bold text-amber-700 dark:text-amber-400 shadow-sm">
            -{Math.round(((price - discountPrice) / price) * 100)}%
          </span>
        )}
      </div>

      {/* Stock indicator */}
      {!inStock && (
        <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 z-10">
          <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-gray-600 dark:text-gray-400 shadow-sm">
            Out of Stock
          </span>
        </div>
      )}

      {/* Image Container */}
      <div className="relative mb-1.5 sm:mb-2 w-full aspect-square bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
        <img
          src={imgUrl}
          alt={name}
          loading="lazy"
          onError={() => setImgError(true)}
          className={`w-full h-full object-contain ${variant.imagePadding} group-hover:scale-110 transition-transform duration-500`}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-0.5 sm:gap-1">
        {/* Category */}
        <p
          className={`${variant.categoryText} text-gray-500 dark:text-gray-400 truncate uppercase tracking-wide font-medium`}
        >
          {category}
        </p>

        {/* Product Name */}
        <h3
          className={`font-bold ${variant.nameText} text-foreground dark:text-background line-clamp-2 leading-tight min-h-[2.5em] sm:min-h-[2.8em]`}
        >
          {name}
        </h3>

        {/* Price and Action */}
        <div className="mt-auto flex items-end justify-between gap-1 sm:gap-2 pt-1 sm:pt-1.5">
          <div className="flex flex-col gap-0">
            {hasDiscount && (
              <span
                className={`${variant.strikeText} text-gray-400 dark:text-gray-500 line-through leading-none`}
              >
                ৳{price.toFixed(0)}
              </span>
            )}
            <p
              className={`font-black ${variant.priceText} text-emerald-600 dark:text-emerald-400 leading-none`}
            >
              ৳{finalPrice.toFixed(0)}
            </p>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAdd}
            disabled={!inStock || isAdding}
            aria-label="Add to cart"
            className={`flex items-center justify-center ${variant.buttonSize} rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shrink-0`}
          >
            {isAdding ? (
              <RotateCw className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5 animate-spin" />
            ) : inStock ? (
              <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5" />
            ) : (
              <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Hover overlay effect */}
      <div className="absolute inset-0 bg-linear-to-t from-emerald-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg sm:rounded-xl" />
    </Link>
  );
});

ProductCard.displayName = "ProductCard";
export default ProductCard;
