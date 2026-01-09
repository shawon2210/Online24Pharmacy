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
          <div className="w-full bg-background dark:bg-background border-b border-border dark:border-border">
            <SpecialOfferBanner />
          </div>
        </LazySection>

        {/* Featured Products Section - compact, responsive height */}
        <section className="w-full py-5 sm:py-7 md:py-8 lg:py-10 bg-background dark:bg-background border-b border-border dark:border-border">
          <div className="w-full px-4 xs:px-5 sm:px-6 md:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-6 sm:mb-8 lg:mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2 sm:mb-2.5 lg:mb-3">
                {tf("homePage.featuredProducts", "Featured Products")}
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground dark:text-muted-foreground max-w-2xl mx-auto leading-relaxed">
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
        <section className="relative w-full overflow-hidden py-2 sm:py-3 md:py-4 lg:py-5 bg-linear-to-r from-emerald-600 via-emerald-500 to-cyan-600 dark:from-emerald-700 dark:via-emerald-700 dark:to-cyan-700 text-white shadow-xl">
          {/* Enhanced Background Pattern */}
          <div className="absolute inset-0 bg-white/10 dark:bg-foreground/10 animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.18),transparent_52%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent_52%)]"></div>
          <div className="absolute inset-0 bg-white/8 dark:bg-white/5"></div>

          {/* Floating Elements */}
          <div className="hidden xs:block absolute top-2 xs:top-3 left-3 xs:left-6 animate-bounce">
            <span className="text-xl xs:text-2xl animate-pulse">🏥</span>
          </div>
          <div
            className="hidden xs:block absolute bottom-2 xs:bottom-3 right-3 xs:right-6 animate-bounce"
            style={{ animationDelay: "0.5s" }}
          >
            <span className="text-lg xs:text-xl animate-pulse">💊</span>
          </div>
          <div
            className="hidden sm:block absolute top-4 right-1/4 animate-pulse"
            style={{ animationDelay: "1s" }}
          >
            <span className="text-lg animate-pulse">⚕️</span>
          </div>
          <div className="w-full px-4 xs:px-5 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-1.5 sm:gap-2 mb-2 sm:mb-3 md:mb-4">
              <div className="space-y-1.5 max-w-3xl">
                {/* Enhanced Content Layout */}
                <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 mb-2 xs:mb-3">
                  <span className="text-xl xs:text-2xl sm:text-3xl animate-pulse">
                    🏥
                  </span>
                  <div className="h-6 xs:h-7 sm:h-9 w-px bg-white/50"></div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 dark:bg-white/15 text-[9px] font-bold uppercase tracking-[0.15em] text-white shadow-lg backdrop-blur-sm border border-white/30 hover:bg-white/30 dark:hover:bg-white/25 transition-all duration-300">
                    ✨ {tf("homePage.curated", "Curated")}
                  </span>
                  <div className="h-6 xs:h-7 sm:h-9 w-px bg-white/50 hidden sm:block"></div>
                  <span className="text-lg xs:text-xl sm:text-2xl animate-pulse">
                    💊
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight drop-shadow-lg tracking-tighter bg-linear-to-r from-white via-white to-cyan-100 text-transparent bg-clip-text">
                  {tf("homePage.shopByCategory", "Shop by Category")}
                </h2>
                <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-2xl font-medium opacity-95">
                  {tf(
                    "homePage.exploreProducts",
                    "Discover premium healthcare products tailored for your wellness"
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                  <Link
                    to="/categories"
                    className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold px-4 sm:px-5 py-1.5 sm:py-2 rounded-full shadow-lg hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all text-sm duration-200 group/btn border border-white/30"
                  >
                    <span className="text-sm">
                      {tf("homePage.viewAllCategories", "Explore Categories")}
                    </span>
                    <ArrowRightIcon className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </Link>
                  <span className="text-xs text-white/80 italic">
                    {tf("homePage.dragHint", "← Swipe or use arrows →")}
                  </span>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-2.5">
                <button
                  type="button"
                  aria-label="Scroll categories left"
                  onClick={() => scrollCategories(-1)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/20 hover:bg-white/30 text-white shadow-lg hover:shadow-xl active:scale-90 transition-all duration-300 backdrop-blur-md hover:-translate-x-0.5"
                >
                  <ArrowLeftIcon className="h-4 w-4 font-bold" />
                </button>
                <button
                  type="button"
                  aria-label="Scroll categories right"
                  onClick={() => scrollCategories(1)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/20 hover:bg-white/30 text-white shadow-lg hover:shadow-xl active:scale-90 transition-all duration-300 backdrop-blur-md hover:translate-x-0.5"
                >
                  <ArrowRightIcon className="h-4 w-4 font-bold" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-3xl ring-1 ring-white/30 px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 hover:ring-white/40 hover:border-white/30 transition-all duration-500">
              <div
                ref={categoryCarouselRef}
                className="flex gap-3 sm:gap-4 md:gap-4.5 overflow-x-auto pb-1.5 sm:pb-2 snap-x snap-mandatory px-1 sm:px-1.5 scrollbar-hide"
                style={{ scrollbarWidth: "none" }}
              >
                {displayCategories.map((category) => (
                  <CategoryCircleCard
                    key={category.slug || category.id}
                    category={category}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-center gap-2 lg:hidden">
                <button
                  type="button"
                  aria-label="Scroll categories left"
                  onClick={() => scrollCategories(-1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/20 hover:bg-white/30 text-white shadow-sm hover:shadow transition-all backdrop-blur"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Scroll categories right"
                  onClick={() => scrollCategories(1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/20 hover:bg-white/30 text-white shadow-sm hover:shadow transition-all backdrop-blur"
                >
                  <ArrowRightIcon className="h-4 w-4" />
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
          <div className="w-full bg-background dark:bg-background">
            <ContactForm />
          </div>
        </LazySection>
      </div>
    </>
  );
}
