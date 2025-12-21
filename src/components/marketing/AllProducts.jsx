import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Suspense, lazy } from "react";

const ProductCarousel = lazy(() => import("../product/ProductCarousel"));

const Skeleton = () => (
  <div className="flex gap-4 justify-center py-8">
    {[...Array(4)].map((_, i) => <div key={i} className="w-48 h-64 rounded-2xl bg-gray-200 dark:bg-gray-700" />)}
  </div>
);

export default function AllProducts({ products, isLoading }) {
  return (
    <section className="w-full py-16 px-6">
      <div className="flex items-center justify-between mb-12 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">All Products</h2>
        <Link to="/products" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold text-lg">
          <span>View All</span>
          <ArrowRightIcon className="w-5 h-5" />
        </Link>
      </div>
      <Suspense fallback={<Skeleton />}>
        {isLoading ? <Skeleton /> : <ProductCarousel products={products?.slice(0, 8) || []} />}
      </Suspense>
    </section>
  );
}
