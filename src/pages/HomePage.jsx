import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Suspense, lazy, memo } from "react";
import { useTranslation } from "react-i18next";
import SEOHead from "../components/common/SEOHead";
import HeroWithDynamicSlider from "../components/common/HeroWithDynamicSlider";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { normalizeProduct } from "../utils/normalizeProduct";
import { useInView } from "react-intersection-observer";

const ProductCarousel = lazy(
  () => import("../components/product/ProductCarousel"),
);
const CategoryProductSection = lazy(
  () => import("../components/product/CategoryProductSection"),
);
const WhyChooseUs = lazy(() => import("../components/marketing/WhyChooseUs"));
const SpecialOfferBanner = lazy(
  () => import("../components/marketing/SpecialOfferBanner"),
);
const PrescriptionUpload = lazy(
  () => import("../components/marketing/PrescriptionUpload"),
);
const ContactForm = lazy(() => import("../components/common/ContactForm"));

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

const ensureAbsoluteImageUrl = (url) => {
  if (!url) return null;
  // Remove curly braces if present (fixes {https://...} bug)
  if (typeof url === "string" && url.startsWith("{") && url.endsWith("}")) {
    url = url.slice(1, -1);
  }
  if (/^(https?:)?\/\//.test(url) || url.startsWith("data:")) return url;
  if (url.startsWith("/")) return `${API_URL}${url}`;
  return `${API_URL}/${url}`;
};

const CategoryCircleCard = memo(({ category, pastelBg }) => {
  const { t } = useTranslation();

  let imageSrc =
    ensureAbsoluteImageUrl(category.imageUrl) ||
    category.image ||
    FALLBACK_CATEGORY_CARD;

  return (
    <Link
      to={`/categories/${category.slug}`}
      key={category.slug || category.id}
      className={`flex flex-col items-center justify-center rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-0 min-h-40 xs:min-h-44 sm:min-h-45 md:min-h-48 min-w-35 xs:min-w-[160px] sm:min-w-45 md:min-w-50 snap-start ${pastelBg} group`}
      style={{ boxShadow: "0 4px 16px 0 rgba(0,0,0,0.07)" }}
    >
      <div className="w-full h-28 xs:h-32 sm:h-36 md:h-40 rounded-t-2xl overflow-hidden bg-white/60 dark:bg-gray-800/60 group-hover:scale-105 transition-transform flex items-center justify-center">
        <img
          src={imageSrc}
          alt={category.name}
          className="object-cover w-full h-full"
          loading="lazy"
          onError={(e) => {
            if (e.currentTarget.src !== FALLBACK_CATEGORY_CARD)
              e.currentTarget.src = FALLBACK_CATEGORY_CARD;
          }}
        />
      </div>
      <span className="w-full px-2 py-2 text-center text-sm xs:text-base sm:text-lg font-semibold text-gray-800 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors line-clamp-2 drop-shadow-sm bg-transparent rounded-b-2xl">
        {category.name}
      </span>
      <div className="absolute inset-x-0 -bottom-1 flex justify-center">
        <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-linear-to-r from-white to-cyan-100 dark:from-emerald-800 dark:to-cyan-800 text-emerald-900 dark:text-emerald-100 shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all">
          {t("explore", { defaultValue: "Explore" })}
        </span>
      </div>
    </Link>
  );
});

// Fallback image for category cards when imageUrl is missing
const FALLBACK_CATEGORY_CARD =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='240' viewBox='0 0 600 240'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%2310b981'/%3E%3Cstop offset='100%25' stop-color='%2306b6d4'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='600' height='240' fill='url(%23g)'/%3E%3C/svg%3E";

const Skeleton = () => (
  <div className="flex gap-4 justify-center py-8">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="w-48 h-64 rounded-2xl bg-border" />
    ))}
  </div>
);

const LazySection = memo(({ children }) => {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: "300px" });
  return (
    <div ref={ref}>
      {inView ? <Suspense fallback={null}>{children}</Suspense> : null}
    </div>
  );
});

