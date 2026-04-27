import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LoginSection from "./LoginSection";
import StatsDashboard from "../sections/Statistics";
import Why from "../sections/why";
import HomeFeatures from "../sections/features";
import RiseSocial from "../sections/Ready";
import SmmServicesInsight from "../sections/ServicesInsight";
import PaymentSection from "../sections/PaymentSection";
import BoostSection from "../sections/BoostSection";
import HowItWorks from "../sections/how";
import FaqSection from "../sections/Faq";
import TestimonialsSection from "../sections/CustomerStories";
import GetStarted from "../sections/Getstarted";

const badges = ["Instagram", "TikTok", "WhatsApp", "YouTube", "Telegram", "Twitter"];

const HomePage = () => {
  // Render hero + login + stats immediately for fast first paint.
  // Everything below the fold is deferred to after the first browser paint.
  const [belowFoldReady, setBelowFoldReady] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setBelowFoldReady(true), 0);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white">
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white dark:from-[#0a0a0f] dark:via-[#0a0a0f] dark:to-[#0a0a0f]">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(124,58,237,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(124,58,237,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />
        {/* Glow blobs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-400/10 dark:bg-brand-700/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-400/8 dark:bg-brand-800/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand-100 dark:bg-brand-950/60 border border-brand-300/60 dark:border-brand-700/40 rounded-full px-4 py-1.5 text-xs text-brand-600 dark:text-brand-300 font-medium mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 dark:bg-brand-400 animate-pulse" />
            Social Media Boosting + All-Country Number Verification
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight tracking-tight mb-6 text-gray-900 dark:text-white">
            Grow Faster.<br />
            <span className="bg-gradient-to-r from-brand-600 via-brand-600 to-brand-500 dark:from-brand-400 dark:via-brand-400 dark:to-brand-400 bg-clip-text text-transparent">
              Verify Anywhere.
            </span>
          </h1>

          <p className="text-gray-600 dark:text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Mesavhub is the most complete SMM panel for real followers, likes, views plus virtual SMS number verification for every country and every platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Link
              to="/signup"
              className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-full font-bold text-base transition-all duration-200 shadow-xl shadow-brand-600/25 hover:shadow-brand-500/35 hover:scale-105"
            >
              Start Free Today
            </Link>
            <Link
              to="/login"
              className="bg-white hover:bg-gray-50 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white px-8 py-4 rounded-full font-bold text-base transition-all duration-200 shadow-sm"
            >
              Login
            </Link>
          </div>

          {/* Platform badges */}
          <div className="flex flex-wrap justify-center gap-3">
            {badges.map((b) => (
              <span key={b} className="px-4 py-1.5 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 text-xs font-medium shadow-sm">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      <LoginSection />
      <StatsDashboard />

      {belowFoldReady && <>
        <Why />
        <HomeFeatures />
        <SmmServicesInsight />
        <RiseSocial />
        <BoostSection />
        <PaymentSection />
        <HowItWorks />
        <FaqSection />
        <TestimonialsSection />
        <GetStarted />
      </>}
    </div>
  );
};

export default HomePage;