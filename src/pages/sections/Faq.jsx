import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqData = [
  { question: "What is Mesavhub.com?", answer: "Mesavhub.com is a social media marketing panel and virtual number verification platform. You can buy real engagement  followers, likes, views  and get virtual SMS numbers for any country to verify accounts on WhatsApp, Instagram, Telegram, TikTok, and more." },
  { question: "How does the SMM panel work?", answer: "You select a service (e.g. Instagram followers), enter the target URL or username, choose a quantity, and place your order. Delivery starts automatically through our network of providers." },
  { question: "What is number verification?", answer: "Number verification lets you receive SMS codes on a virtual phone number from any country. Use it to register or verify accounts on social platforms without using your personal number." },
  { question: "Which countries are supported for number verification?", answer: "We support virtual numbers from 150+ countries including the US, UK, Nigeria, India, Ghana, Kenya, Canada, and many more. Almost every major country is supported." },
  { question: "How do I earn money as a reseller?", answer: "Create a child panel under your own brand, set your own pricing, and resell our services. Keep 100% of your profit margin. Many resellers earn consistent daily income this way." },
  { question: "What is a child panel?", answer: "A child panel is a white-label version of Mesavhub. It runs under your own name and pricing but uses our backend infrastructure for order fulfillment  including both SMM and number verification services." },
];

const FaqSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const toggle = (i) => setActiveIndex(i === activeIndex ? null : i);

  return (
    <section className="bg-white dark:bg-[#0f0f1a] py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-brand-600 dark:text-brand-400 text-sm font-semibold uppercase tracking-widest mb-4 block">FAQs</span>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white">Got questions?</h2>
        </div>

        <div className="space-y-3">
          {faqData.map((item, i) => (
            <div
              key={i}
              className={`bg-gray-50 dark:bg-[#0a0a0f] border rounded-xl overflow-hidden transition-all duration-200 ${
                activeIndex === i
                  ? "border-brand-400 dark:border-brand-500/40 shadow-sm dark:shadow-none"
                  : "border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10"
              }`}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
              >
                <span className={`font-semibold text-sm transition-colors ${activeIndex === i ? "text-brand-600 dark:text-brand-300" : "text-gray-900 dark:text-white"}`}>
                  {item.question}
                </span>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${activeIndex === i ? "bg-brand-600" : "bg-gray-200 dark:bg-white/5"}`}>
                  {activeIndex === i
                    ? <Minus className="w-3.5 h-3.5 text-white" />
                    : <Plus className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />}
                </div>
              </button>
              {activeIndex === i && (
                <div className="px-6 pb-5 text-gray-500 dark:text-gray-400 text-sm leading-relaxed border-t border-gray-100 dark:border-white/5 pt-4">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;