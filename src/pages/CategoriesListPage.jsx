import { Link } from "react-router-dom";
import { useLayoutEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import SEOHead from "../components/common/SEOHead";

const categories = [
  {
    name: "Medicines & Tablets",
    slug: "medicines",
    icon: "💊",
    image:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=400&fit=crop&q=80",
    color: "from-emerald-500 to-teal-600",
    count: "2500+",
    subcategories: ["Pain Relief", "Antibiotics", "Vitamins", "Fever & Cold"],
  },
  {
    name: "Surgical Equipment",
    slug: "surgical",
    icon: "🔪",
    image:
      "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&h=400&fit=crop&q=80",
    color: "from-blue-500 to-cyan-600",
    count: "800+",
    subcategories: ["Surgical Instruments", "Gloves", "Masks", "Syringes"],
  },
  {
    name: "Wound Care",
    slug: "wound-care",
    icon: "🩹",
    image:
      "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600&h=400&fit=crop&q=80",
    color: "from-purple-500 to-pink-600",
    count: "350+",
    subcategories: ["Bandages", "Gauze", "Antiseptics", "Dressings"],
  },
  {
    name: "Diagnostics & Testing",
    slug: "diagnostics",
    icon: "🔬",
    image:
      "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=600&h=400&fit=crop&q=80",
    color: "from-orange-500 to-red-600",
    count: "200+",
    subcategories: [
      "Blood Tests",
      "Glucose Monitors",
      "Thermometers",
      "Test Kits",
    ],
  },
  {
    name: "Hospital Supplies",
    slug: "hospital",
    icon: "🏥",
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop&q=80",
    color: "from-pink-500 to-rose-600",
    count: "600+",
    subcategories: ["IV Sets", "Catheters", "Medical Beds", "Oxygen Equipment"],
  },
  {
    name: "PPE & Safety",
    slug: "ppe",
    icon: "🦺",
    image:
      "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=600&h=400&fit=crop&q=80",
    color: "from-indigo-500 to-blue-600",
    count: "150+",
    subcategories: ["Face Masks", "Gloves", "Gowns", "Face Shields"],
  },
];

export default function CategoriesListPage() {
  const { t } = useTranslation();
  const [headerOffset, setHeaderOffset] = useState(0);

  // Fetch all products to get dynamic counts
  const { data: productsData } = useQuery({
    queryKey: ["products", { limit: 500 }],
    queryFn: async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const response = await fetch(`${API_URL}/api/products?limit=500`);
        const data = await response.json();
        return { products: data.products || [] };
      } catch (error) {
        console.error("Failed to fetch products:", error);
        return { products: [] };
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

  return (
    <main role="main" aria-labelledby="categories-heading">
      <SEOHead
        title={t("categoriesListPage.seoTitle")}
        description={t("categoriesListPage.seoDescription")}
        url="/categories"
      />

      <div
        className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 pb-12 sm:pb-16 lg:pb-20"
        style={{
          marginTop: `-${headerOffset}px`,
          paddingTop: `${headerOffset}px`,
        }}
      >
        <div className="w-full h-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
          {/* Breadcrumb */}
          <nav
            className="mb-8 sm:mb-10 md:mb-12 lg:mb-14 pt-6 sm:pt-8 md:pt-10 lg:pt-12"
            aria-label="Breadcrumb"
          >
            <ol className="flex items-center gap-2 text-xs sm:text-sm">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 hover:text-emerald-600 transition-colors font-medium duration-200"
                >
                  {t("home")}
                </Link>
              </li>
              <li className="text-gray-400">›</li>
              <li className="text-gray-900 font-bold">{t("categories")}</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="text-center mb-10 sm:mb-14 md:mb-16 lg:mb-20 motion-safe:animate-fade-in\">
            <div className="inline-block mb-3 sm:mb-4">
              <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-100 to-cyan-100 border-2 border-emerald-200 text-emerald-700 rounded-full text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-shadow duration-300">
                <span className="text-lg sm:text-xl">🏪</span>
                <span>{t("categoriesListPage.subtitle")}</span>
              </span>
            </div>
            <h1
              id="categories-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mb-2 sm:mb-3 leading-tight"
            >
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                {t("categoriesListPage.title")}
              </span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              {t("categoriesListPage.description")}
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8 py-10 sm:py-12 md:py-14 lg:py-18 xl:py-20">
            {categories.map((category, index) => {
              // Count products in this category
              const categoryProducts =
                productsData?.products?.filter(
                  (p) =>
                    p.category
                      ?.toLowerCase()
                      .includes(category.slug.toLowerCase()) ||
                    p.category
                      ?.toLowerCase()
                      .includes(category.name.toLowerCase()) ||
                    p.tags?.some((tag) =>
                      tag.toLowerCase().includes(category.slug.toLowerCase())
                    )
                ) || [];
              const productCount = categoryProducts.length || category.count;

              return (
                <div
                  key={category.slug}
                  className="group h-full bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500 overflow-hidden motion-safe:animate-fade-in flex flex-col"
                  role="article"
                  aria-label={category.name}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Image Header */}
                  <div className="relative h-32 sm:h-40 md:h-44 lg:h-48 overflow-hidden">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-20`}
                    ></div>
                    <img
                      src={category.image}
                      alt={category.name}
                      loading="lazy"
                      decoding="async"
                      sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect fill='%23f3f4f6' width='600' height='400'/%3E%3C/svg%3E";
                      }}
                    />
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 w-10 sm:w-12 h-10 sm:h-12 bg-white/95 backdrop-blur-md rounded-xl shadow-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl sm:text-3xl">
                        {category.icon}
                      </span>
                    </div>
                    <div
                      className={`absolute top-3 sm:top-4 right-3 sm:right-4 px-2.5 sm:px-3 py-1 bg-gradient-to-r ${category.color} rounded-full shadow-lg`}
                    >
                      <span className="text-xs font-black text-white">
                        {productCount > 0 ? `${productCount}+` : category.count}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-4 md:p-5 lg:p-6 flex-1 flex flex-col">
                    <h2
                      className={`text-lg sm:text-xl lg:text-2xl font-black mb-3 sm:mb-4 bg-gradient-to-r ${category.color} bg-clip-text text-transparent leading-tight`}
                    >
                      {category.name}
                    </h2>

                    {/* Subcategories */}
                    <div className="mb-4 sm:mb-5 lg:mb-6 flex-1">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">
                        Subcategories:
                      </h3>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {category.subcategories.map((sub) => (
                          <span
                            key={sub}
                            className="px-2 sm:px-3 py-1 bg-gray-100 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-cyan-50 text-gray-700 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer hover:text-emerald-700 border border-gray-200 hover:border-emerald-200"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* View Button */}
                    <Link
                      to={`/categories/${category.slug}`}
                      className={`w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r ${category.color} text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95`}
                    >
                      <span className="text-sm sm:text-base">
                        View Products
                      </span>
                      <svg
                        className="w-4 sm:w-5 h-4 sm:h-5 transition-transform group-hover:translate-x-1 duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; opacity: 0; }
      `}</style>
    </main>
  );
}
