import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SEOHead from "../components/common/SEOHead";
import { Squares2X2Icon } from "@heroicons/react/24/outline";
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

  // Fetch categories from API
  const { data: categoriesData } = useQuery({
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

  // Use only API categories
  const displayCategories = categoriesData || [];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <SEOHead
        title={t("categoriesList.seoTitle")}
        description={t("categoriesList.seoDescription")}
        url="/categories"
      />

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-md border-b border-border">
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
                {t("categories")}
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-black bg-linear-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                {t("categoriesList.title")}
              </h1>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                {t("categoriesList.subtitle")}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-linear-to-r from-emerald-100 to-cyan-100 border-2 border-emerald-200 text-foreground rounded-full text-sm font-bold">
              <Squares2X2Icon className="w-5 h-5" />
              <span>
                {displayCategories.length} {t("categories")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {displayCategories.map((category) => (
            <Link
              key={category.slug}
              to={`/categories/${category.slug}`}
              className="group relative bg-background rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-border dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-700 overflow-hidden"
            >
              {/* Image with Overlay */}
              <div className="relative h-32 sm:h-36 overflow-hidden">
                <img
                  src={
                    ensureAbsoluteImageUrl(category.imageUrl) ||
                    FALLBACK_CATEGORY_CARD
                  }
                  alt={category.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_CATEGORY_CARD;
                  }}
                />
                <div
                  className={`absolute inset-0 bg-linear-to-t ${
                    category.color || "from-emerald-500 to-blue-500"
                  } opacity-60 group-hover:opacity-40 transition-opacity`}
                ></div>

                {/* Icon */}
                <div className="absolute top-4 left-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-xl">{category.icon || "📦"}</span>
                  </div>
                </div>

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/60 to-transparent">
                  <h2 className="text-xl font-bold text-white mb-1">
                    {category.name}
                  </h2>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-3">
                <div
                  className={`flex items-center justify-center gap-2 py-3 bg-linear-to-r ${
                    category.color || "from-emerald-500 to-blue-500"
                  } text-white rounded-xl font-semibold group-hover:shadow-lg transition-all text-sm`}
                >
                  <span>
                    {t("exploreProducts", { defaultValue: "Explore Products" })}
                  </span>
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
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
      </div>
    </div>
  );
}
