import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const bullets = [
  "Set your own prices and keep 100% of your profits",
  "White-label panel under your own brand name",
  "Automated order fulfillment via our API",
  "Both SMM and number verification services included",
];

const RiseSocial = () => (
  <section className="bg-white dark:bg-[#0f0f1a] py-24 px-6">
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div className="order-2 lg:order-1">
        <span className="text-brand-600 dark:text-brand-400 text-sm font-semibold uppercase tracking-widest block mb-4">Resellers</span>
        <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-6">
          Turn services into<br />a business.
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed mb-8">
          Launch your own SMM and verification panel in minutes. Mesavhub handles all fulfillment — you just focus on sales.
        </p>
        <ul className="space-y-3 mb-10">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-brand-600 dark:text-brand-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-300 text-sm">{b}</span>
            </li>
          ))}
        </ul>
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-7 py-3 rounded-full font-semibold text-sm transition-all duration-200 shadow-lg shadow-brand-600/20"
        >
          Start reselling now
        </Link>
      </div>
      <div className="order-1 lg:order-2 relative">
        <div className="relative rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-xl dark:shadow-none">
          <img
            src="/images/reseller.jpg"
            alt="Reseller panel"
            className="w-full h-72 object-cover"
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 to-brand-800/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white p-8">
              <p className="text-5xl font-black mb-2">100%</p>
              <p className="text-lg font-semibold">Your profit margin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default RiseSocial;