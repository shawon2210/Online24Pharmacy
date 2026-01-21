import { useState, memo, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, RotateCw, XCircle } from "lucide-react";
import { useCartStore } from "../../stores/cartStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const sizeVariants = {
  xs: {
    container: "rounded-md sm:rounded-lg p-1.25 sm:p-1.5 md:p-2",
    categoryText: "text-[clamp(9px,2.2vw,11px)]",
    nameText: "text-[clamp(14px,3.6vw,17px)] leading-snug font-bold",
    nameMinHeight: "min-h-[2.8em] sm:min-h-[3em]",
    priceText: "text-[clamp(15px,3.8vw,19px)] font-bold",
    strikeText: "text-[clamp(9px,2.1vw,11px)]",
    iconSize: "h-8.5 w-8.5 sm:h-9 sm:w-9 md:h-9.5 md:w-9.5",
    buttonSize: "h-8.5 w-8.5 sm:h-9 sm:w-9 md:h-9.5 md:w-9.5",
    imagePadding: "p-0.75 sm:p-1 md:p-1.25",
  },
  s: {
    container: "rounded-sm sm:rounded-md p-1 sm:p-1.25 md:p-1.5",
    categoryText: "text-[clamp(9px,2vw,11px)]",
    nameText: "text-[clamp(13px,3.2vw,16px)] leading-snug font-bold",
    nameMinHeight: "min-h-[2.2em] sm:min-h-[2.4em]",
    priceText: "text-[clamp(14px,3.6vw,18px)] font-bold",
    iconSize: "h-6.5 w-6.5 sm:h-7 sm:w-7 md:h-7.5 md:w-7.5",
    buttonSize: "h-7 w-7 sm:h-7.5 sm:w-7.5 md:h-8 md:w-8",
    imagePadding: "p-0.25 sm:p-0.5 md:p-0.75",
  },
  carousel: {
    container:
      "rounded-2xl border border-white/30 dark:border-emerald-900/40 bg-white/60 dark:bg-emerald-950/60 shadow-xl hover:shadow-emerald-400/30 hover:shadow-2xl p-3 sm:p-4 md:p-5 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03] backdrop-blur-xl",
    categoryText:
      "text-[clamp(9px,1.7vw,11px)] text-emerald-700 dark:text-emerald-200 truncate uppercase tracking-wide font-semibold",
    nameText:
      "text-[clamp(13px,2.7vw,15px)] font-extrabold leading-tight line-clamp-2 text-emerald-900 dark:text-emerald-100 drop-shadow-sm",
    nameMinHeight: "min-h-[2em] sm:min-h-[2.2em]",
    priceText:
      "text-[clamp(14px,2.8vw,16px)] font-black bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent",
    iconSize: "h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-8 lg:w-8",
    buttonSize: "h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-9 lg:w-9",
    imagePadding: "p-1 sm:p-1.5 md:p-2 lg:p-2.5",
  },
  md: {
    container: "rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-3.5",
    categoryText: "text-[clamp(10px,1.8vw,13px)]",
    nameText: "text-[clamp(15px,3.4vw,20px)] leading-snug font-bold",
    nameMinHeight: "min-h-[3.4em] sm:min-h-[3.6em]",
    priceText: "text-[clamp(20px,4vw,30px)] font-bold",
    iconSize:
      "h-9.5 w-9.5 sm:h-10.5 sm:w-10.5 md:h-11.5 md:w-11.5 lg:h-12.5 lg:w-12.5",
    buttonSize:
      "h-10.5 w-10.5 sm:h-11.5 sm:w-11.5 md:h-12.5 md:w-12.5 lg:h-13.5 lg:w-13.5",
    imagePadding: "p-1.75 sm:p-2.5 md:p-3.25",
  },
};

// Fallback SVG for product images
const FALLBACK_PRODUCT_IMAGE =
  "data:image/svg+xml,%3Csvg width='300' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Crect fill='%23e5e7eb' width='300' height='400' rx='24'/%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='22' fill='%239ca3af' font-family='Arial,Helvetica,sans-serif'%3EImage%20Not%20Available%3C/text%3E%3C/svg%3E";

