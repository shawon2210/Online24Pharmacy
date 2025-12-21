/**
 * Skeleton loader for ProductCard
 * Maintains same dimensions as actual card during loading
 */
export default function ProductCardSkeleton() {
  return (
    <article className="bg-white dark:bg-gray-800 dark:border-gray-700 rounded-lg border border-gray-200 overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square bg-gray-200" />

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>

        {/* Brand */}
        <div className="h-3 bg-gray-200 rounded w-1/3" />

        {/* Rating */}
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-200 rounded" />
          ))}
          <div className="h-3 bg-gray-200 rounded w-12 ml-2" />
        </div>

        {/* Price */}
        <div className="h-6 bg-gray-200 rounded w-1/2" />

        {/* Stock */}
        <div className="h-4 bg-gray-200 rounded w-1/4" />

        {/* Button */}
        <div className="h-10 bg-gray-200 rounded" />
      </div>
    </article>
  );
}
