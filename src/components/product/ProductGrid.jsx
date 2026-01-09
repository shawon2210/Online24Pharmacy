import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";

/**
 * Professional Product Grid Component for Online24-Pharmacy
 * Responsive grid layout with auto-fit columns
 * Mobile-first design with proper spacing and accessibility
 */
export default function ProductGrid({
  products = [],
  isLoading = false,
  skeletonCount = 8,
  onQuickView,
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        {[...Array(skeletonCount)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <svg
          className="w-24 h-24 text-muted mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <h3 className="text-lg font-medium text-foreground mb-2">
          No products found
        </h3>
        <p className="text-background0 text-center max-w-md">
          We couldn't find any products matching your criteria. Try adjusting
          your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6">
      {products.map((product, _index) => (
        <div key={product.id || product.slug} className="relative group">
          <ProductCard product={product} size="carousel" />
          {onQuickView && (
            <button
              className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-full p-2 shadow hover:bg-emerald-600 hover:text-background"
              onClick={(e) => {
                e.preventDefault();
                onQuickView(product);
              }}
              aria-label="Quick view"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z"
                />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
