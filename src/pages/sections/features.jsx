import { HeadphonesIcon, Shield, DollarSign, Globe } from "lucide-react";

const cards = [
  { icon: HeadphonesIcon, gradient: "from-brand-500 to-brand-600", title: "Dedicated Support", desc: "Round-the-clock support via live chat and ticket system. We respond fast, every time." },
  { icon: Shield, gradient: "from-brand-500 to-pink-600", title: "High Quality", desc: "Only real, high-retention engagement from verified networks. No bots, no drops." },
  { icon: DollarSign, gradient: "from-brand-500 to-teal-600", title: "Lowest Prices", desc: "Industry-leading prices with bulk discounts. More value, less spend — always." },
  { icon: Globe, gradient: "from-orange-500 to-amber-500", title: "All-Country SIM", desc: "Virtual SMS verification numbers for 150+ countries. One platform for every platform." },
];

const HomeFeatures = () => (
  <section className="bg-white dark:bg-[#0a0a0f] py-24 px-6">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-14">
        <span className="text-brand-600 dark:text-brand-400 text-sm font-semibold uppercase tracking-widest mb-4 block">Features</span>
        <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white">Why thousands choose us</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map(({ icon: Icon, gradient, title, desc }) => (
          <div key={title} className="bg-gray-50 dark:bg-[#0f0f1a] border border-gray-100 dark:border-white/5 rounded-2xl p-7 hover:-translate-y-1 hover:border-brand-300 dark:hover:border-brand-500/30 hover:shadow-lg dark:hover:shadow-none transition-all duration-200 group">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-gray-900 dark:text-white font-bold text-base mb-2">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HomeFeatures;