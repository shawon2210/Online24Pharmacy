import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Suspense, lazy, memo, useRef } from "react";
import { useTranslation } from "react-i18next";
import SEOHead from "../components/common/SEOHead";
import HeroWithDynamicSlider from "../components/common/HeroWithDynamicSlider";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { normalizeProduct } from "../utils/normalizeProduct";
import { useInView } from "react-intersection-observer";

const ProductCarousel = lazy(() =>
  import("../components/product/ProductCarousel")
);
const CategoryProductSection = lazy(() =>
  import("../components/product/CategoryProductSection")
);
const WhyChooseUs = lazy(() => import("../components/marketing/WhyChooseUs"));
const SpecialOfferBanner = lazy(() =>
  import("../components/marketing/SpecialOfferBanner")
);
const PrescriptionUpload = lazy(() =>
  import("../components/marketing/PrescriptionUpload")
);
const ContactForm = lazy(() => import("../components/common/ContactForm"));

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

const ensureAbsoluteImageUrl = (url) => {
  if (!url) return null;
  if (/^(https?:)?\/\//.test(url) || url.startsWith("data:")) return url;
  if (url.startsWith("/")) return `${API_URL}${url}`;
  return `${API_URL}/${url}`;
};

const CategoryCircleCard = memo(({ category }) => {
  const { t } = useTranslation();
  const imageSrc =
    ensureAbsoluteImageUrl(category.imageUrl) ||
    category.image ||
    FALLBACK_CATEGORY_CARD;

  return (
    <Link
      to={`/categories/${category.slug}`}
      aria-label={`Shop ${category.name}`}
      className="group flex w-27 sm:w-31 md:w-34 flex-col items-center snap-start transition-all duration-500 ease-out hover:-translate-y-2 active:scale-95"
    >
      <div className="relative">
        <div className="p-1.5 rounded-full bg-white/12 dark:bg-white/10 border border-white/18 shadow-xl backdrop-blur-lg">
          <div className="h-24 w-24 sm:h-27 sm:w-27 md:h-30 md:w-30 rounded-full bg-linear-to-br from-white via-emerald-50/80 to-cyan-50/85 dark:from-emerald-900/55 dark:via-emerald-800/45 dark:to-cyan-900/45 overflow-hidden ring-3 ring-white/45 dark:ring-emerald-300/28 shadow-lg transition-all duration-500 group-hover:ring-white/70 group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.16)]">
            <img
              src={imageSrc}
              alt={category.name}
              loading="lazy"
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_CATEGORY_CARD;
              }}
            />
            <div
              className={`absolute inset-0 bg-linear-to-t ${
                category.color ||
                "from-emerald-500/42 via-cyan-500/32 to-transparent"
              } opacity-55 group-hover:opacity-45 transition-opacity`}
            ></div>
          </div>
        </div>
        <div className="absolute inset-x-0 -bottom-2 flex justify-center">
          <span className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-linear-to-r from-white to-white/90 dark:from-emerald-700 dark:to-cyan-700 text-emerald-800 dark:text-white shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all">
            {t("explore", { defaultValue: "Explore" })}
          </span>
        </div>
      </div>
      <p className="mt-3.5 text-center text-sm sm:text-base md:text-lg font-semibold text-white drop-shadow-sm line-clamp-2 tracking-tight">
        {category.name}
      </p>
    </Link>
  );
});

// Fallback image for category cards when imageUrl is missing
const FALLBACK_CATEGORY_CARD =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='240' viewBox='0 0 600 240'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%2310b981'/%3E%3Cstop offset='100%25' stop-color='%2306b6d4'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='600' height='240' fill='url(%23g)'/%3E%3C/svg%3E";

