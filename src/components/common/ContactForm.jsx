import { useState } from "react";
import { PaperAirplaneIcon, CheckCircleIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, ClockIcon, ShieldCheckIcon, UserGroupIcon } from "@heroicons/react/24/outline";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = "Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) err.email = "Valid email required";
    if (!form.phone.trim()) err.phone = "Phone is required";
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
    <section className="w-full py-20 px-4 sm:px-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-bold mb-4">
            CONTACT US
          </span>
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            Let's Start a Conversation
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Have questions about our services? Our expert team is ready to help you 24/7.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Side - Contact Info (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Contact Card with Gradient */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-cyan-600 p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <PhoneIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">Get in Touch</h3>
                    <p className="text-emerald-100 text-sm">We're here to help</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <PhoneIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm mb-1">Call Us</div>
                      <a href="tel:+8801700000000" className="text-emerald-100 hover:text-white transition-colors font-semibold">
                        +880 1700-000000
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <EnvelopeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-bold text-sm mb-1">Email Us</div>
                      <a href="mailto:support@online24pharmacy.com" className="text-emerald-100 hover:text-white transition-colors font-semibold text-sm break-all">
                        support@online24pharmacy.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPinIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm mb-1">Visit Us</div>
                      <div className="text-emerald-100 font-semibold">Dhaka, Bangladesh</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: ClockIcon, value: "24/7", label: "Support", color: "emerald" },
                { icon: UserGroupIcon, value: "10K+", label: "Customers", color: "cyan" },
                { icon: ShieldCheckIcon, value: "100%", label: "Secure", color: "emerald" }
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 text-center shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all">
                  <stat.icon className={`w-8 h-8 mx-auto mb-3 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  <div className={`text-3xl font-black text-${stat.color}-600 dark:text-${stat.color}-400 mb-1`}>{stat.value}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Form (3 cols) */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 sm:p-10 shadow-2xl border border-gray-200 dark:border-gray-700">
              {success ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircleIcon className="w-14 h-14 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Message Sent Successfully!</h3>
                  <p className="text-xl text-gray-600 dark:text-gray-300">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Send us a Message</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">Fill out the form below and our team will respond as soon as possible.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className={`w-full px-5 py-4 border-2 ${errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-gray-300 dark:border-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20"} rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 transition-all text-base font-medium`}
                        placeholder="Enter your full name"
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-2 font-medium">{errors.name}</p>}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2.5">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          className={`w-full px-5 py-4 border-2 ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-gray-300 dark:border-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20"} rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 transition-all text-base font-medium`}
                          placeholder="your@email.com"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-2 font-medium">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2.5">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          className={`w-full px-5 py-4 border-2 ${errors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-gray-300 dark:border-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20"} rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 transition-all text-base font-medium`}
                          placeholder="+880 1700-000000"
                        />
                        {errors.phone && <p className="text-red-500 text-sm mt-2 font-medium">{errors.phone}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2.5">
                        Your Message
                      </label>
                      <textarea
                        name="message"
                        rows="5"
                        value={form.message}
                        onChange={handleChange}
                        className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all resize-none text-base font-medium"
                        placeholder="Tell us how we can help you..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white py-5 px-8 rounded-xl font-black text-lg shadow-xl hover:shadow-2xl disabled:opacity-70 transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Sending Message...
                        </>
                      ) : (
                        <>
                          Send Message
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
