import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SEOHead from "../components/common/SEOHead";
import ProductGrid from "../components/product/ProductGrid";
import Pagination from "../components/common/Pagination";
import { normalizeProduct } from "../utils/normalizeProduct";
import {
  FunnelIcon,
  XMarkIcon,
  CheckCircleIcon,
  FireIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

const ensureAbsoluteImageUrl = (url) => {
  if (!url) return null;
  if (/^(https?:)?\/\//.test(url) || url.startsWith("data:")) return url;
  if (url.startsWith("/")) return `${API_URL}${url}`;
  return `${API_URL}/${url}`;
};

// Tiny fallback banner (SVG data URI) to keep hero consistent when no imageUrl
const FALLBACK_CATEGORY_BANNER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='400' viewBox='0 0 1600 400'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%2310b981'/%3E%3Cstop offset='100%25' stop-color='%2306b6d4'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1600' height='400' fill='url(%23g)'/%3E%3C/svg%3E";

function CategoryPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    availability: "all",
    prescriptionRequired: "all",
    priceRange: [0, 1000],
    brands: [],
    types: [],
  });

  const { data: categoryData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_URL}/api/products/categories`, {
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : data.categories || [];
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
      }
    },
  });

  const currentCategory = categoryData?.find(
    (cat) => cat.slug?.toLowerCase() === slug?.toLowerCase()
  );
  const currentCategoryName =
    currentCategory?.name ||
    (slug
      ? slug
          .replace(/[^a-zA-Z0-9\- ]/g, "")
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : "Category");
  const isFallbackHero = !currentCategory?.imageUrl;

  const { data, isLoading } = useQuery({
    queryKey: [
      "products",
      slug,
      currentCategory?.id,
      currentPage,
      sortBy,
      filters.availability,
      filters.prescriptionRequired,
    ],
    queryFn: async () => {
      if (!slug || typeof slug !== "string") throw new Error("Invalid slug");
      // Always include CSRF token if present, even for GET, for future-proofing
      const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");
      const headers = {
        Accept: "application/json",
      };
      if (csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
      }
      // Always include credentials for cookies/session-based auth
      const categoryParam = currentCategory?.id
        ? `&categoryId=${currentCategory.id}`
        : "";
      const sortParam =
        sortBy === "featured"
          ? ""
          : `&sortBy=${
              sortBy === "priceLow"
                ? "price"
                : sortBy === "priceHigh"
                ? "price"
                : "name"
            }&sortOrder=${sortBy === "priceHigh" ? "desc" : "asc"}`;
      const availabilityParam =
        filters.availability === "inStock" ? "&requiresPrescription=false" : "";
      const prescriptionParam =
        filters.prescriptionRequired === "required"
          ? "&requiresPrescription=true"
          : "";

      const response = await fetch(
        `${API_URL}/api/products?page=${currentPage}&limit=24${categoryParam}${sortParam}${availabilityParam}${prescriptionParam}`,
        {
          method: "GET",
          headers,
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch products: ${response.status} ${response.statusText}`
        );
      }
      const result = await response.json();
      return result;
    },
    enabled: !!currentCategory?.id, // Only run when we have the category
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to page 1 when filters change
  };

  const removeFilter = (key) => {
    if (key === "brands" || key === "types") {
      setFilters((prev) => ({ ...prev, [key]: [] }));
    } else {
      setFilters((prev) => ({ ...prev, [key]: "all" }));
    }
    setCurrentPage(1); // Reset to page 1 when filters change
  };

  const products = (data?.products || []).map(normalizeProduct);
  const totalProducts = data?.total || 0;
  const totalPages = data?.pages || 1;

  let filteredProducts = products;

  // Sorting
  if (sortBy === "priceLow")
    filteredProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
  if (sortBy === "priceHigh")
    filteredProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
  if (sortBy === "name")
    filteredProducts.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  const activeFiltersCount = Object.entries(filters).filter(
    ([_k, v]) =>
      (Array.isArray(v) && v.length > 0) ||
      (typeof v === "string" && v !== "all")
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <SEOHead
        title={`${slug ? slug.replace(/[<>"']/g, "") : ""} - ${t(
          "categoryPage.title"
        )}`}
      />

      {/* Category Hero Banner with Image (with fallback) */}
      <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden bg-gradient-to-r from-emerald-600 to-cyan-600">
        <img
          src={
            ensureAbsoluteImageUrl(currentCategory?.imageUrl) ||
            FALLBACK_CATEGORY_BANNER
          }
          alt={currentCategoryName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_CATEGORY_BANNER;
          }}
        />
        {isFallbackHero && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 rounded-md text-xs font-semibold bg-background/80 text-foreground dark:bg-gray-800/80 dark:text-gray-100 backdrop-blur-sm">
              {t("categoryPage.placeholderBanner")}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white capitalize">
            {currentCategoryName}
          </h1>
          {currentCategory?.description && (
            <p className="text-white/90 text-sm sm:text-base mt-2 max-w-2xl">
              {currentCategory.description}
            </p>
          )}
        </div>
      </div>

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md dark:shadow-lg">
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
              <li
                className="text-foreground font-bold capitalize cursor-default"
                aria-current="page"
              >
                {slug
                  ? slug
                      .replace(/[^a-zA-Z0-9\- ]/g, "")
                      .replace(/-/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())
                  : "Category"}
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-2xl font-black capitalize bg-linear-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              {slug ? slug.replace(/-/g, " ") : "Category"}
            </h2>
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1); // Reset to page 1 when sort changes
                  }}
                  className="appearance-none bg-background dark:bg-gray-800 border-2 border-border dark:border-gray-600 rounded-lg px-4 py-2 pr-10 text-sm font-medium hover:border-emerald-400 dark:hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all text-foreground dark:text-gray-200"
                  aria-label={t("categoryPage.sortProducts")}
                >
                  <option value="featured">{t("categoryPage.featured")}</option>
                  <option value="priceLow">{t("categoryPage.priceLow")}</option>
                  <option value="priceHigh">
                    {t("categoryPage.priceHigh")}
                  </option>
                  <option value="name">{t("categoryPage.nameAZ")}</option>
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
              </div>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white dark:text-gray-100 rounded-lg font-medium hover:bg-emerald-700 dark:hover:bg-emerald-500 transition-colors"
                aria-label={t("categoryPage.openFilters")}
              >
                <FunnelIcon className="w-5 h-5" />
                {activeFiltersCount > 0 && (
                  <span className="bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active Filters Chips */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {filters.availability !== "all" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium">
                  {t(`categoryPage.${filters.availability}`)}
                  <button
                    onClick={() => removeFilter("availability")}
                    className="hover:bg-emerald-200 dark:hover:bg-emerald-800/60 rounded-full p-0.5"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.prescriptionRequired !== "all" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  {t("categoryPage.prescriptionRequired")}
                  <button
                    onClick={() => removeFilter("prescriptionRequired")}
                    className="hover:bg-blue-200 dark:hover:bg-blue-800/60 rounded-full p-0.5"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-32 bg-background rounded-xl shadow-lg p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/70">
                <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <FunnelIcon className="w-5 h-5 text-emerald-600" />
                  {t("categoryPage.filters")}
                </h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={() =>
                      setFilters({
                        availability: "all",
                        prescriptionRequired: "all",
                        priceRange: [0, 1000],
                        brands: [],
                        types: [],
                      })
                    }
                    className="text-sm text-emerald-600 hover:text-emerald-500 hover:underline"
                  >
                    {t("categoryPage.clearAll")}
                  </button>
                )}
              </div>

              {/* Availability */}
              <div className="pb-4 border-b border-border/70">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  {t("categoryPage.availability")}
                </h3>
                {["all", "inStock", "preOrder"].map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-muted p-2 rounded transition-colors"
                  >
                    <input
                      type="radio"
                      name="availability"
                      value={opt}
                      checked={filters.availability === opt}
                      onChange={(e) =>
                        handleFilterChange("availability", e.target.value)
                      }
                      className="text-emerald-600 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm capitalize text-foreground">
                      {t(`categoryPage.${opt}`)}
                    </span>
                  </label>
                ))}
              </div>

              {/* Prescription */}
              <div className="pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                  <FireIcon className="w-5 h-5 text-red-500" />
                  {t("categoryPage.prescription")}
                </h3>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.prescriptionRequired === "required"}
                    onChange={(e) =>
                      handleFilterChange(
                        "prescriptionRequired",
                        e.target.checked ? "required" : "all"
                      )
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-foreground">
                    {t("categoryPage.prescriptionRequiredOnly")}
                  </span>
                </label>
              </div>
            </div>
          </aside>

          {/* Mobile Filters Drawer */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/50 dark:bg-black/70"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-background dark:bg-gray-800 shadow-2xl overflow-y-auto animate-slide-in-right">
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/70">
                    <h2 className="text-xl font-bold text-foreground">
                      {t("categoryPage.filters")}
                    </h2>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="p-2 hover:bg-muted rounded-lg text-foreground"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Same filters as desktop */}
                  <div className="pb-4 border-b border-border/70">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      {t("categoryPage.availability")}
                    </h3>
                    {["all", "inStock", "preOrder"].map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-muted p-2 rounded transition-colors"
                      >
                        <input
                          type="radio"
                          name="availability"
                          value={opt}
                          checked={filters.availability === opt}
                          onChange={(e) =>
                            handleFilterChange("availability", e.target.value)
                          }
                          className="text-emerald-600 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm capitalize text-foreground">
                          {t(`categoryPage.${opt}`)}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="pt-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                      <FireIcon className="w-5 h-5 text-red-500" />
                      {t("categoryPage.prescription")}
                    </h3>
                    <label className="flex items-center gap-2 p-2 cursor-pointer hover:bg-muted rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={filters.prescriptionRequired === "required"}
                        onChange={(e) =>
                          handleFilterChange(
                            "prescriptionRequired",
                            e.target.checked ? "required" : "all"
                          )
                        }
                        className="rounded text-emerald-600 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm text-foreground">
                        {t("categoryPage.prescriptionRequiredOnly")}
                      </span>
                    </label>
                  </div>

                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="w-full py-3 bg-emerald-600 text-background rounded-lg font-bold hover:bg-emerald-700 transition-colors"
                  >
                    {t("categoryPage.applyFilters")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <main className="flex-1">
            <div className="mb-4 text-sm text-muted-foreground dark:text-gray-400">
              {isLoading
                ? t("categoryPage.loading")
                : t("categoryPage.productsFound", {
                    count: totalProducts,
                  })}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-background dark:bg-gray-800 rounded-xl shadow-md p-4 animate-pulse"
                  >
                    <div className="bg-border dark:bg-gray-700 h-48 rounded-lg mb-4" />
                    <div className="bg-border dark:bg-gray-700 h-4 rounded mb-2" />
                    <div className="bg-border dark:bg-gray-700 h-4 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="transition-all duration-300">
                <ProductGrid products={filteredProducts} />

                {/* Modern Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    hasNext={currentPage < totalPages}
                    hasPrev={currentPage > 1}
                  />
                )}

                {/* Page Info */}
                {totalPages > 1 && (
                  <div className="mt-4 text-center text-sm text-muted-foreground dark:text-gray-400">
                    Page {currentPage} of {totalPages} ({totalProducts} total
                    products)
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {t("categoryPage.noProductsFound")}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t("categoryPage.tryAdjusting")}
                </p>
                <Link
                  to="/categories"
                  className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                >
                  {t("categoryPage.browseAllCategories")}
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
      `}</style>
    </div>
  );
}

export default CategoryPage;
