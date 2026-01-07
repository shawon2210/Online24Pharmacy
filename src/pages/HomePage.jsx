import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Suspense, lazy, memo } from "react";
import { useTranslation } from "react-i18next";
import SEOHead from "../components/common/SEOHead";
import HeroWithDynamicSlider from "../components/common/HeroWithDynamicSlider";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { normalizeProduct } from "../utils/normalizeProduct";
import { useInView } from "react-intersection-observer";

const ProductCarousel = lazy(() =>
  import("../components/product/ProductCarousel")
);
const WhyChooseUs = lazy(() => import("../components/marketing/WhyChooseUs"));
const SpecialOfferBanner = lazy(() =>
  import("../components/marketing/SpecialOfferBanner")
);
const AllProducts = lazy(() => import("../components/marketing/AllProducts"));
const PrescriptionUpload = lazy(() =>
  import("../components/marketing/PrescriptionUpload")
);
const ContactForm = lazy(() => import("../components/common/ContactForm"));

const CATEGORIES = [
  {
    nameKey: "medicinesTablets",
    icon: "💊",
    count: "2500+",
    link: "/categories/medicines-tablets",
  },
  {
    nameKey: "surgicalEquipment",
    icon: "🔪",
    count: "800+",
    link: "/categories/surgical-equipment",
  },
  {
    nameKey: "woundCare",
    icon: "🩹",
    count: "350+",
    link: "/categories/wound-care",
  },
  {
    nameKey: "diagnosticsTesting",
    icon: "🔬",
    count: "200+",
    link: "/categories/diagnostics-testing",
  },
  {
    nameKey: "hospitalSupplies",
    icon: "🏥",
    count: "600+",
    link: "/categories/hospital-supplies",
  },
  {
    nameKey: "ppeSafety",
    icon: "🦺",
    count: "150+",
    link: "/categories/ppe-safety",
  },
];

const CategoryCard = memo(({ category }) => {
  const { t } = useTranslation();
  return (
    <Link
      to={category.link}
      className="group flex flex-col h-full items-center text-center transition-all duration-300 hover:scale-[1.02] active:scale-95 bg-white dark:bg-card rounded-xl sm:rounded-2xl border border-gray-200 dark:border-border hover:border-emerald-400 dark:hover:border-emerald-400 shadow-md hover:shadow-xl p-3 xs:p-4 sm:p-5 md:p-6 lg:p-7"
    >
      {/* Icon Container */}
      <div className="flex items-center justify-center w-14 sm:w-16 md:w-20 h-14 sm:h-16 md:h-20 rounded-lg sm:rounded-xl bg-line-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 shadow-lg group-hover:shadow-xl mb-3 sm:mb-4 lg:mb-5">
        <span className="text-white text-2xl sm:text-3xl md:text-4xl">
          {category.icon}
        </span>
      </div>

      {/* Category Name */}
      <h3 className="font-bold text-base sm:text-lg md:text-xl text-foreground dark:text-foreground mb-2 sm:mb-3 line-clamp-2">
        {t(category.nameKey)}
      </h3>

      {/* Product Count Badge */}
      <span className="text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-md group-hover:shadow-lg transition-all">
        {category.count} {category.count === 1 ? "product" : "products"}
      </span>
    </Link>
  );
});

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

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }/api/products?limit=19`
      );
      const data = await res.json();
      return data.products.map(normalizeProduct);
    },
    staleTime: 600000,
    cacheTime: 1800000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

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

        {/* Featured Products Section - Full Width with responsive padding */}
        <section className="w-full py-8 sm:py-10 md:py-12 lg:py-16 bg-background dark:bg-background border-b border-border dark:border-border">
          <div className="mx-auto max-w-7xl px-4 xs:px-5 sm:px-6 md:px-8 lg:px-12">
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
              {isLoading ? (
                <Skeleton />
              ) : (
                <ProductCarousel products={products?.slice(0, 8) || []} />
              )}
            </Suspense>
          </div>
        </section>

        {/* Shop by Category Section - Full Width with alternating background */}
        <section className="w-full py-8 sm:py-10 md:py-12 lg:py-16 bg-card dark:bg-card border-b border-border dark:border-border">
          <div className="mx-auto max-w-7xl px-4 xs:px-5 sm:px-6 md:px-8 lg:px-12">
            <div className="text-center mb-8 sm:mb-10 lg:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2 sm:mb-3 lg:mb-4">
                {tf("homePage.shopByCategory", "Shop by Category")}
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground dark:text-muted-foreground max-w-2xl mx-auto">
                {tf(
                  "homePage.exploreProducts",
                  "Explore our comprehensive range of medical products"
                )}
              </p>
            </div>
            <div
              className="grid auto-rows-fr gap-3 sm:gap-4 lg:gap-6 mb-10 sm:mb-12 lg:mb-16"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}
            >
              {CATEGORIES.map((cat) => (
                <CategoryCard key={cat.nameKey} category={cat} />
              ))}
            </div>
            <div className="flex justify-center">
              <Link
                to="/categories"
                className="group inline-flex items-center gap-2 sm:gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                <span className="text-sm sm:text-base">
                  {tf("homePage.viewAllCategories", "View All Categories")}
                </span>
                <ArrowRightIcon className="w-4 sm:w-6 h-4 sm:h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* Prescription Upload Section */}
        <LazySection>
          <div className="w-full bg-background dark:bg-background border-b border-border dark:border-border">
            <PrescriptionUpload />
          </div>
        </LazySection>

        {/* All Products Section */}
        <LazySection>
          <div className="w-full bg-card dark:bg-card border-b border-border dark:border-border">
            <AllProducts products={products} isLoading={isLoading} />
          </div>
        </LazySection>

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
