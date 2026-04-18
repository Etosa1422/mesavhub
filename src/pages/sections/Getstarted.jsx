import { Link } from "react-router-dom";
import { ArrowRight, Zap } from "lucide-react";

const GetStarted = () => (
  <section className="bg-white dark:bg-[#0f0f1a] py-24 px-6">
    <div className="max-w-4xl mx-auto">
      <div className="relative bg-gradient-to-br from-brand-600 to-brand-700 dark:from-[#0a0a0f] dark:to-[#0a0a0f] border border-brand-400/20 dark:border-brand-900/30 rounded-3xl px-10 py-20 text-center overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[300px] bg-white/10 dark:bg-brand-700/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 dark:bg-brand-600/10 border border-white/30 dark:border-brand-500/20 rounded-full px-4 py-1.5 text-white dark:text-brand-400 text-xs font-semibold uppercase tracking-widest mb-8">
            <Zap className="w-3.5 h-3.5" />
            Get started today
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
            Your growth starts<br />
            <span className="text-white/80 dark:bg-gradient-to-r dark:from-brand-400 dark:to-brand-400 dark:bg-clip-text dark:text-transparent">right now.</span>
          </h2>

          <p className="text-white/80 dark:text-gray-400 text-lg max-w-xl mx-auto mb-10">
            Join thousands of creators and marketers using Mesavs to grow their social presence and verify accounts across 150+ countries.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 dark:bg-brand-600 dark:hover:bg-brand-500 text-brand-600 dark:text-white font-bold px-8 py-4 rounded-full transition-all duration-200 shadow-lg shadow-black/10 dark:shadow-brand-900/40 text-sm"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-full border border-white/30 dark:border-white/10 transition-all duration-200 text-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default GetStarted;