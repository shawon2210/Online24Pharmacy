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
  const category = product?.category?.name || "Uncategorized";
  const price = product?.price || 0;
  const discountPrice = product?.discountPrice;
  const finalPrice = discountPrice || price;
  const stock = product?.stockQuantity || product?.stock || 0;
  const isPrescriptionRequired = product?.isPrescriptionRequired;
  const slug = product?.slug || name.toLowerCase().replace(/\s+/g, "-");
  const inStock = stock > 0;
  const hasDiscount = discountPrice && discountPrice < price;

  const img = product?.images?.[0] || product?.image;
  const imgUrl = !img || imgError ? `https://via.placeholder.com/300?text=${name}` : img.startsWith("http") ? img : `${API_URL}${img}`;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock || isAdding) return;
    setIsAdding(true);
    addItem(product, 1);
    setTimeout(() => setIsAdding(false), 800);
  };

  return (
    <Link to={`/product/${slug}`} className="group flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all">
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {isPrescriptionRequired && <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-600">Rx</span>}
        {hasDiscount && <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">-{Math.round(((price - discountPrice) / price) * 100)}%</span>}
      </div>
      <div className="relative mb-2 w-full pb-[85%] bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
        <img src={imgUrl} alt={name} loading="lazy" onError={() => setImgError(true)} className="absolute inset-0 w-full h-full object-contain p-3 group-hover:scale-110 transition-transform" />
      </div>
      <div className="flex flex-1 flex-col">
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">{category}</p>
        <h3 className="font-bold text-sm text-gray-800 dark:text-white line-clamp-2 mb-2">{name}</h3>
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {hasDiscount && <span className="text-xs text-gray-400 line-through">৳{price.toFixed(0)}</span>}
            <p className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text font-black text-lg text-transparent">৳{finalPrice.toFixed(0)}</p>
          </div>
          <button onClick={handleAdd} disabled={!inStock || isAdding} className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm hover:scale-105 transition-transform disabled:opacity-60">
            {isAdding ? <RotateCw className="h-5 w-5 animate-spin" /> : inStock ? <ShoppingCart className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = "ProductCard";
export default ProductCard;