export default function HomePage() {
  const { t } = useTranslation();
  const tf = (key, fallback) => {
    try {
      const res = t(key);
      if (res && res !== key) return res;
    } catch (_e) {
      // Translation key not found, use fallback
    }
    return typeof fallback !== "undefined" ? fallback : key;
  };

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }/api/products?limit=8`,
      );
      const data = await res.json();
      return data.products.map(normalizeProduct);
    },
    staleTime: 600000,
    cacheTime: 1800000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Fetch categories from API
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_URL}/api/products/categories`);
        if (!response.ok) return [];
        const data = await response.json();
        return data.categories || [];
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
      }
    },
  });

  // Fetch categories with products for homepage sections
  const { data: categoriesWithProducts, isLoading: categoriesLoading } =
    useQuery({
      queryKey: ["categories-with-products"],
      queryFn: async () => {
        try {
          const response = await fetch(
            `${API_URL}/api/products/categories/with-products?limit=8`,
          );
          if (!response.ok) {
            console.error("API response not OK:", response.status);
            return [];
          }
          const data = await response.json();
          return data.categories || [];
        } catch (error) {
          console.error("Failed to fetch categories with products:", error);
          return [];
        }
      },
      staleTime: 60000, // 1 minute for testing
      cacheTime: 300000, // 5 minutes
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    });

  const displayCategories = categoriesData || [];
  const categoryProductSections = categoriesWithProducts || [];

  return (
    <>
      <SEOHead
        title={t("homePage.seoTitle")}
        description={t("homePage.seoDescription")}
        url="/"
      />
      <div className="w-full bg-background dark:bg-background">
        {/* Hero Section */}
        <HeroWithDynamicSlider />

        {/* Special Offer Banner */}
        <LazySection>
          <div className="w-full bg-background dark:bg-background border-b border-border dark:border-border">
            <SpecialOfferBanner />
          </div>
        </LazySection>

        {/* Featured Products Section - compact, responsive height */}
        <section className="w-full py-10 sm:py-14 md:py-16 border-b border-border bg-background dark:bg-background flex items-center justify-center">
          <div className="w-screen px-1 xs:px-2 sm:px-4 md:px-8 lg:px-12 xl:px-16 max-w-screen-2xl mx-auto">
            <div className="flex flex-col items-center mb-8">
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold text-blue-700 dark:text-blue-700 mb-2 text-center drop-shadow-sm">
                {tf("homePage.featuredProducts", "Featured Products")}
              </h2>
              <p className="text-base sm:text-lg text-violet-800 dark:text-violet-500 text-center max-w-2xl">
                {tf(
                  "homePage.popularMedicines",
                  "Popular medicines and healthcare products",
                )}
              </p>
            </div>
            <Suspense fallback={<Skeleton />}>
              <ProductCarousel products={products || []} />
            </Suspense>
          </div>
        </section>

        {/* Shop by Category – Premium slider */}
        {/* Shop by Category – Pastel Grid Design */}
        <section
          className="w-full py-10 sm:py-14 md:py-16 border-b border-border"
          aria-label="Shop by Category Section"
        >
          <div className="w-screen px-1 xs:px-2 sm:px-4 md:px-8 lg:px-12 xl:px-16">
            <div className="flex flex-col items-center mb-8">
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold text-violet-700 dark:text-violet-600 mb-2 text-center drop-shadow-sm">
                {tf("homePage.shopByCategory", "Shop by Category")}
              </h2>
              <p className="text-base sm:text-lg text-violet-600 dark:text-violet-400 text-center max-w-2xl">
                {tf(
                  "homePage.exploreProducts",
                  "Explore our comprehensive range of medical products.",
                )}
              </p>
            </div>
            <div className="relative">
              <div className="flex items-center">
                {/* Left scroll button (desktop only) */}
                <button
                  type="button"
                  aria-label="Scroll categories left"
                  onClick={() => {
                    const el = document.getElementById("category-slider");
                    if (el) el.scrollBy({ left: -320, behavior: "smooth" });
                  }}
                  className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full border border-blue-200 bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-300 shadow hover:shadow-lg active:scale-95 transition-all duration-200 mr-2"
                >
                  <ArrowLeftIcon className="h-6 w-6" />
                </button>
                {/* Category slider starts here */}
                <div
                  id="category-slider"
                  className="flex gap-3 xs:gap-4 sm:gap-6 md:gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-1 py-2 w-full"
                  style={{
                    WebkitOverflowScrolling: "touch",
                    touchAction: "pan-x",
                    scrollbarWidth: "none",
                  }}
                  tabIndex={0}
                  aria-label="Category slider"
                >
                  {displayCategories.map((category, idx) => {
                    const pastelBg = [
                      "bg-[#B6E6FB] dark:bg-[#1e293b] dark:border dark:border-blue-900",
                      "bg-[#FFF6B3] dark:bg-[#334155] dark:border dark:border-yellow-900",
                      "bg-[#FFD6C9] dark:bg-[#3b2f2f] dark:border dark:border-rose-900",
                      "bg-[#F9C7F8] dark:bg-[#3b2941] dark:border dark:border-pink-900",
                      "bg-[#C7E6F9] dark:bg-[#1e293b] dark:border dark:border-cyan-900",
                      "bg-[#FBE6B6] dark:bg-[#3b3a29] dark:border dark:border-amber-900",
                    ][idx % 6];
                    let imageSrc =
                      ensureAbsoluteImageUrl(category.imageUrl) ||
                      category.image ||
                      FALLBACK_CATEGORY_CARD;
                    return (
                      <Link
                        to={`/categories/${category.slug}`}
                        key={category.slug || category.id}
                        className={`flex flex-col items-center justify-center rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-3 xs:p-4 sm:p-6 min-h-40 xs:min-h-44 sm:min-h-45 md:min-h-48 min-w-35 xs:min-w-[160px] sm:min-w-45 md:min-w-50 snap-start ${pastelBg} group`}
                        style={{ boxShadow: "0 4px 16px 0 rgba(0,0,0,0.07)" }}
                      >
                        <div className="flex items-center justify-center w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-white/60 dark:bg-gray-800/60 mb-2 sm:mb-3 group-hover:scale-105 transition-transform">
                          <img
                            src={imageSrc}
                            alt={category.name}
                            className="object-contain w-full h-full"
                            loading="lazy"
                            onError={(e) => {
                              if (
                                e.currentTarget.src !== FALLBACK_CATEGORY_CARD
                              )
                                e.currentTarget.src = FALLBACK_CATEGORY_CARD;
                            }}
                          />
                        </div>
                        <span className="mt-1 text-center text-sm xs:text-base sm:text-lg font-semibold text-gray-800 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors line-clamp-2 drop-shadow-sm">
                          {category.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
                {/* Right scroll button (desktop only) */}
                <button
                  type="button"
                  aria-label="Scroll categories right"
                  onClick={() => {
                    const el = document.getElementById("category-slider");
                    if (el) el.scrollBy({ left: 320, behavior: "smooth" });
                  }}
                  className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full border border-blue-200 bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-300 shadow hover:shadow-lg active:scale-95 transition-all duration-200 ml-2"
                >
                  <ArrowRightIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              {/* Add any additional content or controls here if needed */}
            </div>
          </div>
        </section>

        {/* Category-wise Product Sections */}
        {!categoriesLoading && categoryProductSections.length > 0 && (
          <div className="divide-y divide-border/50">
            {categoryProductSections.map((category, index) => (
              <div key={category.id || category.slug}>
                <LazySection>
                  <CategoryProductSection category={category} index={index} />
                </LazySection>

                {/* Show Prescription Upload after 3rd category */}
                {index === 2 && (
                  <LazySection>
                    <div className="w-full bg-background border-y border-border">
                      <PrescriptionUpload />
                    </div>
                  </LazySection>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Loading state for category sections */}
        {categoriesLoading && (
          <div className="w-full py-8 sm:py-10 md:py-12 lg:py-16 bg-background dark:bg-background border-b border-border dark:border-border">
            <div className="w-full px-4 xs:px-5 sm:px-6 md:px-8">
              <div className="animate-pulse space-y-8">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="h-6 sm:h-8 bg-border rounded w-40 sm:w-48"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                      {[...Array(6)].map((_, j) => (
                        <div
                          key={j}
                          className="bg-border rounded-lg aspect-square"
                        ></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Why Choose Us - Trust & Social Proof */}
        <LazySection>
          <div className="w-full bg-background dark:bg-background border-b border-border dark:border-border">
            <WhyChooseUs />
          </div>
        </LazySection>

        {/* Poster Section */}
        <section className="w-full bg-background dark:bg-background py-8 sm:py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6 md:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl hover:shadow-3xl transition-shadow duration-500">
                <img
                  src="/aheroo.png"
                  alt="Online24 Pharmacy Poster"
                  className="w-full h-auto object-cover object-center"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Contact/Newsletter Section */}
        <LazySection>
          <div className="w-full bg-background dark:bg-background">
            <ContactForm />
          </div>
        </LazySection>
      </div>
    </>
  );
}
