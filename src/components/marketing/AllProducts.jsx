import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Suspense, lazy } from "react";

const ProductCarousel = lazy(() => import("../product/ProductCarousel"));

const Skeleton = () => (
  <div className="flex gap-4 justify-center py-8">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="w-48 h-64 rounded-2xl bg-border dark:bg-foreground"
      />
    ))}
  </div>
);

export default function AllProducts({ products, isLoading }) {
  return (
    <section className="w-full py-12 sm:py-16 px-4 sm:px-6 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-8 sm:mb-12 max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400">
          All Products
        </h2>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold text-sm sm:text-base"
        >
          <span>View All</span>
          <ArrowRightIcon className="w-4 sm:w-5 h-4 sm:h-5" />
        </Link>
      </div>
      <Suspense fallback={<Skeleton />}>
        {isLoading ? (
          <Skeleton />
        ) : (
          <ProductCarousel products={products?.slice(0, 8) || []} />
        )}
      </Suspense>
    </section>
  );
}
