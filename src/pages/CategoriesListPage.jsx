import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SEOHead from "../components/common/SEOHead";
import { Squares2X2Icon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

const categories = [
  {
    nameKey: "medicinesTablets",
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
    nameKey: "surgicalEquipment",
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
    nameKey: "woundCare",
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
    nameKey: "diagnosticsTesting",
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
    nameKey: "hospitalSupplies",
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
    nameKey: "ppeSafety",
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

  // Fetch categories from API
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const response = await fetch(`${API_URL}/api/products/categories`);
        const data = await response.json();
        return data.categories || [];
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
      }
    },
  });

  // Fallback to static categories if API returns empty
  const apiCategories = categoriesData || [];
  const displayCategories =
    apiCategories.length > 0 ? apiCategories : categories;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <SEOHead
        title={t("categoriesList.seoTitle")}
        description={t("categoriesList.seoDescription")}
        url="/categories"
      />

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-md">
        <div className="container mx-auto px-4 py-4">
          {/* Professional Breadcrumbs */}
          <nav className="mb-3" aria-label={t("breadcrumb")}>
            <ol className="flex items-center gap-1 text-sm text-gray-500">
              <li>
                <Link to="/" className="hover:text-emerald-600 font-medium">
                  {t("home")}
                </Link>
              </li>
              <li className="px-1 text-gray-400">/</li>
              <li className="text-gray-900 font-bold" aria-current="page">
                {t("categories")}
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                {t("categoriesList.title")}
              </h1>
              <p className="text-sm text-gray-600">
                {t("categoriesList.subtitle")}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-cyan-100 border-2 border-emerald-200 text-emerald-700 rounded-full text-sm font-bold">
              <Squares2X2Icon className="w-5 h-5" />
              <span>
                {displayCategories.length} {t("categories")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {displayCategories.map((category, _index) => (
            <Link
              key={category.slug}
              to={`/categories/${category.slug}`}
              className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-emerald-200 overflow-hidden"
            >
              {/* Image with Overlay */}
              <div className="relative h-32 sm:h-36 overflow-hidden">
                <img
                  src={category.image}
                  alt={t(category.nameKey, category.name)}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-60 group-hover:opacity-40 transition-opacity`}
                ></div>

                {/* Icon & Count */}
                <div className="absolute top-4 left-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-xl">{category.icon}</span>
                  </div>
                  <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
                    <span className="text-xs font-bold text-gray-800">
                      {category.count}
                    </span>
                  </div>
                </div>

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                  <h2 className="text-xl font-bold text-white mb-1">
                    {t(category.nameKey, category.name)}
                  </h2>
                  <div className="flex flex-wrap gap-1">
                    {category.subcategories.slice(0, 2).map((sub) => (
                      <span
                        key={sub}
                        className="text-xs text-white/80 bg-white/20 px-2 py-0.5 rounded-full"
                      >
                        {t(
                          `subcategory.${sub
                            .replace(/\s+/g, "")
                            .toLowerCase()}`,
                          sub
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-3">
                <div
                  className={`flex items-center justify-center gap-2 py-3 bg-gradient-to-r ${category.color} text-white rounded-xl font-semibold group-hover:shadow-lg transition-all text-sm`}
                >
                  <span>{t("exploreProducts")}</span>
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
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
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
