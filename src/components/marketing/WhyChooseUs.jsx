import { useTranslation } from "react-i18next";

const features = [
  {
    icon: "🏛️",
    titleKey: "whyChooseUs.licensedPharmacy",
    subtitleKey: "whyChooseUs.governmentCertified",
  },
  {
    icon: "💳",
    titleKey: "whyChooseUs.securePayment",
    subtitleKey: "whyChooseUs.safeCheckout",
  },
  {
    icon: "⚕️",
    titleKey: "whyChooseUs.expertCare",
    subtitleKey: "whyChooseUs.pharmacistVerified",
  },
  {
    icon: "👥",
    titleKey: "whyChooseUs.trustedCustomers",
    subtitleKey: "whyChooseUs.trustedCustomersSubtitle",
  },
  {
    icon: "🚚",
    titleKey: "whyChooseUs.freeDelivery",
    subtitleKey: "whyChooseUs.ordersAbove",
  },
  {
    icon: "💳",
    titleKey: "whyChooseUs.cashOnDelivery",
    subtitleKey: "whyChooseUs.noHiddenCharges",
  },
  {
    icon: "🚚",
    titleKey: "whyChooseUs.fastDelivery",
    subtitleKey: "whyChooseUs.sameDayAvailable",
  },
];

export default function WhyChooseUs() {
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
  return (
    <section className="w-full bg-background dark:bg-card py-12 sm:py-16 px-4 sm:px-6">
      <div className="text-center mb-8 sm:mb-12 max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
          {tf("whyChooseUs.title", "Why Choose Us?")}
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">
          {tf(
            "whyChooseUs.subtitle",
            "Discover what makes us Bangladesh's most trusted pharmacy"
          )}
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 max-w-7xl mx-auto mb-10">
        {features.map((item) => (
          <div
            key={item.titleKey}
            className="bg-white/60 dark:bg-emerald-950/60 backdrop-blur-xl p-3 sm:p-4 rounded-2xl text-center shadow-xl hover:shadow-emerald-400/30 hover:shadow-2xl transition-all hover:-translate-y-2 border border-white/30 dark:border-emerald-900/40"
          >
            <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">
              {item.icon}
            </div>
            <h3 className="font-bold text-emerald-900 dark:text-emerald-100 mb-1 text-xs sm:text-sm">
              {tf(item.titleKey, item.titleKey)}
            </h3>
            <p className="text-emerald-800/80 dark:text-emerald-200/80 text-[10px] sm:text-xs leading-tight">
              {tf(item.subtitleKey, item.subtitleKey)}
            </p>
          </div>
        ))}
      </div>
      {/* Testimonials Row */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Example testimonials, replace with real data as needed */}
        <div className="rounded-2xl bg-white/70 dark:bg-emerald-950/70 backdrop-blur-xl shadow-lg border border-white/30 dark:border-emerald-900/40 p-6 flex flex-col items-center text-center">
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="Customer"
            className="w-14 h-14 rounded-full border-4 border-emerald-200 shadow mb-3"
          />
          <p className="text-emerald-900 dark:text-emerald-100 text-sm mb-2">
            “Fast delivery and genuine products. I trust them for my family’s
            health needs!”
          </p>
          <span className="text-xs text-emerald-700 dark:text-emerald-200 font-semibold">
            Ayesha Rahman
          </span>
        </div>
        <div className="rounded-2xl bg-white/70 dark:bg-emerald-950/70 backdrop-blur-xl shadow-lg border border-white/30 dark:border-emerald-900/40 p-6 flex flex-col items-center text-center">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="Customer"
            className="w-14 h-14 rounded-full border-4 border-emerald-200 shadow mb-3"
          />
          <p className="text-emerald-900 dark:text-emerald-100 text-sm mb-2">
            “Excellent customer support and easy prescription upload. Highly
            recommended!”
          </p>
          <span className="text-xs text-emerald-700 dark:text-emerald-200 font-semibold">
            Md. Imran Hossain
          </span>
        </div>
        <div className="rounded-2xl bg-white/70 dark:bg-emerald-950/70 backdrop-blur-xl shadow-lg border border-white/30 dark:border-emerald-900/40 p-6 flex flex-col items-center text-center">
          <img
            src="https://randomuser.me/api/portraits/men/85.jpg"
            alt="Customer"
            className="w-14 h-14 rounded-full border-4 border-emerald-200 shadow mb-3"
          />
          <p className="text-emerald-900 dark:text-emerald-100 text-sm mb-2">
            “Best online pharmacy in Dhaka. Fast, reliable, and always
            authentic.”
          </p>
          <span className="text-xs text-emerald-700 dark:text-emerald-200 font-semibold">
            Tanvir Alam
          </span>
        </div>
      </div>
    </section>
  );
}