const Skeleton = () => (
  <div className="flex gap-4 justify-center py-8">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="w-48 h-64 rounded-2xl bg-border dark:bg-foreground"
      />
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
        }/api/products?limit=8`
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
            `${API_URL}/api/products/categories/with-products?limit=8`
          );
          if (!response.ok) {
            console.error("API response not OK:", response.status);
            return [];
          }
          const data = await response.json();
          console.log("Categories with products:", data.categories);
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
  const categoryCarouselRef = useRef(null);

  const scrollCategories = (direction) => {
    const node = categoryCarouselRef.current;
    if (!node) return;
    const base = typeof window !== "undefined" ? window.innerWidth : 1200;
    const amount = base < 640 ? 220 : base < 1024 ? 280 : 340;
    node.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  console.log(
    "HomePage - Categories with products:",
    categoryProductSections.length,
    categoryProductSections
  );
  console.log("HomePage - Loading state:", categoriesLoading);

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
          <div className="w-full bg-card dark:bg-card border-b border-border dark:border-border">
            <SpecialOfferBanner />
          </div>
        </LazySection>

        {/* Featured Products Section - Full Width */}
        <section className="w-full py-8 sm:py-10 md:py-12 lg:py-16 bg-background dark:bg-background border-b border-border dark:border-border">
          <div className="w-full px-4 xs:px-5 sm:px-6 md:px-8">
            <div className="text-center mb-8 sm:mb-10 lg:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2 sm:mb-3 lg:mb-4">
                {tf("homePage.featuredProducts", "Featured Products")}
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground dark:text-muted-foreground max-w-2xl mx-auto">
                {tf(
                  "homePage.popularMedicines",
                  "Popular medicines and healthcare products"
                )}
              </p>
            </div>
            <Suspense fallback={<Skeleton />}>
              <ProductCarousel products={products || []} />
            </Suspense>
          </div>
        </section>

        {/* Shop by Category – Premium slider */}
        <section className="relative w-full overflow-hidden py-4 sm:py-5 md:py-6 lg:py-7 bg-linear-to-br from-emerald-600 via-emerald-500 to-cyan-500 text-white shadow-2xl">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-emerald-900/40 via-transparent to-transparent opacity-50"></div>
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.5) 0, rgba(255,255,255,0) 35%), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.35) 0, rgba(255,255,255,0) 32%), radial-gradient(circle at 50% 90%, rgba(255,255,255,0.25) 0, rgba(255,255,255,0) 35%)",
            }}
          ></div>
          <div className="w-full px-4 xs:px-5 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
              <div className="space-y-2.5 max-w-3xl">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-[10px] font-bold uppercase tracking-[0.15em] text-white/95 shadow-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300">
                  ✨ {tf("homePage.curated", "Curated")}
                </span>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight drop-shadow-lg tracking-tighter bg-linear-to-r from-white via-white/98 to-white/95 bg-clip-text text-transparent">
                  {tf("homePage.shopByCategory", "Shop by Category")}
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed max-w-2xl font-medium opacity-90">
                  {tf(
                    "homePage.exploreProducts",
                    "Discover premium healthcare products tailored for your wellness"
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to="/categories"
                    className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-6 sm:px-7 py-2.5 sm:py-3 rounded-full shadow-lg hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all text-sm sm:text-base duration-200 group/btn"
                  >
                    <span className="text-sm sm:text-base">
                      {tf("homePage.viewAllCategories", "Explore Categories")}
                    </span>
                    <ArrowRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </Link>
                  <span className="text-xs sm:text-sm text-white/70 italic">
                    {tf("homePage.dragHint", "← Swipe or use arrows →")}
                  </span>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Scroll categories left"
                  onClick={() => scrollCategories(-1)}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/35 bg-white/12 hover:bg-white/22 text-white shadow-lg hover:shadow-xl active:scale-90 transition-all duration-300 backdrop-blur-md hover:-translate-x-0.5"
                >
                  <ArrowLeftIcon className="h-5 w-5 font-bold" />
                </button>
                <button
                  type="button"
                  aria-label="Scroll categories right"
                  onClick={() => scrollCategories(1)}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/35 bg-white/12 hover:bg-white/22 text-white shadow-lg hover:shadow-xl active:scale-90 transition-all duration-300 backdrop-blur-md hover:translate-x-0.5"
                >
                  <ArrowRightIcon className="h-5 w-5 font-bold" />
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/20 bg-white/12 dark:bg-white/8 backdrop-blur-3xl shadow-2xl ring-1 ring-white/15 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2.5 hover:ring-white/25 hover:border-white/30 transition-all duration-500">
              <div
                ref={categoryCarouselRef}
                className="flex gap-3.5 sm:gap-4.5 md:gap-5 overflow-x-auto pb-2 sm:pb-2.5 snap-x snap-mandatory px-1 sm:px-2 scrollbar-hide"
                style={{ scrollbarWidth: "none" }}
              >
                {displayCategories.map((category) => (
                  <CategoryCircleCard
                    key={category.slug || category.id}
                    category={category}
                  />
                ))}
              </div>
              <div className="mt-3 flex justify-center gap-2 lg:hidden">
                <button
                  type="button"
                  aria-label="Scroll categories left"
                  onClick={() => scrollCategories(-1)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/15 hover:bg-white/25 text-white shadow-sm hover:shadow transition-all backdrop-blur"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Scroll categories right"
                  onClick={() => scrollCategories(1)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/15 hover:bg-white/25 text-white shadow-sm hover:shadow transition-all backdrop-blur"
                >
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Category-wise Product Sections */}
        {!categoriesLoading && categoryProductSections.length > 0 && (
          <>
            {categoryProductSections.map((category, index) => (
              <div key={category.id || category.slug}>
                <LazySection>
                  <CategoryProductSection category={category} index={index} />
                </LazySection>

                {/* Show Prescription Upload after 3rd category */}
                {index === 2 && (
                  <LazySection>
                    <div className="w-full bg-background dark:bg-background border-b border-border dark:border-border">
                      <PrescriptionUpload />
                    </div>
                  </LazySection>
                )}
              </div>
            ))}
          </>
        )}

        {/* Loading state for category sections */}
        {categoriesLoading && (
          <div className="w-full py-8 sm:py-10 md:py-12 lg:py-16 bg-background dark:bg-background border-b border-border dark:border-border">
            <div className="w-full px-4 xs:px-5 sm:px-6 md:px-8">
              <div className="animate-pulse space-y-8">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="h-6 sm:h-8 bg-border dark:bg-foreground rounded w-40 sm:w-48"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                      {[...Array(6)].map((_, j) => (
                        <div
                          key={j}
                          className="bg-border dark:bg-foreground rounded-lg aspect-square"
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

        {/* Contact/Newsletter Section */}
        <LazySection>
          <div className="w-full bg-card dark:bg-card">
            <ContactForm />
          </div>
        </LazySection>
      </div>
    </>
  );
}
