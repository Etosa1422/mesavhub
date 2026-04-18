const cards = [
  { num: "01", title: "Lightning Fast Delivery", desc: "Orders start processing within seconds of placement. We run one of the fastest fulfillment networks on the market." },
  { num: "02", title: "All-Country Verification", desc: "Get virtual SMS numbers from 150+ countries instantly. Verify any platform — WhatsApp, Telegram, Instagram and more." },
  { num: "03", title: "Reseller-Ready API", desc: "Full API access lets you automate orders, build your own panel, and scale your reselling business without limits." },
  { num: "04", title: "Transparent Pricing", desc: "No hidden fees. No surprises. The price you see is the price you pay — with bulk discounts available for power users." },
];

const Why = () => (
  <section className="bg-gray-50 dark:bg-[#0f0f1a] py-24 px-6">
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <div>
        <span className="text-brand-600 dark:text-brand-400 text-sm font-semibold uppercase tracking-widest block mb-4">Why Mesavhub</span>
        <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-6">
          Everything you need.<br />Nothing you don&apos;t.
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-4">
          We built Mesavhub around one idea: give creators and marketers a reliable, affordable tool that just works — every single time.
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
          From first-time buyers to high-volume resellers, our platform scales with you. No bloat. No guesswork.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map(({ num, title, desc }) => (
          <div key={num} className="bg-white dark:bg-[#0a0a0f] border border-gray-100 dark:border-white/5 rounded-2xl p-6 hover:border-brand-300 dark:hover:border-brand-500/30 hover:shadow-md dark:hover:shadow-none transition-all duration-200">
            <span className="text-4xl font-black text-brand-200 dark:text-brand-900/60 leading-none block mb-3">{num}</span>
            <h3 className="text-gray-900 dark:text-white font-bold text-sm mb-2">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Why;