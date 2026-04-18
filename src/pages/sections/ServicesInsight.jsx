import { useState } from "react";
import { Link } from "react-router-dom";

const platforms = [
  { emoji: "📸", name: "Instagram", title: "Instagram Growth", desc: "Followers, likes, views, story views, reel plays — all real, all fast. Build credibility and reach on Instagram from day one." },
  { emoji: "🎵", name: "TikTok", title: "TikTok Boost", desc: "Followers, hearts, video views, and live stream viewers. Go viral with TikToks that the algorithm actually promotes." },
  { emoji: "📱", name: "WhatsApp", title: "WhatsApp Verification", desc: "Virtual numbers for WhatsApp OTP receiving from 150+ countries. Create or verify accounts instantly without your personal SIM." },
  { emoji: "▶️", name: "YouTube", title: "YouTube Growth", desc: "Watch Hours, subscribers, views, and likes. Monetize faster and grow a real audience that stays." },
  { emoji: "✈️", name: "Telegram", title: "Telegram Members", desc: "Members, post views, reactions, and channel boosts. Grow active Telegram communities that engage with your content." },
  { emoji: "🐦", name: "Twitter", title: "Twitter/X Growth", desc: "Followers, retweets, likes, and impressions. Increase your reach and get verified-looking authority on Twitter/X." },
  { emoji: "🌐", name: "Other", title: "Other Platforms", desc: "Facebook, Snapchat, LinkedIn, Spotify, SoundCloud and more. One panel for every platform you market on." },
];

const SmmServicesInsight = () => {
  const [active, setActive] = useState(0);
  const p = platforms[active];

  return (
    <section className="bg-gray-50 dark:bg-[#0a0a0f] py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <span className="text-brand-600 dark:text-brand-400 text-sm font-semibold uppercase tracking-widest mb-4 block">Our Services</span>
        <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-10">Pick your platform</h2>

        {/* Tab pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {platforms.map(({ emoji, name }, i) => (
            <button
              key={name}
              onClick={() => setActive(i)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                i === active
                  ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25"
                  : "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-brand-400 dark:hover:border-brand-500/30 hover:text-brand-600 dark:hover:text-white"
              }`}
            >
              {emoji} {name}
            </button>
          ))}
        </div>

        {/* Content card */}
        <div className="bg-white dark:bg-[#0f0f1a] border border-gray-100 dark:border-white/5 rounded-2xl p-10 shadow-sm dark:shadow-none">
          <div className="text-5xl mb-4">{p.emoji}</div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">{p.title}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed max-w-xl mx-auto mb-8">{p.desc}</p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-7 py-3 rounded-full font-semibold text-sm transition-all duration-200 shadow-lg shadow-brand-600/20"
          >
            Get started with {p.name}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SmmServicesInsight;