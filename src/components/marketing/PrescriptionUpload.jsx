import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function PrescriptionUpload() {
  return (
    <section className="w-full bg-gray-900 py-20 min-h-[500px] relative flex items-center">
      <img src="/prescription.jpg" alt="Prescription" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-emerald-900/60 to-cyan-900/70" />
      <div className="relative z-10 px-6 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-white mb-4">📄 Upload Your Prescription</h2>
        <p className="text-white/90 text-xl max-w-2xl mb-8">Licensed pharmacists review and deliver to your doorstep with expert care and precision.</p>
        <Link to="/prescription" className="inline-flex items-center gap-3 bg-white text-emerald-600 px-10 py-6 rounded-2xl font-bold text-xl shadow-2xl hover:scale-105 transition-transform">
          <span>💊 Upload Now</span>
          <ArrowRightIcon className="w-6 h-6" />
        </Link>
      </div>
    </section>
  );
}
