import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import ProductCard from "./ProductCard";
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

const CategoryProductSection = memo(({ category, index }) => {
  const { t } = useTranslation();

  if (!category || !category.products || category.products.length === 0) {
    return null;
  }

  // Alternate background color for visual separation
  const bgClass =
    index % 2 === 0
      ? "bg-background dark:bg-background"
      : "bg-card dark:bg-card";

  return (
    <section
      className={`w-full py-6 sm:py-8 md:py-10 lg:py-12 xl:py-14 ${bgClass} border-b border-border dark:border-border`}
    >
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10">
        {/* Category Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-5 md:mb-6 lg:mb-8 gap-2 sm:gap-3 md:gap-4">
          <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
            {category.imageUrl && (
              <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-full overflow-hidden bg-linear-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 border-2 sm:border-[3px] border-emerald-200 dark:border-emerald-700 shadow-sm">
                <img
                  src={ensureAbsoluteImageUrl(category.imageUrl)}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-emerald-600 dark:text-emerald-400 line-clamp-2 leading-tight">
                {category.name}
              </h2>
              {category.description && (
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground dark:text-muted-foreground mt-0.5 sm:mt-1 line-clamp-1 leading-snug">
                  {category.description}
                </p>
              )}
            </div>
          </div>

          <Link
            to={`/categories/${category.slug}`}
            className="hidden sm:inline-flex group items-center gap-1 md:gap-1.5 lg:gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold transition-all duration-200 whitespace-nowrap text-xs md:text-sm lg:text-base px-3 md:px-4 py-1.5 md:py-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          >
            <span>{t("viewAll", { defaultValue: "View All" })}</span>
            <ArrowRightIcon className="w-3 md:w-3.5 lg:w-4 h-3 md:h-3.5 lg:h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 xs:gap-2.5 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6">
          {category.products.map((product) => (
            <ProductCard key={product.id} product={product} size="xs" />
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="flex justify-center mt-4 sm:hidden">
          <Link
            to={`/categories/${category.slug}`}
            className="group inline-flex items-center gap-2 bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 text-xs active:scale-95"
          >
            <span>
              {t("viewAllInCategory", {
                category: category.name,
                defaultValue: `View All ${category.name}`,
              })}
            </span>
            <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
        </div>
      </div>
    </section>
  );
});

CategoryProductSection.displayName = "CategoryProductSection";

export default CategoryProductSection;
