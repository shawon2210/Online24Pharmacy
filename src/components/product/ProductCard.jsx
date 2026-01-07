import { useState, memo } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, RotateCw, XCircle } from "lucide-react";
import { useCartStore } from "../../stores/cartStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ProductCard = memo(({ product }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [imgError, setImgError] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const name = product?.name || "Product";
  const category = product?.category?.name || product?.category || "Uncategorized";
  const price = product?.price || 0;
  const discountPrice = product?.discountPrice;
  const finalPrice = discountPrice || price;
  const stock = product?.stockQuantity || product?.stock || 0;
  const isPrescriptionRequired = product?.isPrescriptionRequired;
  const slug = product?.slug || (product?.name || "product").toLowerCase().replace(/\s+/g, "-");
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
      className="group relative flex flex-col rounded-lg sm:rounded-xl border border-border dark:border-foreground bg-background dark:bg-card p-2 sm:p-3 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all h-full"
    >
      <div className="absolute top-1 sm:top-2 left-1 sm:left-2 z-10 flex flex-col gap-1">
        {isPrescriptionRequired && (
          <span className="rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-xs font-bold text-red-600 dark:text-red-400">
            Rx
          </span>
        )}
        {hasDiscount && (
          <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400">
            -{Math.round(((price - discountPrice) / price) * 100)}%
          </span>
        )}
      </div>
      <div className="relative mb-2 w-full h-32 sm:h-40 md:h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
        <img
          src={imgUrl}
          alt={name}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-full object-contain p-2 sm:p-3 group-hover:scale-110 transition-transform"
        />
      </div>
      <div className="flex flex-1 flex-col">
        <p className="text-xs text-background0 dark:text-muted-foreground truncate mb-1">
          {category}
        </p>
        <h3 className="font-bold text-xs sm:text-sm text-foreground dark:text-background line-clamp-2 mb-2">
          {name}
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-xs text-muted-foreground dark:text-background0 line-through">
                ৳{price.toFixed(0)}
              </span>
            )}
            <p className="font-black text-sm sm:text-lg text-primary">
              ৳{finalPrice.toFixed(0)}
            </p>
          </div>
          <button
            onClick={handleAdd}
            disabled={!inStock || isAdding}
            className="flex items-center justify-center h-8 sm:h-10 w-8 sm:w-10 rounded-full bg-primary text-white shadow-sm hover:scale-105 transition-transform disabled:opacity-60 shrink-0"
          >
            {isAdding ? (
              <RotateCw className="h-4 sm:h-5 w-4 sm:w-5 animate-spin" />
            ) : inStock ? (
              <ShoppingCart className="h-4 sm:h-5 w-4 sm:w-5" />
            ) : (
              <XCircle className="h-4 sm:h-5 w-4 sm:w-5" />
            )}
          </button>
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = "ProductCard";
export default ProductCard;
