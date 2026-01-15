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

  // Handler for search input change
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1); // Optionally reset to first page on search
  };

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

  // Calculate total pages for pagination
  const totalPages =
    Math.ceil(filteredAndSortedCategories.length / itemsPerPage) || 1;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("categoriesList.seoTitle")}
        description={t("categoriesList.seoDescription")}
        url="/categories"
      />

      {/* Sticky Header (matches Build-a-Kit layout) */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md shadow-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <nav className="mb-3" aria-label={t("breadcrumb")}>
            <ol className="flex items-center gap-1 text-sm text-foreground">
              <li>
                <Link to="/" className="hover:text-primary font-medium">
                  {t("home")}
                </Link>
              </li>
              <li className="px-1 text-muted-foreground">/</li>
              <li className="text-foreground font-bold" aria-current="page">
                {t("categories")}
              </li>
            </ol>
          </nav>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-primary mb-1">
                {t("categoriesList.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("categoriesList.subtitle")}
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/10 border-2 border-primary/30 text-primary rounded-full text-sm font-bold shrink-0">
              <Squares2X2Icon className="w-5 h-5" />
              <span>
                {filteredAndSortedCategories.length} {t("categories")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search + Controls */}
        <div className="bg-card rounded-xl shadow-lg border border-border p-4 sm:p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Squares2X2Icon className="w-5 h-5 text-primary" />
              {t("categoriesList.title")}
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-xs">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("searchCategories", {
                    defaultValue: "Search categories...",
                  })}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-background border border-border rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-foreground"
                >
                  <option value="name">
                    {t("sortByName", { defaultValue: "Sort by Name" })}
                  </option>
                  <option value="products">
                    {t("sortByProducts", { defaultValue: "Sort by Products" })}
                  </option>
                </select>
                <AdjustmentsHorizontalIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors border border-border ${
                  viewMode === "grid"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-foreground hover:bg-primary/10 hover:text-primary"
                }`}
                aria-label="Grid view"
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {searchQuery && (
            <div className="mt-2 text-sm text-muted-foreground">
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

        {/* Categories Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                {t("loadingCategories", {
                  defaultValue: "Loading categories...",
                })}
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-violet-600 mb-4">
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
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t("errorLoadingCategories", {
                  defaultValue: "Error loading categories",
                })}
              </h3>
              <p className="text-muted-foreground">
                {t("tryAgainLater", {
                  defaultValue: "Please try again later.",
                })}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div
              className={`grid gap-4 ${
                viewMode === "grid"
                  ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                  : "grid-cols-1 sm:grid-cols-2"
              } mt-6`}
            >
              {filteredAndSortedCategories.map((category, index) => (
                <Link
                  key={category.slug}
                  to={`/categories/${category.slug}`}
                  className="block"
                  style={{ animationDelay: `${index * 50}ms` }}
                  tabIndex={0}
                >
                  <div className="relative overflow-hidden w-60 h-80 rounded-3xl cursor-pointer bg-violet-200 mx-auto my-2 flex flex-col justify-end">
                    <div className="z-10 absolute w-full h-full peer" />
                    <div className="absolute peer-hover:-top-20 peer-hover:-left-16 peer-hover:w-[140%] peer-hover:h-[140%] -top-32 -left-16 w-32 h-44 rounded-full bg-violet-950 transition-all duration-500" />
                    <div className="absolute flex flex-col items-center justify-center text-center peer-hover:right-0 peer-hover:rounded-b-none peer-hover:bottom-0 peer-hover:items-center peer-hover:justify-center peer-hover:w-full peer-hover:h-full -bottom-32 -right-16 w-36 h-44 rounded-full bg-violet-300 transition-all duration-500 p-2">
                      <span className="text-2xl md:text-3xl lg:text-4xl mb-2">
                        {category.icon || "📦"}
                      </span>
                      <span className="block w-full font-bold text-base md:text-lg lg:text-xl text-gray-950 truncate">
                        {category.name}
                      </span>
                      {category.description && (
                        <span className="block w-full text-xs md:text-sm lg:text-base text-gray-950 text-center line-clamp-2 mt-1">
                          {category.description}
                        </span>
                      )}
                    </div>
                    <div className="w-full flex-1 flex flex-col items-center justify-center px-3 pb-4">
                      <span className="block font-bold text-lg md:text-xl lg:text-2xl text-gray-950 text-center mb-1 truncate">
                        {category.name}
                      </span>
                      {category.description && (
                        <span className="block text-xs md:text-sm lg:text-base text-gray-950 text-center line-clamp-2">
                          {category.description}
                        </span>
                      )}
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
                  onPageChange={setCurrentPage}
                  hasNext={currentPage < totalPages}
                  hasPrev={currentPage > 1}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
