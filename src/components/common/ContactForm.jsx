import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  PaperAirplaneIcon,
  CheckCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

function ContactForm() {
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
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = t("contactForm.nameRequired");
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      err.email = t("contactForm.emailRequired");
    if (!form.phone.trim()) err.phone = t("contactForm.phoneRequired");
    setErrors(err);
    return !Object.keys(err).length;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setForm({ name: "", email: "", phone: "", message: "" });
      setTimeout(() => setSuccess(false), 4000);
    }, 1500);
  };

  return (
    <section className="w-full py-20 px-4 sm:px-6 bg-background dark:bg-card">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-bold mb-4">
            {tf("contactForm.badge", "Contact us")}
          </span>
          <h2 className="text-5xl md:text-6xl font-black text-foreground dark:text-background mb-4 bg-linear-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            {tf("contactForm.title", "Get in touch")}
          </h2>
          <p className="text-xl text-muted-foreground dark:text-muted max-w-3xl mx-auto">
            {tf(
              "contactForm.subtitle",
              "We're here to help — send us a message"
            )}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Side - Contact Info (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Contact Card with Gradient */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-600 via-emerald-500 to-cyan-600 p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <PhoneIcon className="w-7 h-7 text-background" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-background">
                      {tf("contactForm.getInTouch", "Get in touch")}
                    </h3>
                    <p className="text-emerald-100 text-sm">
                      {tf(
                        "contactForm.hereToHelp",
                        "Our team is here to help you"
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                      <PhoneIcon className="w-6 h-6 text-background" />
                    </div>
                    <div>
                      <div className="text-background font-bold text-sm mb-1">
                        {tf("contactForm.callUs", "Call us")}
                      </div>
                      <a
                        href="tel:+8801700000000"
                        className="text-emerald-100 hover:text-background transition-colors font-semibold"
                      >
                        +880 1700-000000
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                      <EnvelopeIcon className="w-6 h-6 text-background" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-background font-bold text-sm mb-1">
                        {tf("contactForm.emailUs", "Email us")}
                      </div>
                      <a
                        href="mailto:support@online24pharmacy.com"
                        className="text-emerald-100 hover:text-background transition-colors font-semibold text-sm break-all"
                      >
                        support@online24pharmacy.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                      <MapPinIcon className="w-6 h-6 text-background" />
                    </div>
                    <div>
                      <div className="text-background font-bold text-sm mb-1">
                        {tf("contactForm.visitUs", "Visit us")}
                      </div>
                      <div className="text-emerald-100 font-semibold">
                        {tf("contactForm.addressValue", "Dhaka, Bangladesh")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  icon: ClockIcon,
                  value: tf("contactForm.statSupportValue", "24/7"),
                  label: tf("contactForm.statSupportLabel", "Support"),
                  color: "emerald",
                },
                {
                  icon: UserGroupIcon,
                  value: tf("contactForm.statCustomersValue", "100k+"),
                  label: tf(
                    "contactForm.statCustomersLabel",
                    "Happy Customers"
                  ),
                  color: "cyan",
                },
                {
                  icon: ShieldCheckIcon,
                  value: tf("contactForm.statSecureValue", "DGDA"),
                  label: tf("contactForm.statSecureLabel", "DGDA Certified"),
                  color: "emerald",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-background dark:bg-card rounded-2xl p-5 text-center shadow-lg border border-border dark:border-foreground hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <stat.icon
                    className={`w-8 h-8 mx-auto mb-3 text-${stat.color}-600 dark:text-${stat.color}-400`}
                  />
                  <div
                    className={`text-3xl font-black text-${stat.color}-600 dark:text-${stat.color}-400 mb-1`}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground dark:text-muted-foreground font-semibold">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Form (3 cols) */}
          <div className="lg:col-span-3">
            <div className="bg-background dark:bg-card rounded-3xl p-8 sm:p-10 shadow-2xl border border-border dark:border-foreground">
              {success ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircleIcon className="w-14 h-14 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-4xl font-black text-foreground dark:text-background mb-4">
                    {t("contactForm.successTitle")}
                  </h3>
                  <p className="text-xl text-muted-foreground dark:text-muted">
                    {t("contactForm.successDesc")}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h3 className="text-3xl font-black text-foreground dark:text-background mb-3">
                      {tf("contactForm.formTitle", "Send us a message")}
                    </h3>
                    <p className="text-muted-foreground dark:text-muted text-lg">
                      {tf(
                        "contactForm.formDesc",
                        "Describe your question and we'll respond shortly"
                      )}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-foreground dark:text-background mb-2.5">
                        {t("contactForm.fullName")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className={`w-full px-5 py-4 border-2 ${
                          errors.name
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "border-border dark:border-muted-foreground focus:border-emerald-500 focus:ring-emerald-500/20"
                        } rounded-xl bg-background dark:bg-foreground text-foreground dark:text-background placeholder-gray-400 focus:outline-none focus:ring-4 transition-all text-base font-medium`}
                        placeholder={tf(
                          "contactForm.fullNamePlaceholder",
                          "Your full name"
                        )}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-2 font-medium">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-foreground dark:text-background mb-2.5">
                          {t("contactForm.emailAddress")}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          className={`w-full px-5 py-4 border-2 ${
                            errors.email
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                              : "border-border dark:border-muted-foreground focus:border-emerald-500 focus:ring-emerald-500/20"
                          } rounded-xl bg-background dark:bg-foreground text-foreground dark:text-background placeholder-gray-400 focus:outline-none focus:ring-4 transition-all text-base font-medium`}
                          placeholder={tf(
                            "contactForm.emailPlaceholder",
                            "yourname@example.com"
                          )}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-2 font-medium">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-foreground dark:text-background mb-2.5">
                          {t("contactForm.phoneNumber")}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          className={`w-full px-5 py-4 border-2 ${
                            errors.phone
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                              : "border-border dark:border-muted-foreground focus:border-emerald-500 focus:ring-emerald-500/20"
                          } rounded-xl bg-background dark:bg-foreground text-foreground dark:text-background placeholder-gray-400 focus:outline-none focus:ring-4 transition-all text-base font-medium`}
                          placeholder={tf(
                            "contactForm.phonePlaceholder",
                            "+8801XXXXXXXXX"
                          )}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-2 font-medium">
                            {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-foreground dark:text-background mb-2.5">
                        {t("contactForm.messageLabel")}
                      </label>
                      <textarea
                        name="message"
                        rows="5"
                        value={form.message}
                        onChange={handleChange}
                        className="w-full px-5 py-4 border-2 border-border dark:border-muted-foreground rounded-xl bg-background dark:bg-foreground text-foreground dark:text-background placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all resize-none text-base font-medium"
                        placeholder={tf(
                          "contactForm.messagePlaceholder",
                          "How can we help you?"
                        )}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-linear-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-background py-5 px-8 rounded-xl font-black text-lg shadow-xl hover:shadow-2xl disabled:opacity-70 transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin h-6 w-6"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          {tf("contactForm.sending", "Sending...")}
                        </>
                      ) : (
                        <>
                          {tf("contactForm.sendMessage", "Send Message")}
                          <PaperAirplaneIcon className="w-6 h-6" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactForm;
