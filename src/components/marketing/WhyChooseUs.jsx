const features = [
  { icon: "🏛️", title: "Licensed Pharmacy", subtitle: "Government certified" },
  { icon: "💳", title: "Secure Payment", subtitle: "100% safe checkout" },
  { icon: "⚕️", title: "Expert Care", subtitle: "Pharmacist verified" },
  { icon: "👥", title: "10,000+", subtitle: "Trusted Customers" },
  { icon: "🚚", title: "Free Delivery", subtitle: "Orders above ৳500" },
  { icon: "💳", title: "Cash on Delivery", subtitle: "No Hidden Charges" },
  { icon: "🚚", title: "Fast Delivery", subtitle: "Same day available" },
];

export default function WhyChooseUs() {
  return (
    <section className="w-full bg-gray-50 dark:bg-gray-800 py-16 px-6">
      <div className="text-center mb-12 max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose <span className="text-emerald-600">Us</span></h2>
        <p className="text-gray-600 text-lg">Your trusted healthcare partner with excellence in service</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 max-w-7xl mx-auto">
        {features.map((item) => (
          <div key={item.title} className="bg-white p-4 rounded-xl text-center shadow-sm hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">{item.icon}</div>
            <h3 className="font-bold text-gray-900 mb-1 text-sm">{item.title}</h3>
            <p className="text-gray-600 text-xs">{item.subtitle}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
