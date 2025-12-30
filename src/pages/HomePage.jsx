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
  const tf = (key, fallback) => {
    try {
      const res = t(key);
      if (res && res !== key) return res;
    } catch (e) {}
    return typeof fallback !== "undefined" ? fallback : key;
  };
  return (
    <Link
      to={category.link}
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-400 p-3 sm:p-4 flex flex-col items-center text-center transition-all"
    >
      <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg mb-2">
        <span className="text-white text-xl sm:text-2xl">{category.icon}</span>
      </div>
      <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-1 line-clamp-2">
        {t(category.nameKey)}
      </h3>
      <span className="text-xs text-white bg-gradient-to-r from-emerald-600 to-cyan-600 px-2 py-1 rounded-full">
        {category.count}
      </span>
    </Link>
  );
});

const Skeleton = () => (
  <div className="flex gap-4 justify-center py-8">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="w-48 h-64 rounded-2xl bg-gray-200 dark:bg-gray-700"
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
      <div className="w-full bg-gray-50 dark:bg-gray-900">
        <HeroWithDynamicSlider />
        <LazySection>
          <SpecialOfferBanner />
        </LazySection>

        <section className="w-full py-16 px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              {tf("homePage.featuredProducts", "Featured Products")}
            </h2>
            <p className="text-gray-600 text-lg">
              {tf(
                "homePage.popularMedicines",
                "Popular medicines and top picks"
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
        </section>

        <section className="w-full py-16 bg-white dark:bg-gray-800 px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              {tf("homePage.shopByCategory", "Shop by Category")}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              {tf(
                "homePage.exploreProducts",
                "Explore products across categories"
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 max-w-7xl mx-auto">
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.nameKey} category={cat} />
            ))}
          </div>
          <div className="flex justify-center mt-16">
            <Link
              to="/categories"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            >
              <span>
                {tf("homePage.viewAllCategories", "View all categories")}
              </span>
              <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        <LazySection>
          <PrescriptionUpload />
        </LazySection>
        <LazySection>
          <AllProducts products={products} isLoading={isLoading} />
        </LazySection>
        <LazySection>
          <WhyChooseUs />
        </LazySection>
        <LazySection>
          <ContactForm />
        </LazySection>
      </div>
    </>
  );
}
