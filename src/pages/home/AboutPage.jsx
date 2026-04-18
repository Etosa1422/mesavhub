import { Link } from "react-router-dom";
import { Zap, Users, Globe, Shield, TrendingUp, ArrowRight } from "lucide-react";

const stats = [
  { value: "73,166+", label: "Active Users" },
  { value: "4.5M+", label: "Orders Fulfilled" },
  { value: "3,725", label: "Services" },
  { value: "150+", label: "Countries" },
];

const values = [
  { icon: Shield, title: "Reliability first", desc: "Every service on our platform is tested and monitored. We only offer what we can confidently deliver — consistently and on time." },
  { icon: Globe, title: "Built for everyone", desc: "From a solo creator in Lagos to a reseller agency in London, Mesavs is designed to serve users at every scale and location." },
  { icon: TrendingUp, title: "Always improving", desc: "We continuously add new services, update pricing, and improve our infrastructure based on user feedback and market demands." },
  { icon: Users, title: "Creator-led support", desc: "Our support team understands what creators and marketers actually need. Fast, real replies — no bots, no templated responses." },
];

const team = [
  { name: "Mesavs Team", role: "Founders & Engineers", emoji: "⚡" },
  { name: "Support Squad", role: "24/7 Customer Success", emoji: "🎧" },
  { name: "Provider Network", role: "Global Fulfillment Partners", emoji: "🌐" },
];

const AboutPage = () => (
  <div className="min-h-screen bg-white dark:bg-[#0a0a0f]">
    {/* Hero */}
    <section className="relative pt-28 pb-20 px-6 overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white dark:from-[#0a0a0f] dark:via-[#0a0a0f] dark:to-[#0a0a0f]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(22,163,74,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(22,163,74,0.05)_1px,transparent_1px)] bg-[size:50px_50px] dark:opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand-400/8 dark:bg-brand-700/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-brand-100 dark:bg-brand-950/60 border border-brand-300/60 dark:border-brand-700/40 rounded-full px-4 py-1.5 text-xs text-brand-700 dark:text-brand-400 font-semibold uppercase tracking-widest mb-6">
          <Zap className="w-3.5 h-3.5" />
          Who we are
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-5">
          About Mesavs
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
          Mesavs is an all-in-one social media marketing panel and virtual number verification platform — built for creators, marketers, and resellers worldwide.
        </p>
      </div>
    </section>

    {/* Stats strip */}
    <section className="bg-white dark:bg-[#0f0f1a] border-y border-gray-100 dark:border-white/5">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100 dark:divide-white/5">
        {stats.map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center py-10 px-6 text-center">
            <span className="text-3xl font-black bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent mb-1">{value}</span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">{label}</span>
          </div>
        ))}
      </div>
    </section>

    {/* Mission */}
    <section className="bg-gray-50 dark:bg-[#0a0a0f] py-24 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <div>
          <span className="text-brand-600 dark:text-brand-400 text-sm font-semibold uppercase tracking-widest block mb-4">Our Mission</span>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white leading-tight mb-5">
            Make social growth accessible to everyone.
          </h2>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
            We started Mesavs because the tools for growing a social media presence were either too expensive, too complicated, or simply unreliable. We set out to fix that.
          </p>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
            Today, Mesavs serves over 70,000 users across 150+ countries — from first-time content creators to professional marketing agencies managing thousands of orders per month.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {values.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white dark:bg-[#0f0f1a] border border-gray-100 dark:border-white/5 rounded-2xl p-5 hover:border-brand-300 dark:hover:border-brand-900/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950/50 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-gray-900 dark:text-white font-bold text-sm mb-1">{title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* What we offer */}
    <section className="bg-white dark:bg-[#0f0f1a] py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <span className="text-brand-600 dark:text-brand-400 text-sm font-semibold uppercase tracking-widest block mb-4">What We Offer</span>
        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-6">Two powerful tools. One platform.</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mt-10">
          <div className="bg-gray-50 dark:bg-[#0a0a0f] border border-gray-100 dark:border-white/5 rounded-2xl p-8">
            <div className="text-3xl mb-4">📈</div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3">SMM Panel</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">
              Buy real followers, likes, views, subscribers, and more across Instagram, TikTok, YouTube, Telegram, Twitter, Facebook, Spotify and other platforms.
            </p>
            <ul className="space-y-2">
              {["Real, high-retention engagement", "Instant delivery on most services", "3,725+ services to choose from", "API access for automation"].map(i => (
                <li key={i} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />{i}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-50 dark:bg-[#0a0a0f] border border-gray-100 dark:border-white/5 rounded-2xl p-8">
            <div className="text-3xl mb-4">📱</div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3">Number Verification</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">
              Get virtual SMS verification numbers from 150+ countries. Instantly receive OTPs on WhatsApp, Telegram, Instagram, Facebook, and dozens more.
            </p>
            <ul className="space-y-2">
              {["150+ countries supported", "Instant SMS delivery", "No personal SIM required", "Bulk verification available"].map(i => (
                <li key={i} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />{i}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>

    {/* Team */}
    <section className="bg-gray-50 dark:bg-[#0a0a0f] py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <span className="text-brand-600 dark:text-brand-400 text-sm font-semibold uppercase tracking-widest block mb-4">The Team</span>
        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-12">People behind Mesavs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {team.map(({ name, role, emoji }) => (
            <div key={name} className="bg-white dark:bg-[#0f0f1a] border border-gray-100 dark:border-white/5 rounded-2xl p-8 hover:border-brand-300 dark:hover:border-brand-900/40 transition-all">
              <div className="text-4xl mb-4">{emoji}</div>
              <h3 className="text-gray-900 dark:text-white font-bold text-base mb-1">{name}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="bg-white dark:bg-[#0f0f1a] py-20 px-6 border-t border-gray-100 dark:border-white/5">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Join thousands of Mesavs users</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Start growing your accounts today — it takes less than 2 minutes to get set up.</p>
        <Link to="/signup" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-full font-bold text-sm transition-all shadow-lg shadow-brand-600/20">
          Get Started Free <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  </div>
);

export default AboutPage;