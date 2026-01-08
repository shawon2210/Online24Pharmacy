import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SEOHead from "../components/common/SEOHead";
import ProductGrid from "../components/product/ProductGrid";
import {
  normalizeProduct,
  generateSlugFromName,
} from "../utils/normalizeProduct";
import {
  FunnelIcon,
  XMarkIcon,
  CheckCircleIcon,
  FireIcon,
  ChevronDownIcon,
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
  const [filters, setFilters] = useState({
    availability: "all",
    prescriptionRequired: "all",
    priceRange: [0, 1000],
    brands: [],
    types: [],
  });

  const { data, isLoading } = useQuery({
    queryKey: ["products", slug],
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
      const response = await fetch(`${API_URL}/api/products?limit=100`, {
        method: "GET",
        headers,
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch products: ${response.status} ${response.statusText}`
        );
      }
      const result = await response.json();
      const products = (result.products || []).map(normalizeProduct);
      return products;
    },
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

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const removeFilter = (key) => {
    if (key === "brands" || key === "types") {
      setFilters((prev) => ({ ...prev, [key]: [] }));
    } else {
      setFilters((prev) => ({ ...prev, [key]: "all" }));
    }
  };

  let filteredProducts = (data || []).filter((p) => {
    if (!p) return false;
    const target = slug?.toLowerCase();

    // Resolve category and subcategory slugs/names from either string or object
    const cat = p.category;
    const sub = p.subcategory;

    const catSlug =
      typeof cat === "string"
        ? generateSlugFromName(cat)
        : cat?.slug?.toLowerCase?.() ||
          (cat?.name ? generateSlugFromName(cat.name) : "");

    const subSlug =
      typeof sub === "string"
        ? generateSlugFromName(sub)
        : sub?.slug?.toLowerCase?.() ||
          (sub?.name ? generateSlugFromName(sub.name) : "");

    const catMatches =
      !!target && (catSlug === target || catSlug.includes(target));
    const subMatches =
      !!target && (subSlug === target || subSlug.includes(target));

    const tagMatches =
      Array.isArray(p.tags) &&
      p.tags.some((tag) => tag?.toLowerCase?.().includes(target));

    const matchesCategory = catMatches || subMatches || tagMatches;

    const matchesAvailability =
      filters.availability === "all" ||
      (filters.availability === "inStock" &&
        (p.stockQuantity || p.stock || 0) > 0);
    const matchesPrescription =
      filters.prescriptionRequired === "all" ||
      (filters.prescriptionRequired === "required" && p.requiresPrescription);
    return matchesCategory && matchesAvailability && matchesPrescription;
  });

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
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50/30 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <SEOHead
        title={`${slug ? slug.replace(/[<>"']/g, "") : ""} - ${t(
          "categoryPage.title"
        )}`}
      />

      {/* Category Hero Banner with Image (with fallback) */}
      <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden bg-linear-to-r from-emerald-600 to-cyan-600">
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
            <span className="px-2 py-1 rounded-md text-xs font-semibold bg-black/40 text-white backdrop-blur-sm">
              Placeholder
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20"></div>
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
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-md">
        <div className="container mx-auto px-4 py-4">
          {/* Professional Breadcrumbs */}
          <nav className="mb-3" aria-label={t("breadcrumb")}>
            <ol className="flex items-center gap-1 text-sm text-background0">
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
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-background border-2 border-border rounded-lg px-4 py-2 pr-10 text-sm font-medium hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
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
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-emerald-600 text-background rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                aria-label={t("categoryPage.openFilters")}
              >
                <FunnelIcon className="w-5 h-5" />
                {activeFiltersCount > 0 && (
                  <span className="bg-background text-emerald-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
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
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                  {t(`categoryPage.${filters.availability}`)}
                  <button
                    onClick={() => removeFilter("availability")}
                    className="hover:bg-emerald-200 rounded-full p-0.5"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.prescriptionRequired !== "all" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {t("categoryPage.prescriptionRequired")}
                  <button
                    onClick={() => removeFilter("prescriptionRequired")}
                    className="hover:bg-blue-200 rounded-full p-0.5"
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
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
                    className="text-sm text-emerald-600 hover:underline"
                  >
                    {t("categoryPage.clearAll")}
                  </button>
                )}
              </div>

              {/* Availability */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  {t("categoryPage.availability")}
                </h3>
                {["all", "inStock", "preOrder"].map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-background p-2 rounded transition-colors"
                  >
                    <input
                      type="radio"
                      name="availability"
                      value={opt}
                      checked={filters.availability === opt}
                      onChange={(e) =>
                        handleFilterChange("availability", e.target.value)
                      }
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm capitalize">
                      {t(`categoryPage.${opt}`)}
                    </span>
                  </label>
                ))}
              </div>

              {/* Prescription */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FireIcon className="w-5 h-5 text-red-500" />
                  {t("categoryPage.prescription")}
                </h3>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-background p-2 rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.prescriptionRequired === "required"}
                    onChange={(e) =>
                      handleFilterChange(
                        "prescriptionRequired",
                        e.target.checked ? "required" : "all"
                      )
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm">
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
                className="absolute inset-0 bg-black/50"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-background shadow-2xl overflow-y-auto animate-slide-in-right">
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">
                      {t("categoryPage.filters")}
                    </h2>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="p-2 hover:bg-muted rounded-lg"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Same filters as desktop */}
                  <div>
                    <h3 className="font-semibold mb-3">
                      {t("categoryPage.availability")}
                    </h3>
                    {["all", "inStock", "preOrder"].map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-2 mb-2 p-2"
                      >
                        <input
                          type="radio"
                          name="availability"
                          value={opt}
                          checked={filters.availability === opt}
                          onChange={(e) =>
                            handleFilterChange("availability", e.target.value)
                          }
                          className="text-emerald-600"
                        />
                        <span className="text-sm capitalize">
                          {t(`categoryPage.${opt}`)}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">
                      {t("categoryPage.prescription")}
                    </h3>
                    <label className="flex items-center gap-2 p-2">
                      <input
                        type="checkbox"
                        checked={filters.prescriptionRequired === "required"}
                        onChange={(e) =>
                          handleFilterChange(
                            "prescriptionRequired",
                            e.target.checked ? "required" : "all"
                          )
                        }
                        className="rounded text-emerald-600"
                      />
                      <span className="text-sm">
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
            <div className="mb-4 text-sm text-muted-foreground">
              {isLoading
                ? t("categoryPage.loading")
                : t("categoryPage.productsFound", {
                    count: filteredProducts.length,
                  })}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-background rounded-xl shadow-md p-4 animate-pulse"
                  >
                    <div className="bg-border h-48 rounded-lg mb-4" />
                    <div className="bg-border h-4 rounded mb-2" />
                    <div className="bg-border h-4 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="transition-all duration-300">
                <ProductGrid products={filteredProducts} />
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
                  className="inline-block px-6 py-3 bg-emerald-600 text-background rounded-lg font-medium hover:bg-emerald-700 transition-colors"
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
