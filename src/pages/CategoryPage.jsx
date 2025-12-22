import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SEOHead from "../components/common/SEOHead";
import ProductGrid from "../components/product/ProductGrid";
import { FunnelIcon, XMarkIcon, CheckCircleIcon, FireIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

function CategoryPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [filters, setFilters] = useState({
    availability: "all",
    prescriptionRequired: "all",
    priceRange: [0, 1000],
    brands: [],
    types: [],
  });

  const { data, isLoading } = useQuery({
    queryKey: ["products", slug],
    queryFn: async () => {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${API_URL}/api/products?limit=100`);
      const result = await response.json();
      return result.products || [];
    },
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const removeFilter = (key) => {
    if (key === "brands" || key === "types") {
      setFilters((prev) => ({ ...prev, [key]: [] }));
    } else {
      setFilters((prev) => ({ ...prev, [key]: "all" }));
    }
  };

  let filteredProducts = (data || []).filter((p) => {
    const matchesCategory =
      p.category?.toLowerCase().includes(slug?.toLowerCase()) ||
      p.tags?.some((tag) => tag.toLowerCase().includes(slug?.toLowerCase()));
    const matchesAvailability =
      filters.availability === "all" ||
      (filters.availability === "inStock" && p.stock > 0);
    const matchesPrescription =
      filters.prescriptionRequired === "all" ||
      (filters.prescriptionRequired === "required" && p.prescriptionRequired);
    return matchesCategory && matchesAvailability && matchesPrescription;
  });

  // Sorting
  if (sortBy === "priceLow")
    filteredProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
  if (sortBy === "priceHigh")
    filteredProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
  if (sortBy === "name")
    filteredProducts.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  const activeFiltersCount = Object.entries(filters).filter(
    ([k, v]) =>
      (Array.isArray(v) && v.length > 0) ||
      (typeof v === "string" && v !== "all")
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <SEOHead title={`${slug} - ${t("categoryPage.title")}`} />

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-md">
        <div className="container mx-auto px-4 py-4">
          {/* Professional Breadcrumbs */}
          <nav className="mb-3" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 text-sm text-gray-500">
              <li>
                <Link to="/" className="hover:text-emerald-600 font-medium">
                  Home
                </Link>
              </li>
              <li className="px-1 text-gray-400">/</li>
              <li>
                <Link
                  to="/categories"
                  className="hover:text-emerald-600 font-medium"
                >
                  Categories
                </Link>
              </li>
              <li className="px-1 text-gray-400">/</li>
              <li
                className="text-gray-900 font-bold capitalize cursor-default"
                aria-current="page"
              >
                {slug
                  ? slug
                      .replace(/-/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())
                  : ""}
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-black capitalize bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              {slug?.replace("-", " ")}
            </h1>
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border-2 border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  aria-label="Sort products"
                >
                  <option value="featured">Featured</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
              </div>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                aria-label="Open filters"
              >
                <FunnelIcon className="w-5 h-5" />
                {activeFiltersCount > 0 && (
                  <span className="bg-white text-emerald-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active Filters Chips */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {filters.availability !== "all" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                  {filters.availability}
                  <button
                    onClick={() => removeFilter("availability")}
                    className="hover:bg-emerald-200 rounded-full p-0.5"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.prescriptionRequired !== "all" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  Prescription Required
                  <button
                    onClick={() => removeFilter("prescriptionRequired")}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-32 bg-white rounded-xl shadow-lg p-6 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FunnelIcon className="w-5 h-5 text-emerald-600" />
                  Filters
                </h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={() =>
                      setFilters({
                        availability: "all",
                        prescriptionRequired: "all",
                        priceRange: [0, 1000],
                        brands: [],
                        types: [],
                      })
                    }
                    className="text-sm text-emerald-600 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Availability */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  Availability
                </h3>
                {["all", "inStock", "preOrder"].map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                  >
                    <input
                      type="radio"
                      name="availability"
                      value={opt}
                      checked={filters.availability === opt}
                      onChange={(e) =>
                        handleFilterChange("availability", e.target.value)
                      }
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm capitalize">
                      {opt.replace(/([A-Z])/g, " $1")}
                    </span>
                  </label>
                ))}
              </div>

              {/* Prescription */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FireIcon className="w-5 h-5 text-red-500" />
                  Prescription
                </h3>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.prescriptionRequired === "required"}
                    onChange={(e) =>
                      handleFilterChange(
                        "prescriptionRequired",
                        e.target.checked ? "required" : "all"
                      )
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm">Prescription Required Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Mobile Filters Drawer */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white shadow-2xl overflow-y-auto animate-slide-in-right">
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Filters</h2>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Same filters as desktop */}
                  <div>
                    <h3 className="font-semibold mb-3">Availability</h3>
                    {["all", "inStock", "preOrder"].map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-2 mb-2 p-2"
                      >
                        <input
                          type="radio"
                          name="availability"
                          value={opt}
                          checked={filters.availability === opt}
                          onChange={(e) =>
                            handleFilterChange("availability", e.target.value)
                          }
                          className="text-emerald-600"
                        />
                        <span className="text-sm capitalize">
                          {opt.replace(/([A-Z])/g, " $1")}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Prescription</h3>
                    <label className="flex items-center gap-2 p-2">
                      <input
                        type="checkbox"
                        checked={filters.prescriptionRequired === "required"}
                        onChange={(e) =>
                          handleFilterChange(
                            "prescriptionRequired",
                            e.target.checked ? "required" : "all"
                          )
                        }
                        className="rounded text-emerald-600"
                      />
                      <span className="text-sm">
                        Prescription Required Only
                      </span>
                    </label>
                  </div>

                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="w-full py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <main className="flex-1">
            <div className="mb-4 text-sm text-gray-600">
              {isLoading
                ? "Loading..."
                : `${filteredProducts.length} products found`}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-md p-4 animate-pulse"
                  >
                    <div className="bg-gray-200 h-48 rounded-lg mb-4" />
                    <div className="bg-gray-200 h-4 rounded mb-2" />
                    <div className="bg-gray-200 h-4 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="transition-all duration-300">
                <ProductGrid products={filteredProducts} />
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or browse other categories
                </p>
                <Link
                  to="/categories"
                  className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                >
                  Browse All Categories
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
      `}</style>
    </div>
  );
}

export default CategoryPage;