function ProductCard({ product, size = "xs" }) {
  const variant = sizeVariants[size] || sizeVariants.md;
  const [isAdding, setIsAdding] = useState(false);
  const [imgError, setImgError] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const {
    name,
    category,
    price,
    discountPrice,
    finalPrice,
    stock: _stock,
    isPrescriptionRequired,
    slug,
    inStock,
    hasDiscount,
    imgUrl,
  } = useMemo(() => {
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
        ? FALLBACK_PRODUCT_IMAGE
        : img.startsWith("http")
          ? img
          : `${API_URL}${img}`;

    return {
      name,
      category,
      price,
      discountPrice,
      finalPrice,
      stock,
      isPrescriptionRequired,
      slug,
      inStock,
      hasDiscount,
      imgUrl,
    };
  }, [product, imgError]);

  const handleAdd = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!inStock || isAdding) return;
      setIsAdding(true);
      addItem(product, 1);
      setTimeout(() => setIsAdding(false), 800);
    },
    [inStock, isAdding, addItem, product],
  );

  return (
    <Link
      to={`/product/${slug}`}
      className={`group relative flex flex-col p-1 sm:p-1.5 md:p-2 border border-border/60 dark:border-gray-600/60 bg-teal-800 dark:bg-emerald-800 rounded-xl shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 h-full overflow-hidden hover:border-emerald-600/80 w-full min-w-0`}
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

      {/* Image Container with Enhanced Styling and bg-slate-900 */}
      <div
        className={`relative ${
          size === "carousel" ? "mb-1 sm:mb-1.5" : "mb-1 sm:mb-1.5"
        } w-full min-w-0 max-w-full ${
          size === "carousel" ? "aspect-square" : "aspect-3/4"
        } bg-stone-600 dark:bg-stone-600 rounded-md sm:rounded-lg md:rounded-xl overflow-hidden flex items-center justify-center group/img shadow-sm hover:shadow-md transition-shadow duration-300`}
        style={{ minHeight: "5.5rem", minWidth: "5.5rem" }}
      >
        <img
          src={imgUrl}
          alt={imgError ? "Image not available" : name}
          loading="lazy"
          onError={(e) => {
            if (!imgError) setImgError(true);
          }}
          className={`w-full h-full object-cover ${variant.imagePadding} group-hover/img:scale-125 group-hover/img:brightness-110 transition-all duration-500 ease-out`}
        />
        {/* Image Overlay Gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content */}
      <div
        className={`flex flex-1 flex-col ${
          size === "carousel" ? "gap-px sm:gap-0.5" : "gap-0.5 sm:gap-1"
        }`}
      >
        {/* Category */}
        <p
          className={`${variant.categoryText} text-stone-400 dark:text-stone-400 truncate uppercase tracking-wide font-medium`}
        >
          {category}
        </p>

        {/* Product Name */}
        <h3
          className={`font-bold ${variant.nameText} ${variant.nameMinHeight} text-foreground line-clamp-2 leading-tight`}
        >
          {name}
        </h3>

        {/* Price and Action */}
        <div
          className={`mt-auto flex items-end justify-between ${
            size === "carousel"
              ? "gap-0.5 sm:gap-1 pt-0.5 sm:pt-1"
              : "gap-1 sm:gap-2 pt-1 sm:pt-1.5"
          }`}
        >
          <div className="flex flex-col gap-0">
            {hasDiscount && (
              <span
                className={`${variant.strikeText} text-gray-400 dark:text-gray-500 line-through leading-none opacity-80`}
              >
                ৳{price.toFixed(0)}
              </span>
            )}
            <p
              className={`font-black ${variant.priceText} bg-linear-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent leading-tight`}
            >
              ৳{finalPrice.toFixed(0)}
            </p>
          </div>

          {/* Add to Cart Button with Enhanced Icons */}
          <button
            onClick={handleAdd}
            disabled={!inStock || isAdding}
            aria-label="Add to cart"
            className={`flex items-center justify-center ${variant.buttonSize} rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 dark:from-emerald-600 dark:to-emerald-700 dark:hover:from-emerald-700 dark:hover:to-emerald-800 text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-md shrink-0 relative overflow-hidden group/btn`}
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              {isAdding ? (
                <RotateCw
                  className={`${variant.iconSize} animate-spin`}
                  strokeWidth={2.5}
                />
              ) : inStock ? (
                <ShoppingCart
                  className={`${variant.iconSize}`}
                  strokeWidth={2.5}
                />
              ) : (
                <XCircle className={`${variant.iconSize}`} strokeWidth={2} />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Hover overlay effect */}
      <div className="absolute inset-0 bg-linear-to-t from-emerald-600/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg sm:rounded-xl" />
    </Link>
  );
}

function areEqual(prevProps, nextProps) {
  if (prevProps.size !== nextProps.size) return false;
  const p = prevProps.product || {};
  const n = nextProps.product || {};
  const getImg = (x) => (x?.image ? x.image : x?.images?.[0]);
  const keys = [
    "id",
    "name",
    "price",
    "discountPrice",
    "stockQuantity",
    "stock",
    "slug",
    "isPrescriptionRequired",
  ];
  for (const k of keys) {
    if ((p[k] ?? null) !== (n[k] ?? null)) return false;
  }
  if (getImg(p) !== getImg(n)) return false;
  return true;
}

const MemoizedProductCard = memo(ProductCard, areEqual);
MemoizedProductCard.displayName = "ProductCard";
export default MemoizedProductCard;
