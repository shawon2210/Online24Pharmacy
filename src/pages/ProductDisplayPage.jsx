import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import SEOHead from "../components/common/SEOHead";
import { normalizeProduct } from "../utils/normalizeProduct";
import {
  ArrowLeftIcon,
  ShoppingCartIcon,
  HeartIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import ProductCard from "../components/product/ProductCard";
import { useAuthStore } from "../stores/authStore";
import { useCartStore } from "../stores/cartStore";
import { useTranslation } from "react-i18next";
import AnimatedButton from "../components/common/AnimatedButton";

// --- Component for Product List View ---
function ProductList() {
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading } = useQuery({
    queryKey: ["products", page],
    queryFn: async () => {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(
        `${API_URL}/api/products?page=${page}&limit=${limit}`
      );
      const result = await response.json();
      return {
        products: result.products.map(normalizeProduct),
        total: result.total,
      };
    },
  });

  const totalPages = Math.ceil((data?.total || 0) / limit);

  return (
    <>
      <SEOHead
        title="All Products - Online24 Pharmacy"
        description="Browse our complete catalog of medicines and healthcare products"
        url="/products"
      />

      <div className="h-full bg-gray-50 pt-8 mt-6">
        <div className="w-full mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            All Products
          </h1>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg p-4 animate-pulse"
                >
                  <div className="w-full h-48 bg-gray-200 rounded mb-4" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {data?.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// --- Component for Single Product Detail View ---
function ProductDetail({ slug }) {
  const { t } = useTranslation();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxUploadStatus, setRxUploadStatus] = useState("idle");
  const [rxFile, setRxFile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const _authUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const addToCart = useCartStore((state) => state.addItem);

  const fetchProduct = useCallback(async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${API_URL}/api/products/${slug}`);

      if (response.ok) {
        const foundProduct = await response.json();
        setProduct({
          ...foundProduct,
          images: foundProduct.images || [
            foundProduct.image || "/placeholder-product.jpg",
          ],
          stockQuantity: foundProduct.stock || foundProduct.stockQuantity || 0,
        });

        const allResponse = await fetch(`${API_URL}/api/products`);
        const allData = await allResponse.json();
        const products = allData.products || allData;
        const related = products
          .filter(
            (p) =>
              (p.slug || p.id) !== slug &&
              (p.category === foundProduct.category ||
                p.categoryId === foundProduct.categoryId)
          )
          .slice(0, 6)
          .map((p) => ({
            ...p,
            images: p.images || [p.image || "/placeholder-product.jpg"],
            stockQuantity: p.stock || p.stockQuantity || 0,
          }));
        setRelatedProducts(related);
      } else {
        const allResponse = await fetch(`${API_URL}/api/products`);
        const data = await allResponse.json();
        const products = data.products || data;
        const foundProduct = products.find((p) => (p.slug || p.id) === slug);

        if (foundProduct) {
          setProduct({
            ...foundProduct,
            images: foundProduct.images || [
              foundProduct.image || "/placeholder-product.jpg",
            ],
            stockQuantity:
              foundProduct.stock || foundProduct.stockQuantity || 0,
          });

          const related = products
            .filter(
              (p) =>
                (p.slug || p.id) !== slug &&
                (p.category === foundProduct.category ||
                  p.categoryId === foundProduct.categoryId)
            )
            .slice(0, 6)
            .map((p) => ({
              ...p,
              images: p.images || [p.image || "/placeholder-product.jpg"],
              stockQuantity: p.stock || p.stockQuantity || 0,
            }));
          setRelatedProducts(related);
        }
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct, slug]);

  const handleAddToCart = () => {
    const cartProduct = {
      id: product.id || product.slug,
      slug: product.slug || product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || product.image,
      images: product.images || [product.image],
      stock: product.stockQuantity,
      stockQuantity: product.stockQuantity,
      category: product.category,
      requiresPrescription: product.requiresPrescription,
    };
    addToCart(cartProduct, quantity);

    const notification = document.createElement("div");
    notification.className =
      "fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-md flex items-center gap-3 animate-slide-in";
    notification.innerHTML = `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <span class="font-semibold">Added ${quantity} ${product.name} to cart!</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.classList.add("animate-slide-out");
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  const fetchReviews = async (pid) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/api/reviews/product/${pid}`);
      if (!res.ok) return;
      const data = await res.json();
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
      setTotalReviews(data.totalReviews || 0);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (product?.id) {
      fetchReviews(product.id);
    }
  }, [product?.id]);

  const submitReview = async () => {
    if (!isAuthenticated || !product?.id) return;
    if (reviewRating < 1 || reviewRating > 5) return;
    setReviewSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          comment: reviewComment.trim() || undefined,
        }),
      });
      if (res.ok) {
        setReviewComment("");
        setReviewRating(5);
        const toast = document.createElement("div");
        toast.className =
          "fixed bottom-6 right-6 bg-amber-500 text-white px-5 py-3 rounded-lg shadow-md text-sm font-semibold animate-fade-in";
        toast.textContent = "Review submitted for moderation";
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
      }
    } catch {
      const toast = document.createElement("div");
      toast.className =
        "fixed bottom-6 right-6 bg-red-600 text-white px-5 py-3 rounded-lg shadow-md text-sm font-semibold animate-fade-in";
      toast.textContent = "Failed to submit review";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3500);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = "/checkout";
  };

  const handleRxUpload = async () => {
    if (!rxFile) return;
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(rxFile.type) || rxFile.size > 5 * 1024 * 1024) {
      setRxUploadStatus("error");
      return;
    }
    try {
      setRxUploadStatus("uploading");
      const formData = new FormData();
      formData.append("file", rxFile);
      formData.append("product", product.slug || product.id);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/api/prescriptions/upload`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setRxUploadStatus("under-review");
      } else {
        setRxUploadStatus("error");
      }
    } catch {
      setRxUploadStatus("error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-200 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-gray-600 font-medium mt-6 flex items-center gap-2 justify-center">
            <span className="animate-pulse">💊</span>
            {t("productPage.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 flex items-center justify-center py-20">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 via-orange-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-4xl animate-bounce">❌</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3">
            {t("productPage.notFoundTitle")}
          </h2>
          <p className="text-gray-600 mb-8">{t("productPage.notFoundDesc")}</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-md hover:scale-105 transition-all duration-300"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            {t("productPage.browseProducts")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${product.name} - Online24 Pharma`}
        description={product.description}
      />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 py-8 pt-20 sm:py-12">
        <div className="w-full mx-auto px-4 sm:px-6 md:max-w-4xl lg:max-w-6xl xl:max-w-7xl">
          <nav className="mb-6 animate-fade-in">
            <ol className="flex items-center gap-2 text-sm flex-wrap">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 hover:text-emerald-600 transition-colors font-medium"
                >
                  Home
                </Link>
              </li>
              <li className="text-gray-400">›</li>
              <li>
                <Link
                  to="/categories"
                  className="text-gray-600 hover:text-emerald-600 transition-colors font-medium"
                >
                  Categories
                </Link>
              </li>
              <li className="text-gray-400">›</li>
              <li>
                <Link
                  to={`/categories/${product.category
                    ?.toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  className="text-gray-600 hover:text-emerald-600 transition-colors font-medium capitalize"
                >
                  {product.category}
                </Link>
              </li>
              <li className="text-gray-400">›</li>
              <li className="text-gray-900 font-bold truncate max-w-xs">
                {product.name}
              </li>
            </ol>
          </nav>

          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-md p-4 sm:p-6 lg:p-8 border-2 border-emerald-100 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-400 rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-emerald-200 shadow-md">
                  <img
                    src={product.images?.[0] || "/placeholder-product.jpg"}
                    alt={product.name}
                    className="w-full aspect-square object-contain rounded-xl relative group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop&q=80";
                    }}
                  />
                  {product.requiresPrescription && (
                    <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1 shadow-lg">
                      <span>℞</span>
                      <span>{t("productPage.prescriptionRequired")}</span>
                    </div>
                  )}
                  {product.stockQuantity > 0 && product.stockQuantity < 10 && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-lg animate-pulse">
                      {t("productPage.onlyLeft", {
                        count: product.stockQuantity,
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-100 via-cyan-100 to-blue-100 border-2 border-emerald-200 text-emerald-700 rounded-full text-sm font-bold shadow-sm">
                    <span>🏷️</span>
                    {product.category}
                  </span>
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="p-3 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 hover:from-red-50 hover:to-pink-50 transition-all duration-300 hover:scale-110 shadow-md"
                  >
                    {isWishlisted ? (
                      <HeartSolidIcon className="w-6 h-6 text-red-500 animate-pulse" />
                    ) : (
                      <HeartIcon className="w-6 h-6 text-gray-600 hover:text-red-500" />
                    )}
                  </button>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-4 leading-tight">
                  {product.name}
                </h1>

                <div className="flex items-center gap-3 mb-5">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(averageRating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {averageRating.toFixed(1)} ({totalReviews} reviews)
                  </span>
                </div>

                <div className="mb-5 p-5 bg-gradient-to-r from-emerald-50 via-cyan-50 to-blue-50 rounded-xl border-2 border-emerald-200 shadow-inner">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-gray-600 font-medium">
                      {t("productPage.price")}:
                    </span>
                    <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                      ৳{product.price}
                    </span>
                    <span className="text-lg text-gray-500 font-medium">
                      /unit
                    </span>
                  </div>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-gray-500 line-through text-lg">
                          ৳{product.originalPrice}
                        </span>
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-black rounded-full">
                          {Math.round(
                            ((product.originalPrice - product.price) /
                              product.originalPrice) *
                              100
                          )}
                          % OFF
                        </span>
                      </div>
                    )}
                </div>

                <div className="mb-5 p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <span>📦</span>
                      {t("productPage.availability")}:
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          product.stockQuantity > 0
                            ? "bg-green-500 animate-pulse shadow-lg shadow-green-500/50"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <span
                        className={`text-sm font-black ${
                          product.stockQuantity > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {product.stockQuantity > 0
                          ? product.stockQuantity > 10
                            ? t("productPage.inStock")
                            : t("productPage.onlyLeft", {
                                count: product.stockQuantity,
                              })
                          : t("productPage.outOfStock")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-5 p-4 bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 rounded-xl border-2 border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🛡️</span>
                    <h3 className="font-black text-gray-900">
                      Regulatory & Safety
                    </h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs font-black rounded">
                        DGDA
                      </span>
                      <span>
                        DGDA-licensed pharmacy. Prescription required for
                        regulated items.
                      </span>
                    </div>
                    {product.requiresPrescription && (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-black rounded">
                          ℞
                        </span>
                        <span>
                          Upload valid prescription for pharmacist verification.
                        </span>
                      </div>
                    )}
                    {product.brand && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {t("productPage.brand")}:
                        </span>
                        <span>{product.brand}</span>
                      </div>
                    )}
                    {product.manufacturer && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {t("productPage.manufacturer")}:
                        </span>
                        <span>{product.manufacturer}</span>
                      </div>
                    )}
                  </div>
                  {product.type === "medicine" && (
                    <div className="mt-3 text-xs text-gray-600 leading-relaxed">
                      <div>
                        Use as directed. Keep away from children. Consult a
                        licensed physician if symptoms persist.
                      </div>
                    </div>
                  )}
                </div>

                {product.stockQuantity > 0 && (
                  <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <span>🔢</span>
                      {t("productPage.quantity")}:
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="flex items-center border-2 border-emerald-300 rounded-xl overflow-hidden shadow-md bg-white">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-5 py-3 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-emerald-50 hover:to-emerald-100 font-black text-xl transition-all active:scale-95 text-gray-700 hover:text-emerald-600"
                          disabled={quantity <= 1}
                        >
                          −
                        </button>
                        <span className="px-6 py-3 font-black text-xl text-gray-900 min-w-[60px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() =>
                            setQuantity(
                              Math.min(product.stockQuantity, quantity + 1)
                            )
                          }
                          className="px-5 py-3 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-emerald-50 hover:to-emerald-100 font-black text-xl transition-all active:scale-95 text-gray-700 hover:text-emerald-600"
                          disabled={quantity >= product.stockQuantity}
                        >
                          +
                        </button>
                      </div>
                      <AnimatedButton
                        onClick={handleAddToCart}
                        className="flex-1"
                      >
                        {t("productPage.addToCart")}
                      </AnimatedButton>
                      <button
                        onClick={handleBuyNow}
                        className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white rounded-xl font-black text-base sm:text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 active:scale-95"
                      >
                        <span>{t("productPage.buyNow")}</span>
                      </button>
                    </div>
                  </div>
                )}

                {product.description && (
                  <div className="p-5 bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50 rounded-xl border-2 border-blue-200 shadow-sm">
                    <h3 className="font-black text-lg mb-3 text-gray-900 flex items-center gap-2">
                      <span className="text-2xl">📝</span>
                      <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                        {t("productPage.productDescription")}
                      </span>
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                      {product.description}
                    </p>
                  </div>
                )}

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border-2 border-gray-200 text-center">
                    <div className="text-2xl mb-1">✨</div>
                    <div className="text-sm font-bold text-gray-900">
                      {t("productPage.genuineProducts")}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border-2 border-gray-200 text-center">
                    <div className="text-2xl mb-1">🚚</div>
                    <div className="text-sm font-bold text-gray-900">
                      {t("productPage.fastDelivery")}
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border-2 border-gray-200 text-center">
                    <div className="text-2xl mb-1">↩️</div>
                    <div className="text-xs text-gray-600">Policy</div>
                    <div className="text-sm font-bold text-gray-900">
                      Non-returnable if sterile
                    </div>
                  </div>
                  <Link
                    to="/support"
                    className="p-3 bg-white rounded-lg border-2 border-gray-200 text-center hover:border-emerald-300"
                  >
                    <div className="text-2xl mb-1">💬</div>
                    <div className="text-xs text-gray-600">Help</div>
                    <div className="text-sm font-bold text-gray-900">
                      Chat / Hotline
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <div className="mb-6 text-center animate-fade-in">
                <div className="inline-block mb-2">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-emerald-100 to-cyan-100 border-2 border-emerald-200 text-emerald-700 rounded-full text-xs sm:text-sm font-bold shadow-sm">
                    <span>🔗</span>
                    <span>{t("productPage.similarProducts")}</span>
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  You Might Also Like
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Customers who viewed this also checked out these products
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.slug || relatedProduct.id}
                    product={relatedProduct}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="mt-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                {t("productPage.customerReviews")}
              </h2>
              <span className="text-sm text-gray-600">
                Avg {averageRating.toFixed(1)} • {totalReviews} reviews
              </span>
            </div>
            {reviews.length === 0 && (
              <div className="p-5 bg-white rounded-xl border-2 border-gray-200 text-sm text-gray-600">
                {t("productPage.noReviews")}
              </div>
            )}
            <div className="space-y-4">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="p-4 bg-white rounded-xl border-2 border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${
                            i < r.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      {r.isVerified && (
                        <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs font-bold rounded">
                          {t("productPage.verified")}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-gray-800 mb-1">
                    {r.user?.firstName} {r.user?.lastName}
                  </div>
                  {r.comment && (
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {r.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {isAuthenticated && (
              <div className="mt-8 p-6 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 rounded-2xl border-2 border-emerald-200">
                <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                  <span>📝</span>
                  {t("productPage.writeReview")}
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setReviewRating(i + 1)}
                        className={`w-7 h-7 flex items-center justify-center rounded-full transition ${
                          i < reviewRating
                            ? "bg-yellow-400 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                        aria-label={`Set rating ${i + 1}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {reviewRating} / 5
                  </span>
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience (optional)"
                  className="w-full border-2 border-gray-300 rounded-xl p-3 text-sm mb-4 focus:outline-none focus:border-emerald-400"
                  rows={4}
                />
                <button
                  onClick={submitReview}
                  disabled={reviewSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-2xl disabled:opacity-50"
                >
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>
                <p className="text-xs text-gray-500 mt-3">
                  Reviews are moderated. Only verified purchases show the
                  Verified badge.
                </p>
              </div>
            )}
            {!isAuthenticated && (
              <div className="mt-6 p-4 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-600">
                Please{" "}
                <Link to="/login" className="text-emerald-600 font-semibold">
                  login
                </Link>{" "}
                to submit a review.
              </div>
            )}
          </div>
        </div>
      </div>
      {showRxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md border-2 border-emerald-200 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black">Upload Prescription</h3>
              <button
                onClick={() => setShowRxModal(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                ✖
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Accepted: JPG/PNG/PDF, max 5MB.
            </p>
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={(e) => setRxFile(e.target.files?.[0] || null)}
              className="w-full border-2 border-gray-200 rounded-lg p-2"
            />
            <div className="mt-4 flex items-center gap-3">
              <button onClick={handleRxUpload} className="btn-primary">
                Upload
              </button>
              {rxUploadStatus === "uploading" && (
                <span className="text-sm text-gray-700">Uploading...</span>
              )}
              {rxUploadStatus === "under-review" && (
                <span className="text-sm font-bold text-amber-600">
                  Under Review
                </span>
              )}
              {rxUploadStatus === "error" && (
                <span className="text-sm font-bold text-red-600">
                  Upload Failed
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      {product?.requiresPrescription && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setShowRxModal(true)}
            className="px-5 py-3 bg-orange-500 text-white rounded-full font-black shadow-xl hover:shadow-2xl"
          >
            Upload Prescription
          </button>
        </div>
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: product?.name,
            image: product?.images || [product?.image].filter(Boolean),
            description: product?.description,
            sku: product?.slug || product?.id,
            brand: product?.brand
              ? { "@type": "Brand", name: product.brand }
              : undefined,
            offers: {
              "@type": "Offer",
              priceCurrency: "BDT",
              price: product?.price,
              availability:
                product?.stockQuantity > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
              url:
                typeof window !== "undefined"
                  ? window.location.href
                  : undefined,
            },
            aggregateRating: product?.rating
              ? {
                  "@type": "AggregateRating",
                  ratingValue: product.rating,
                  reviewCount: product.reviewCount,
                }
              : undefined,
          }),
        }}
      />
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
      `}</style>
    </>
  );
}

// --- Main Exported Component ---
export default function ProductDisplayPage() {
  const { slug } = useParams();

  // If there's a slug, show the detail page. Otherwise, show the list.
  if (slug) {
    return <ProductDetail slug={slug} />;
  }

  return <ProductList />;
}
