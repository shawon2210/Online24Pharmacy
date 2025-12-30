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
    } catch (e) {}
    return typeof fallback !== "undefined" ? fallback : key;
  };
  return (
    <section className="w-full bg-gray-50 dark:bg-gray-800 py-16 px-6">
      <div className="text-center mb-12 max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          {tf("whyChooseUs.title", "Why Choose Us?")}
        </h2>
        <p className="text-gray-600 text-lg">
          {tf(
            "whyChooseUs.subtitle",
            "Discover what makes us Bangladesh's most trusted pharmacy"
          )}
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 max-w-7xl mx-auto">
        {features.map((item) => (
          <div
            key={item.titleKey}
            className="bg-white p-4 rounded-xl text-center shadow-sm hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-2">{item.icon}</div>
            <h3 className="font-bold text-gray-900 mb-1 text-sm">
              {tf(item.titleKey, item.titleKey)}
            </h3>
            <p className="text-gray-600 text-xs">
              {tf(item.subtitleKey, item.subtitleKey)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
