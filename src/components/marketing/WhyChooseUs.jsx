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
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground dark:text-background mb-3 sm:mb-4">
          {tf("whyChooseUs.title", "Why Choose Us?")}
        </h2>
        <p className="text-muted-foreground dark:text-muted text-base sm:text-lg">
          {tf(
            "whyChooseUs.subtitle",
            "Discover what makes us Bangladesh's most trusted pharmacy"
          )}
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 max-w-7xl mx-auto">
        {features.map((item) => (
          <div
            key={item.titleKey}
            className="bg-background dark:bg-foreground p-3 sm:p-4 rounded-xl text-center shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">
              {item.icon}
            </div>
            <h3 className="font-bold text-foreground dark:text-background mb-1 text-xs sm:text-sm">
              {tf(item.titleKey, item.titleKey)}
            </h3>
            <p className="text-muted-foreground dark:text-muted text-[10px] sm:text-xs leading-tight">
              {tf(item.subtitleKey, item.subtitleKey)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
