/**
 * Standardized product image placeholder (base64 SVG) - 64x64 size
 */
export const PRODUCT_IMAGE_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAzMkwzMiA0OEgzVjUySDM4TDMyIDMyWiIgZmlsbD0iIzlDQTNBMiIvPgo8cGF0aCBkPSJNMzIgMzJIMzhWNTJIMzhMMzIgMzJ6IiBmaWxsPSIjOUNBM0EyIi8+Cjx0ZXh0IHg9IjMyIiB5PSIzOCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNjM2NkYxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+";

/**
 * Standardized small placeholder for order list items - 28x28 size
 */
export const SMALL_PRODUCT_IMAGE_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI4IiBoZWlnaHQ9IjI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNCAxNEwxNCAyMEgyMFYyMEgyMEwxNCAxNFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTE0IDE0SDE5VjIwSDE5TDE0IDE0eiIgZmlsbD0iIzlDQTNBMiIvPgo8dGV4dCB4PSIxNCIgeT0iMTciIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI2IiBmaWxsPSIjNjM2NkYxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+";

/**
 * Get the primary image URL from a product's images array
 * @param {string|string[]|null|undefined} images - Product images
 * @param {boolean} useSmallPlaceholder - Use smaller placeholder for compact displays
 * @returns {string} Image URL or placeholder
 */
export function getProductImage(images, useSmallPlaceholder = false) {
  const placeholder = useSmallPlaceholder
    ? SMALL_PRODUCT_IMAGE_PLACEHOLDER
    : PRODUCT_IMAGE_PLACEHOLDER;

  if (!images) return placeholder;
  if (Array.isArray(images) && images.length > 0) return images[0];
  if (Array.isArray(images) && images.length === 0) return placeholder;
  if (typeof images === "string") return images;

  return placeholder;
}

