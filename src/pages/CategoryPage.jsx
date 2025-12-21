/* eslint-disable no-unused-vars */
import { useState, useEffect, useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SEOHead from "../components/common/SEOHead";
import ProductGrid from "../components/product/ProductGrid";
import { fetchProducts } from "../utils/api";
import { normalizeProduct } from "../utils/normalizeProduct";
import {
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";

const productTypes = [
  { value: "Surgical Instruments", key: "surgicalInstruments" },
  { value: "PPE Equipment", key: "ppeEquipment" },
  { value: "Wound Care", key: "woundCare" },
  { value: "Diagnostics", key: "diagnostics" },
  { value: "Hospital Supplies", key: "hospitalSupplies" },
];

const brands = [
  "Medline",
  "3M Healthcare",
  "Johnson & Johnson",
  "BD Medical",
  "Covidien",
];

export default function CategoryPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [headerOffset, setHeaderOffset] = useState(0);
  const [filters, setFilters] = useState({
    productType: [],
    priceRange: [0, 50000],
    brand: [],
    availability: "all",
    prescriptionRequired: "all",
  });
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", { category: slug, ...filters, sortBy }],
    queryFn: async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const response = await fetch(`${API_URL}/api/products`);
        const data = await response.json();
        return {
          products: data.products.map((p) => normalizeProduct(p)),
          pagination: { total: data.products.length, pages: 1, page: 1 },
        };
      } catch (error) {
        return { products: [], pagination: { total: 0, pages: 0, page: 1 } };
      }
    },
  });

  // Compute header height dynamically
  useLayoutEffect(() => {
    const el = document.querySelector("header");
    if (!el) return;
    const compute = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      setHeaderOffset(h);
    };
    compute();
    window.addEventListener("resize", compute, { passive: true });
    return () => window.removeEventListener("resize", compute);
  }, []);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      productType: [],
      priceRange: [0, 5000],
      brand: [],
      availability: "all",
      prescriptionRequired: "all",
    });
  };

  const formattedSlug = slug?.replace(/-/g, " ") || "";
  const slugKeyMap = {
    "wound-care": "woundCare",
    "hospital-supplies": "hospitalSupplies",
    diagnostics: "diagnostics",
    surgical: "surgical",
    medicines: "medicines",
    ppe: "ppe",
  };
  const i18nKey = slug ? slugKeyMap[slug] || slug : "";
  // Get category label from the categories object
  const categoryLabel =
    slug && i18nKey ? t(`categories.${i18nKey}`) : formattedSlug;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-white via-emerald-50/20 to-cyan-50/20 pb-8 sm:pb-12 md:pb-16 lg:pb-20 relative overflow-hidden"
      style={{ paddingTop: `${headerOffset}px` }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div
        className={`w-full h-full ${
          fullScreen ? "px-0" : "px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12"
        }`}
      >
        {/* Breadcrumbs */}
        <nav className="mb-6 sm:mb-8 md:mb-10 lg:mb-12 pt-4 sm:pt-6 md:pt-8 lg:pt-10">
          <ol className="flex items-center space-x-2 text-sm sm:text-base text-gray-600 font-medium">
            <li>
              <a
                href="/"
                className="hover:text-emerald-600 transition-colors duration-300"
              >
                {t("home")}
              </a>
            </li>
            <li className="text-gray-400">›</li>
            <li>
              <a
                href="/categories"
                className="hover:text-emerald-600 transition-colors duration-300"
              >
                {t("nav.categories")}
              </a>
            </li>
            <li className="text-gray-400">›</li>
            <li className="text-emerald-600 font-bold capitalize">
              {categoryLabel}
            </li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12">
          {/* Filters Sidebar */}
          <div
            className={`w-full lg:w-64 xl:w-72 flex-shrink-0 ${
              fullScreen ? "hidden" : ""
            }`}
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 sticky top-20 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">🔍</span>
                  <span>{t("categoryPage.filters.title")}</span>
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors duration-300 px-2 py-1 rounded-lg hover:bg-emerald-50"
                >
                  {t("categoryPage.filters.clearAll")}
                </button>
              </div>

              {/* Product Type */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  {t("categoryPage.filters.productType")}
                </h4>
                <div className="space-y-2">
                  {productTypes.map((type) => (
                    <label key={type.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.productType.includes(type.value)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...filters.productType, type.value]
                            : filters.productType.filter(
                                (t) => t !== type.value
                              );
                          handleFilterChange("productType", newTypes);
                        }}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {t(
                          `categoryPage.filters.productTypeOptions.${type.key}`
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  {t("categoryPage.filters.priceRange")}
                </h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    value={filters.priceRange[1]}
                    onChange={(e) =>
                      handleFilterChange("priceRange", [
                        0,
                        parseInt(e.target.value),
                      ])
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>৳0</span>
                    <span>৳{filters.priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Brand */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  {t("categoryPage.filters.brand")}
                </h4>
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <label key={brand} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.brand.includes(brand)}
                        onChange={(e) => {
                          const newBrands = e.target.checked
                            ? [...filters.brand, brand]
                            : filters.brand.filter((b) => b !== brand);
                          handleFilterChange("brand", newBrands);
                        }}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {brand}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  {t("categoryPage.filters.availability")}
                </h4>
                <div className="space-y-2">
                  {[
                    {
                      value: "all",
                      label: t("categoryPage.filters.availabilityOptions.all"),
                    },
                    {
                      value: "inStock",
                      label: t(
                        "categoryPage.filters.availabilityOptions.inStock"
                      ),
                    },
                    {
                      value: "preOrder",
                      label: t(
                        "categoryPage.filters.availabilityOptions.preOrder"
                      ),
                    },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="availability"
                        value={option.value}
                        checked={filters.availability === option.value}
                        onChange={(e) =>
                          handleFilterChange("availability", e.target.value)
                        }
                        className="border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Prescription Required */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  {t("categoryPage.filters.prescription")}
                </h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.prescriptionRequired === "required"}
                    onChange={(e) =>
                      handleFilterChange(
                        "prescriptionRequired",
                        e.target.checked ? "required" : "all"
                      )
                    }
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {t("categoryPage.filters.prescriptionOnly")}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 w-full">
            {/* Sort & Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
              <div className="animate-fade-in-up">
                <h1 className="font-black bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent capitalize mb-1 text-lg sm:text-2xl md:text-3xl">
                  {t("categoryPage.title", { category: categoryLabel })}
                </h1>
                <p className="text-gray-600 text-lg font-medium flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-emerald-100 to-cyan-100 border-2 border-emerald-200 rounded-full text-emerald-700 font-bold text-sm">
                    {t("categoryPage.resultsFound", {
                      count: productsData?.pagination?.total || 0,
                    })}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFullScreen(!fullScreen)}
                  className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors duration-300 px-2 py-1 rounded-lg hover:bg-emerald-50"
                  title={fullScreen ? "Exit full screen" : "Enter full screen"}
                >
                  <ArrowsPointingOutIcon className="w-5 h-5" />
                </button>
                <label className="text-sm font-bold text-gray-700">
                  {t("categoryPage.sort.label")}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-300 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                >
                  <option value="newest">
                    {t("categoryPage.sort.options.newest")}
                  </option>
                  <option value="price-low">
                    {t("categoryPage.sort.options.priceLow")}
                  </option>
                  <option value="price-high">
                    {t("categoryPage.sort.options.priceHigh")}
                  </option>
                  <option value="rating">
                    {t("categoryPage.sort.options.rating")}
                  </option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <ProductGrid
              products={productsData?.products}
              isLoading={isLoading}
              skeletonCount={12}
            />

            {!isLoading && (
              <>
                {/* Pagination */}
                {productsData?.pagination?.pages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="flex items-center space-x-2">
                      {[...Array(productsData.pagination.pages)].map((_, i) => (
                        <button
                          key={i}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            i + 1 === productsData.pagination.page
                              ? "bg-emerald-600 text-white"
                              : "bg-white text-gray-700 border border-gray-300 hover:bg-emerald-50"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
