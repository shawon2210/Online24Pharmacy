// Utility to normalize raw product objects into a consistent structure
// Ensures presence of slug, images array, stockQuantity, and essential flags
// Future products added to JSON or database will automatically gain required fields

export function generateSlugFromName(name) {
  return name
    ? name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
    : `product-${Date.now()}`;
}

export function normalizeProduct(raw = {}) {
  const slug = raw.slug || raw.id || generateSlugFromName(raw.name);
  const images = Array.isArray(raw.images)
    ? raw.images
    : raw.image
    ? [raw.image]
    : [];

  return {
    id: raw.id || slug,
    slug,
    name: raw.name || 'Unnamed Product',
    description: raw.description || raw.shortDescription || '',
    shortDescription: raw.shortDescription || '',
    sku: raw.sku || '',
    category: raw.category || raw.categoryId || raw.categoryName || '',
    categoryId: raw.categoryId || raw.category || '',
    brand: raw.brand || '',
    manufacturer: raw.manufacturer || '',
    price: raw.price ?? 0,
    discountPrice: raw.discountPrice || null,
    requiresPrescription: !!raw.requiresPrescription,
    isOtc: !!raw.isOtc,
    strength: raw.strength || '',
    dosageForm: raw.dosageForm || '',
    packSize: raw.packSize || '',
    genericName: raw.genericName || raw.generic || '',
    stockQuantity: raw.stockQuantity ?? raw.stock ?? 0,
    minStockLevel: raw.minStockLevel || 0,
    maxOrderQuantity: raw.maxOrderQuantity || 0,
    isActive: raw.isActive !== false,
    images,
    rating: typeof raw.rating === 'number' ? raw.rating : 0,
    reviewCount: raw.reviewCount || 0,
    // Preserve any additional fields
    ...raw,
  };
}
