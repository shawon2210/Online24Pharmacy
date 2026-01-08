import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import SEOHead from "../components/common/SEOHead";
import {
  normalizeProduct,
  generateSlugFromName,
} from "../utils/normalizeProduct";
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
import i18next from "i18next";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

const ensureAbsoluteImages = (prod) => {
  if (!prod) return prod;
  const toAbsolute = (url) => {
    if (!url) return url;
    if (/^(https?:)?\/\//.test(url) || url.startsWith("data:")) return url;
    if (url.startsWith("/")) return `${API_URL}${url}`;
    return `${API_URL}/${url}`;
  };
  const images = (prod.images || []).map(toAbsolute).filter(Boolean);
  const image = toAbsolute(prod.image || images[0]);
  return {
    ...prod,
    images: images.length ? images : image ? [image] : [],
    image,
  };
};

// Generic tf helper using i18next directly for modules that don't define tf
// eslint-disable-next-line no-unused-vars
const tf = (key, _options, fallback) => {
  try {
    const translated = i18next.t(key);
    if (!translated || translated === key) return fallback || translated || key;
    return translated;
  } catch (_e) {
    return typeof fallback !== "undefined" ? fallback : key;
  }
};

// --- Component for Product List View ---
function ProductList() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading } = useQuery({
    queryKey: ["products", page],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/api/products?page=${page}&limit=${limit}`
      );
      const result = await response.json();
      return {
        products: result.products
          .map(normalizeProduct)
          .map(ensureAbsoluteImages),
        total: result.total,
      };
    },
  });

  const totalPages = Math.ceil((data?.total || 0) / limit);

  // const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("productPage.allProductsTitle")}
        description={t("productPage.allProductsDesc")}
        url="/products"
      />

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background border-b border-border shadow-md">
        <div className="container mx-auto px-4 py-4">
          {/* Professional Breadcrumbs */}
          <nav className="mb-3" aria-label={t("breadcrumb")}>
            <ol className="flex items-center gap-1 text-sm text-foreground">
              <li>
                <Link to="/" className="hover:text-emerald-600 font-medium">
                  {t("home")}
                </Link>
              </li>
              <li className="px-1 text-muted-foreground">/</li>
              <li className="text-foreground font-bold" aria-current="page">
                {t("productPage.allProducts")}
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-black bg-linear-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                {t("productPage.allProducts")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("productPage.allProductsDesc")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-4 text-sm text-muted-foreground">
          {isLoading
            ? t("loading")
            : t("productPage.productsFound", { count: data?.total || 0 })}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="bg-background rounded-lg p-4 animate-pulse border border-border"
              >
                <div className="w-full h-48 bg-border rounded mb-4" />
                <div className="h-4 bg-border rounded mb-2" />
                <div className="h-4 bg-border rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {data?.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-emerald-600 text-background rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {t("previous")}
                </button>
                <span className="px-4 py-2 text-sm text-muted-foreground">
                  {t("productPage.pageOf", { page, totalPages })}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-emerald-600 text-background rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {t("next")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// --- Component for Single Product Detail View ---
function ProductDetail({ slug }) {
  const { t } = useTranslation();
  // Helper for translation fallback
  const tf = (key, options, fallback) => {
    const translated = t(key, options);
    // If translation key is missing, t() returns the key itself
    if (translated === key) return fallback || translated;
    return translated;
  };
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
  const targetSlug = slug?.toString().toLowerCase();

  const fetchProduct = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/${slug}`);

      if (response.ok) {
        const foundProduct = ensureAbsoluteImages(
          normalizeProduct(await response.json())
        );
        setProduct(foundProduct);

        const allResponse = await fetch(`${API_URL}/api/products`);
        const allData = await allResponse.json();
        const products = (allData.products || allData)
          .map(normalizeProduct)
          .map(ensureAbsoluteImages);
        const related = products
          .filter(
            (p) =>
              (p.slug || p.id) !== foundProduct.slug &&
              (p.category === foundProduct.category ||
                p.categoryId === foundProduct.categoryId)
          )
          .slice(0, 6);
        setRelatedProducts(related);
      } else {
        const allResponse = await fetch(`${API_URL}/api/products`);
        const data = await allResponse.json();
        const products = (data.products || data)
          .map(normalizeProduct)
          .map(ensureAbsoluteImages);
        const foundProduct = products.find((p) => {
          const pSlug = p.slug?.toString().toLowerCase();
          return (
            pSlug === targetSlug ||
            generateSlugFromName(p.name) === targetSlug ||
            p.id?.toString().toLowerCase() === targetSlug
          );
        });

        if (foundProduct) {
          setProduct(foundProduct);

          const related = products
            .filter(
              (p) =>
                (p.slug || p.id) !== foundProduct.slug &&
                (p.category === foundProduct.category ||
                  p.categoryId === foundProduct.categoryId)
            )
            .slice(0, 6);
          setRelatedProducts(related);
        }
      }
    } catch (error) {
      console.error(t("productPage.fetchProductError"), error);
    } finally {
      setLoading(false);
    }
  }, [slug, t, targetSlug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct, slug]);

  const categoryName =
    typeof product?.category === "string"
      ? product.category
      : product?.category?.name ||
        product?.categoryName ||
        product?.subcategory?.category?.name ||
        "";

  const categorySlug = categoryName
    ? categoryName.toLowerCase().replace(/\s+/g, "-")
    : "";

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
      category: categoryName || product.category,
      requiresPrescription: product.requiresPrescription,
    };
    addToCart(cartProduct, quantity);

    const notification = document.createElement("div");
    notification.className =
      "fixed top-20 right-4 z-50 bg-green-500 text-background px-6 py-4 rounded-lg shadow-md flex items-center gap-3 animate-slide-in";
    notification.innerHTML = `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <span class="font-semibold">${t("productPage.addedToCart", {
        quantity,
        name: product.name,
      })}</span>
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
      if (
        !API_URL.startsWith("http://localhost") &&
        !API_URL.startsWith("http://127.0.0.1") &&
        !API_URL.startsWith(window.location.origin)
      ) {
        console.error("Invalid API URL");
        return;
      }
      const res = await fetch(
        `${API_URL}/api/reviews/product/${encodeURIComponent(pid)}`
      );
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
      const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${useAuthStore.getState().token}`,
      };
      if (csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
      }
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers,
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
          "fixed bottom-6 right-6 bg-amber-500 text-background px-5 py-3 rounded-lg shadow-md text-sm font-semibold animate-fade-in";
        toast.textContent = t("productPage.reviewSubmitted");
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
      }
    } catch {
      const toast = document.createElement("div");
      toast.className =
        "fixed bottom-6 right-6 bg-red-600 text-background px-5 py-3 rounded-lg shadow-md text-sm font-semibold animate-fade-in";
      toast.textContent = t("productPage.submitReviewFailed");
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
      const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/api/prescriptions/upload`, {
        method: "POST",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
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
      <div className="min-h-screen bg-background">
        {/* Skeleton Header */}
        <div className="sticky top-0 z-40 bg-background border-b border-border shadow-md">
          <div className="container mx-auto px-4 py-4">
            <div className="h-4 bg-border rounded w-1/3 mb-3 animate-pulse" />
            <div className="h-8 bg-border rounded w-1/2 animate-pulse" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="bg-background rounded-xl shadow-lg p-6 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-border aspect-square rounded-xl" />
              <div className="space-y-4">
                <div className="h-6 bg-border rounded w-1/4" />
                <div className="h-8 bg-border rounded w-3/4" />
                <div className="h-4 bg-border rounded w-1/2" />
                <div className="h-12 bg-border rounded" />
                <div className="h-10 bg-border rounded w-1/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background border-b border-border shadow-md">
          <div className="container mx-auto px-4 py-4">
            <nav className="mb-3" aria-label={t("breadcrumb")}>
              <ol className="flex items-center gap-1 text-sm text-muted-foreground">
                <li>
                  <Link to="/" className="hover:text-emerald-600 font-medium">
                    {t("home")}
                  </Link>
                </li>
                <li className="px-1 text-muted-foreground">/</li>
                <li>
                  <Link
                    to="/categories"
                    className="hover:text-emerald-600 font-medium"
                  >
                    {t("categories")}
                  </Link>
                </li>
                <li className="px-1 text-muted-foreground">/</li>
                <li className="text-foreground font-bold">
                  {t("productPage.productNotFound")}
                </li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-md mx-auto">
            <div className="text-6xl mb-6">🔍</div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {t("productPage.productNotFound")}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t("productPage.productNotFoundDesc")}
            </p>
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-background rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              {t("productPage.browseCategories")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={t("productPage.seoTitleWithProductName", {
          productName: product.name,
        })}
        description={product.description}
      />
      <div className="min-h-screen bg-background">
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-background border-b border-border shadow-md">
          <div className="container mx-auto px-4 py-4">
            {/* Professional Breadcrumbs */}
            <nav className="mb-3" aria-label={t("breadcrumb")}>
              <ol className="flex items-center gap-1 text-sm text-muted-foreground">
                <li>
                  <Link to="/" className="hover:text-emerald-600 font-medium">
                    {t("home")}
                  </Link>
                </li>
                <li className="px-1 text-muted-foreground">/</li>
                <li>
                  <Link
                    to="/categories"
                    className="hover:text-emerald-600 font-medium"
                  >
                    {t("categories")}
                  </Link>
                </li>
                <li className="px-1 text-muted-foreground">/</li>
                <li>
                  <Link
                    to={
                      categorySlug
                        ? `/categories/${categorySlug}`
                        : "/categories"
                    }
                    className="hover:text-emerald-600 font-medium capitalize"
                  >
                    {categoryName || "Uncategorized"}
                  </Link>
                </li>
                <li className="px-1 text-muted-foreground">/</li>
                <li
                  className="text-foreground font-bold truncate max-w-xs"
                  aria-current="page"
                >
                  {product.name}
                </li>
              </ol>
            </nav>
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl md:text-2xl font-black bg-linear-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent truncate">
                {product.name}
              </h1>
              <div className="flex items-center gap-2">
                {product.stockQuantity > 0 ? (
                  <span className="flex items-center gap-1 px-3 py-1 bg-muted text-foreground rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    {t("productPage.inStock")}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1 bg-muted text-foreground rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    {t("productPage.outOfStock")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-background rounded-xl shadow-lg p-6 lg:p-8 border border-border">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="relative">
                <div className="bg-background rounded-xl p-6 border border-border">
                  <img
                    src={product.images?.[0] || "/placeholder-product.jpg"}
                    alt={product.name}
                    className="w-full aspect-square object-contain rounded-lg hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop&q=80";
                    }}
                  />
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.requiresPrescription && (
                      <span className="bg-red-500 text-background px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        ℞ {t("productPage.prescriptionRequired")}
                      </span>
                    )}
                    {product.stockQuantity > 0 &&
                      product.stockQuantity < 10 && (
                        <span className="bg-amber-500 text-background px-2 py-1 rounded-full text-xs font-bold">
                          {t("productPage.onlyLeft", {
                            count: product.stockQuantity,
                          })}
                        </span>
                      )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-muted text-foreground rounded-full text-sm font-medium">
                    🏷️ {categoryName || "Uncategorized"}
                  </span>
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                  >
                    {isWishlisted ? (
                      <HeartSolidIcon className="w-6 h-6 text-red-500" />
                    ) : (
                      <HeartIcon className="w-6 h-6 text-muted-foreground hover:text-red-500" />
                    )}
                  </button>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4 leading-tight">
                  {product.name}
                </h2>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(averageRating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">
                    {averageRating.toFixed(1)} ({totalReviews}{" "}
                    {t("productPage.reviews")})
                  </span>
                </div>
                <div className="mb-6 p-4 bg-background rounded-lg border border-border">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">
                      ৳{product.price}
                    </span>
                    <span className="text-muted-foreground">
                      / {t("productPage.unit")}
                    </span>
                  </div>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-muted-foreground line-through">
                          ৳{product.originalPrice}
                        </span>
                        <span className="px-2 py-1 bg-red-500 text-background text-xs font-bold rounded">
                          {Math.round(
                            ((product.originalPrice - product.price) /
                              product.originalPrice) *
                              100
                          )}
                          % {t("productPage.off")}
                        </span>
                      </div>
                    )}
                </div>
                {(product.brand ||
                  product.manufacturer ||
                  product.requiresPrescription) && (
                  <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      🛡️ {t("productPage.productInfo")}
                    </h3>
                    <div className="space-y-2 text-sm text-foreground">
                      {product.brand && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {t("productPage.brand")}:
                          </span>
                          <span>{product.brand}</span>
                        </div>
                      )}
                      {product.manufacturer && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {t("productPage.manufacturer")}:
                          </span>
                          <span>{product.manufacturer}</span>
                        </div>
                      )}
                      {product.requiresPrescription && (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-red-500 text-background text-xs font-bold rounded">
                            ℞
                          </span>
                          <span>
                            {t("productPage.prescriptionRequiredForProduct")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {product.stockQuantity > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-foreground mb-3">
                      {t("productPage.quantity")}:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex items-center border border-border rounded-lg overflow-hidden bg-background">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-4 py-2 hover:bg-background font-medium text-lg transition-colors"
                          disabled={quantity <= 1}
                        >
                          −
                        </button>
                        <span className="px-4 py-2 font-medium text-lg min-w-15 text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() =>
                            setQuantity(
                              Math.min(product.stockQuantity, quantity + 1)
                            )
                          }
                          className="px-4 py-2 hover:bg-background font-medium text-lg transition-colors"
                          disabled={quantity >= product.stockQuantity}
                        >
                          +
                        </button>
                      </div>
                      <div className="flex gap-3 flex-1">
                        <button
                          onClick={handleAddToCart}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-background rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                        >
                          <ShoppingCartIcon className="w-5 h-5" />
                          {t("productPage.addToCart")}
                        </button>
                        <button
                          onClick={handleBuyNow}
                          className="px-6 py-3 bg-blue-600 text-background rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          {t("productPage.buyNow")}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {product.description && (
                  <div className="p-4 bg-background rounded-lg border border-border">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      📝 {t("productPage.description")}
                    </h3>
                    <p className="text-foreground leading-relaxed text-sm">
                      {product.description}
                    </p>
                  </div>
                )}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="p-3 bg-background rounded-lg border border-border text-center">
                    <div className="text-xl mb-1">✨</div>
                    <div className="text-xs font-medium text-foreground">
                      {t("productPage.genuineProducts")}
                    </div>
                  </div>
                  <div className="p-3 bg-background rounded-lg border border-border text-center">
                    <div className="text-xl mb-1">🚚</div>
                    <div className="text-xs font-medium text-foreground">
                      {t("productPage.fastDelivery")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-foreground mb-2">
                  {t("productPage.relatedProducts")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("productPage.customersAlsoChecked")}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.slug || relatedProduct.id}
                    product={relatedProduct}
                    size="xs"
                  />
                ))}
              </div>
            </div>
          )}
          <div className="mt-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                {t("productPage.customerReviews")}
              </h2>
              <span className="text-sm text-muted-foreground">
                {averageRating.toFixed(1)} ★ • {totalReviews}{" "}
                {t("productPage.reviews")}
              </span>
            </div>
            {reviews.length === 0 && (
              <div className="p-4 bg-background rounded-lg border border-border text-sm text-muted-foreground">
                {t("productPage.noReviews")}
              </div>
            )}
            <div className="space-y-4">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="p-4 bg-background rounded-lg border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${
                            i < r.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-muted"
                          }`}
                        />
                      ))}
                      {r.isVerified && (
                        <span className="px-2 py-1 bg-muted text-foreground text-xs font-medium rounded">
                          {t("productPage.verified")}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-foreground mb-1">
                    {r.user?.firstName} {r.user?.lastName}
                  </div>
                  {r.comment && (
                    <p className="text-sm text-foreground leading-relaxed">
                      {r.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {isAuthenticated && (
              <div className="mt-8 p-6 bg-background rounded-lg border border-border">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  📝{" "}
                  {tf("productPage.writeReview", undefined, "Write a Review")}
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setReviewRating(i + 1)}
                        className={`w-6 h-6 flex items-center justify-center rounded transition ${
                          i < reviewRating ? "text-yellow-400" : "text-muted"
                        }`}
                        aria-label={tf(
                          "productPage.setRating",
                          { rating: i + 1 },
                          `Set rating to ${i + 1} star(s)`
                        )}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-foreground">
                    {reviewRating} / 5
                  </span>
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={tf(
                    "productPage.shareExperience",
                    undefined,
                    "Share your experience with this product (optional)"
                  )}
                  className="w-full border border-border rounded-lg p-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows={4}
                />
                <button
                  onClick={submitReview}
                  disabled={reviewSubmitting}
                  className="px-6 py-3 bg-emerald-600 text-background rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {reviewSubmitting
                    ? tf(
                        "productPage.submitting",
                        undefined,
                        "Submitting your review..."
                      )
                    : tf(
                        "productPage.submitReview",
                        undefined,
                        "Submit Review"
                      )}
                </button>
                <p className="text-xs text-muted-foreground mt-3">
                  {tf(
                    "productPage.reviewsModerated",
                    undefined,
                    "All reviews are moderated. Only verified purchases are marked as 'Verified Purchase'."
                  )}
                </p>
              </div>
            )}
            {!isAuthenticated && (
              <div className="mt-6 p-4 bg-background border border-border rounded-lg text-sm text-muted-foreground">
                {tf("productPage.pleaseLogin", undefined, "Please")}{" "}
                <Link
                  to="/login"
                  className="text-emerald-600 font-medium hover:underline"
                >
                  {tf("login", undefined, "Login")}
                </Link>{" "}
                {tf(
                  "productPage.toSubmitReview",
                  undefined,
                  "log in to submit a review."
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {showRxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background rounded-2xl p-6 w-[90%] max-w-md border-2 border-emerald-200 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black">
                {t("productPage.uploadPrescription")}
              </h3>
              <button
                onClick={() => setShowRxModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✖
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {t("productPage.acceptedFormats")}
            </p>
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={(e) => setRxFile(e.target.files?.[0] || null)}
              className="w-full border-2 border-border rounded-lg p-2"
            />
            <div className="mt-4 flex items-center gap-3">
              <button onClick={handleRxUpload} className="btn-primary">
                {t("productPage.upload")}
              </button>
              {rxUploadStatus === "uploading" && (
                <span className="text-sm text-foreground">
                  {t("productPage.uploading")}
                </span>
              )}
              {rxUploadStatus === "under-review" && (
                <span className="text-sm font-bold text-amber-600">
                  {t("productPage.underReview")}
                </span>
              )}
              {rxUploadStatus === "error" && (
                <span className="text-sm font-bold text-red-600">
                  {t("productPage.uploadFailed")}
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
            className="px-5 py-3 bg-orange-500 text-background rounded-full font-black shadow-xl hover:shadow-2xl"
          >
            {t("productPage.uploadPrescription")}
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
