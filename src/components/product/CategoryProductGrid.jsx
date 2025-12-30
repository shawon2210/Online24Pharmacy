import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import ProductCarousel from "./ProductCarousel";
import ProductCardSkeleton from "./ProductCardSkeleton";
import { useTranslation } from "react-i18next";

export default function CategoryProductGrid({
  products = [],
  isLoading = false,
}) {
  const { t } = useTranslation();
  const tf = (key, fallback) => {
    try {
      const res = t(key);
      if (res && res !== key) return res;
    } catch (e) {}
    return typeof fallback !== "undefined" ? fallback : key;
  };
  if (isLoading) {
    return (
      <div className="space-y-12">
        {[...Array(3)].map((_, i) => (
          <div key={i}>
            <div className="h-8 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6 auto-rows-fr">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex">
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const categories = [
    ...new Set(products.map((p) => p.category || p.categoryId)),
  ].filter(Boolean);

  return (
    <div className="space-y-12">
      {categories.map((category) => {
        const categoryProducts = products.filter(
          (p) => (p.category || p.categoryId) === category
        );

        return (
          <div key={category}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
              <Link
                to={`/categories/${category.toLowerCase()}`}
                className="text-sm font-semibold text-primary hover:underline"
              >
                {tf("homePage.viewAll", "View all")}
              </Link>
            </div>
            <ProductCarousel products={categoryProducts} />
          </div>
        );
      })}
    </div>
  );
}
