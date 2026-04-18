import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";

const BoostSection = () => (
  <section className="bg-gray-50 dark:bg-[#0a0a0f] py-16 px-6">
    <div className="max-w-6xl mx-auto">
      <div className="relative rounded-3xl overflow-hidden border border-brand-200 dark:border-brand-900/30 bg-gradient-to-br from-brand-50 to-brand-50 dark:from-brand-950/40 dark:to-[#0f0f1a] px-10 py-16">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-400/10 dark:bg-brand-700/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center mb-6 shadow-lg shadow-brand-600/25">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-4">
              Boost your accounts.<br />
              <span className="text-brand-600 dark:text-brand-400">Fast.</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed mb-8">
              Whether you need 100 followers today or 100,000 this month — Mesavhub delivers immediately. No waiting, no uncertainty.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-7 py-3 rounded-full font-semibold text-sm transition-all duration-200 shadow-lg shadow-brand-600/20"
            >
              Start boosting now
            </Link>
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-48 h-48 rounded-full bg-brand-600/10 dark:bg-brand-600/5 border border-brand-300 dark:border-brand-800/30 flex items-center justify-center">
              <TrendingUp className="w-20 h-20 text-brand-500 dark:text-brand-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default BoostSection;