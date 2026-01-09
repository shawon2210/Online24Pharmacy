import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SEOHead from "../components/common/SEOHead";
import Pagination from "../components/common/Pagination";
import {
  Squares2X2Icon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

const ensureAbsoluteImageUrl = (url) => {
  if (!url) return null;
  if (/^(https?:)?\/\//.test(url) || url.startsWith("data:")) return url;
  if (url.startsWith("/")) return `${API_URL}${url}`;
  return `${API_URL}/${url}`;
};

// Fallback image for category cards when imageUrl is missing
const FALLBACK_CATEGORY_CARD =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='240' viewBox='0 0 600 240'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%2310b981'/%3E%3Cstop offset='100%25' stop-color='%2306b6d4'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='600' height='240' fill='url(%23g)'/%3E%3C/svg%3E";

export default function CategoriesListPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");

  // Fetch categories from API
  const {
    data: categoriesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const response = await fetch(`${API_URL}/api/products/categories`);
        if (!response.ok) return [];
        const data = await response.json();
        return data.categories || [];
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
      }
    },
  });

  // Filter and sort categories
  const filteredAndSortedCategories = useMemo(() => {
    if (!categoriesData) return [];

    let filtered = categoriesData.filter(
      (category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (category.description &&
          category.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()))
    );

    // Sort categories
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "products":
          return (b.products?.length || 0) - (a.products?.length || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [categoriesData, searchQuery, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(
    filteredAndSortedCategories.length / itemsPerPage
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = filteredAndSortedCategories.slice(
    startIndex,
    endIndex
  );

  // Reset to first page when search changes
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <SEOHead
        title={t("categoriesList.seoTitle")}
        description={t("categoriesList.seoDescription")}
        url="/categories"
      />

      {/* Enhanced Header */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-lg border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumbs */}
          <nav className="mb-4" aria-label={t("breadcrumb")}>
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors"
                >
                  {t("home")}
                </Link>
              </li>
              <li className="text-slate-400 dark:text-slate-500">/</li>
              <li
                className="text-slate-900 dark:text-slate-100 font-semibold"
                aria-current="page"
              >
                {t("categories")}
              </li>
            </ol>
          </nav>

          {/* Header Content */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                {t("categoriesList.title")}
              </h1>
              <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                {t("categoriesList.subtitle")}
              </p>
            </div>

            {/* Stats Card */}
            <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 border border-emerald-200/50 dark:border-emerald-700/50 rounded-2xl shadow-sm">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-xl">
                <Squares2X2Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {filteredAndSortedCategories.length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {t("categories")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder={t("searchCategories", {
                  defaultValue: "Search categories...",
                })}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900 dark:text-slate-100"
                >
                  <option value="name">
                    {t("sortByName", { defaultValue: "Sort by Name" })}
                  </option>
                  <option value="products">
                    {t("sortByProducts", { defaultValue: "Sort by Products" })}
                  </option>
                </select>
                <AdjustmentsHorizontalIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                  aria-label="Grid view"
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          {searchQuery && (
            <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              {filteredAndSortedCategories.length === 0
                ? t("noCategoriesFound", {
                    defaultValue: "No categories found matching your search.",
                  })
                : t("showingResults", {
                    count: filteredAndSortedCategories.length,
                    query: searchQuery,
                    defaultValue: `Found ${filteredAndSortedCategories.length} categories for "${searchQuery}"`,
                  })}
            </div>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">
                {t("loadingCategories", {
                  defaultValue: "Loading categories...",
                })}
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {t("errorLoadingCategories", {
                  defaultValue: "Error loading categories",
                })}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {t("tryAgainLater", {
                  defaultValue: "Please try again later.",
                })}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1 sm:grid-cols-2"
              }`}
            >
              {currentCategories.map((category, index) => (
                <Link
                  key={category.slug}
                  to={`/categories/${category.slug}`}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-200/50 dark:border-slate-700/50 hover:border-emerald-200 dark:hover:border-emerald-700/50 overflow-hidden"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {/* Enhanced Image with Overlay */}
                  <div className="relative h-48 sm:h-52 overflow-hidden rounded-t-2xl">
                    <img
                      src={
                        ensureAbsoluteImageUrl(category.imageUrl) ||
                        FALLBACK_CATEGORY_CARD
                      }
                      alt={category.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_CATEGORY_CARD;
                      }}
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${
                        category.color ||
                        "from-emerald-500 via-cyan-500 to-blue-500"
                      } opacity-70 group-hover:opacity-50 transition-opacity duration-500`}
                    ></div>

                    {/* Enhanced Icon */}
                    <div className="absolute top-4 left-4 flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                        <span className="text-2xl">
                          {category.icon || "📦"}
                        </span>
                      </div>
                    </div>

                    {/* Product Count Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="px-3 py-1 bg-black/20 backdrop-blur-md rounded-full text-white text-sm font-semibold">
                        {category.products?.length || 0}{" "}
                        {t("products", { defaultValue: "products" })}
                      </div>
                    </div>

                    {/* Enhanced Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                      <h2 className="text-xl font-bold text-white mb-2 line-clamp-2 leading-tight">
                        {category.name}
                      </h2>
                      {category.description && (
                        <p className="text-sm text-white/90 line-clamp-2 leading-relaxed">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Action Button */}
                  <div className="p-6">
                    <div
                      className={`flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r ${
                        category.color ||
                        "from-emerald-500 via-cyan-500 to-blue-500"
                      } text-white rounded-2xl font-semibold group-hover:shadow-lg transition-all duration-300 text-sm hover:scale-105 active:scale-95 overflow-hidden relative`}
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                      <span className="relative z-10">
                        {t("exploreProducts", {
                          defaultValue: "Explore Products",
                        })}
                      </span>
                      <svg
                        className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  hasNext={currentPage < totalPages}
                  hasPrev={currentPage > 1}
                />
              </div>
            )}

            {/* Empty State */}
            {filteredAndSortedCategories.length === 0 && !isLoading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="text-slate-400 mb-4">
                    <Squares2X2Icon className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {t("noCategoriesFound", {
                      defaultValue: "No categories found",
                    })}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-md">
                    {searchQuery
                      ? t("tryDifferentSearch", {
                          defaultValue:
                            "Try adjusting your search terms or browse all categories.",
                        })
                      : t("categoriesWillAppearHere", {
                          defaultValue:
                            "Categories will appear here once they are available.",
                        })}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
