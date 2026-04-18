import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const categories = [
  { id: "general", label: "General" },
  { id: "smm", label: "SMM Services" },
  { id: "numbers", label: "Number Verification" },
  { id: "billing", label: "Billing & Payments" },
  { id: "resellers", label: "Resellers & API" },
];

const faqs = {
  general: [
    { q: "What is Mesavhub?", a: "Mesavhub is an all-in-one SMM (Social Media Marketing) panel and virtual number verification platform. We offer over 3,725 social media services and virtual phone numbers from 150+ countries." },
    { q: "Who is Mesavhub for?", a: "Mesavhub serves everyone from individual content creators and influencers to marketing agencies and automated reseller panels. Whether you need 100 followers or 100,000 orders per month, we scale with you." },
    { q: "Is my account information safe?", a: "Yes. We use industry-standard encryption for passwords and sensitive data. We never sell your personal information to third parties. You can review our full Privacy Policy for details." },
    { q: "How do I get started?", a: "Create a free account, add funds to your balance, and place your first order. The whole process takes under 2 minutes. No credit card required just to sign up." },
    { q: "Is Mesavhub available worldwide?", a: "Yes. Mesavhub is available in 150+ countries. Most payment methods work globally, and services are available for all major platforms regardless of your location." },
    { q: "Do I need technical knowledge to use Mesavhub?", a: "Not at all. Our dashboard is designed to be simple for beginners. Just pick a service, enter your link, set a quantity, and place your order. Advanced users can use our API." },
  ],
  smm: [
    { q: "What platforms do you support?", a: "We support Instagram, TikTok, YouTube, Twitter/X, Facebook, Telegram, Spotify, WhatsApp, LinkedIn, Snapchat, and more. Browse all services in the Services page." },
    { q: "Are the followers and likes real?", a: "Yes — all services on Mesavhub use real, active accounts. We do not use bots. Follower retention rates are consistently high because the engagement comes from genuine profiles." },
    { q: "How fast is delivery?", a: "Most services start within minutes of placing your order. Speed depends on the service type — some are instant, while others run gradually to appear natural. Each service listing shows the estimated delivery time." },
    { q: "Can I place multiple orders at once?", a: "Yes. Use the Mass Order feature in your dashboard to place orders for multiple links simultaneously. This is ideal for agencies managing many accounts." },
    { q: "What happens if my order doesn't complete?", a: "If an order drops or fails to complete, we issue an automatic refill or credit back the remaining amount to your balance. Contact support if an issue persists for more than 24 hours." },
    { q: "Will platforms ban my account for using Mesavhub?", a: "Our services are designed to appear organic and avoid triggering platform spam detection. However, no third-party service can 100% guarantee platform safety. We recommend using gradual services for sensitive accounts." },
    { q: "Can I cancel an order after placing it?", a: "Orders cannot be cancelled once they begin processing. Please review your order details carefully before confirming. Unstarted orders may be eligible for a refund depending on the service." },
  ],
  numbers: [
    { q: "What is virtual number verification?", a: "Virtual number verification lets you receive SMS OTPs (One-Time Passwords) on a temporary virtual number — without needing a real SIM card. It is commonly used for account registrations and verifications." },
    { q: "Which apps can I verify with virtual numbers?", a: "You can verify accounts on WhatsApp, Telegram, Instagram, Facebook, Twitter, Gmail, Signal, Viber, TikTok, and dozens more. The service listing shows exactly which apps each number type supports." },
    { q: "How many countries are available?", a: "We offer virtual numbers from 150+ countries including the US, UK, Nigeria, India, Germany, Russia, Brazil, and more. Coverage varies by app and country." },
    { q: "How quickly does the SMS arrive?", a: "Most SMS messages arrive within 60 seconds. If you do not receive it within 2–5 minutes, you can request a resend or use a different number from another country." },
    { q: "Are virtual numbers reusable?", a: "By default, numbers are single-use and assigned to you temporarily for one verification. Bulk or extended-use number options are available in the service listings — check for 'multi-use' labels." },
    { q: "Can I use virtual numbers for WhatsApp accounts?", a: "Yes. WhatsApp verification is one of the most popular use cases. Simply select the WhatsApp number service, copy your assigned number, enter it on WhatsApp, and wait for the OTP." },
  ],
  billing: [
    { q: "How do I add funds to my account?", a: "Go to Add Funds in your dashboard. We support multiple payment methods depending on your region — credit/debit cards, cryptocurrency, and various local payment options. Minimum top-up amounts vary by method." },
    { q: "Is there a minimum or maximum balance?", a: "Minimum deposit amounts depend on the payment method selected. There is no maximum balance limit. Your balance never expires." },
    { q: "Does my balance expire?", a: "No. Your Mesavhub balance does not expire as long as your account remains in good standing." },
    { q: "Can I get a refund to my original payment method?", a: "Refunds are returned to your Mesavhub balance, not to the original payment method. We do not process cash refunds. Exceptions may be considered for technical billing errors — contact support." },
    { q: "What currencies do you support?", a: "The platform operates in USD. Your balance is stored and displayed in USD. Some payments may show a converted amount at checkout depending on your selected payment gateway." },
    { q: "Is there a transaction fee?", a: "Mesavhub does not charge internal transaction fees for balance top-ups. However, your payment processor may apply their own processing fees. These are not controlled by Mesavhub." },
  ],
  resellers: [
    { q: "Can I resell Mesavhub services on my own panel?", a: "Yes. Mesavhub is fully reseller-friendly. You can connect our services to your own website or panel via the Mesavhub API. Set your own prices and keep the difference." },
    { q: "How do I access the API?", a: "Go to the API page in your dashboard to find your API key and documentation. The API is RESTful and compatible with all major panel scripts including SMM-Script, Just Another Panel, and more." },
    { q: "Is there a reseller discount?", a: "Our pricing is already some of the lowest in the market to support resellers. There are no special 'reseller tiers' — all users pay the same competitive prices shown on the Services page." },
    { q: "Are there rate limits on the API?", a: "The API allows a reasonable number of requests per minute for normal usage. Excessive automated requests that impact platform stability may be rate-limited. Contact support if you have high-volume needs." },
    { q: "Can I create a child panel?", a: "Yes. The Child Panel feature lets you create sub-accounts under your main account — useful for businesses with multiple clients or team members." },
    { q: "What happens if a service breaks on my reseller panel?", a: "If a service is disrupted on Mesavhub' end, it will affect your reseller panel too. We communicate service outages through platform notifications. Refunds are processed automatically for incomplete orders." },
  ],
};

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden transition-all ${open ? "bg-brand-50/60 dark:bg-brand-950/20 border-brand-200 dark:border-brand-900/30" : "bg-white dark:bg-[#0f0f1a]"}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer"
      >
        <span className="text-gray-900 dark:text-white font-semibold text-sm leading-snug">{q}</span>
        <ChevronDown className={`w-4 h-4 text-brand-500 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed border-t border-gray-100 dark:border-white/5 pt-4">{a}</p>
        </div>
      )}
    </div>
  );
};

const FaqPage = () => {
  const [activeCategory, setActiveCategory] = useState("general");
  const items = faqs[activeCategory] || [];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f]">
      {/* Hero */}
      <section className="relative pt-28 pb-16 px-6 bg-gradient-to-b from-brand-50 via-white to-white dark:from-[#0a0a0f] dark:via-[#0a0a0f] dark:to-[#0a0a0f]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(22,163,74,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(22,163,74,0.05)_1px,transparent_1px)] bg-[size:50px_50px] dark:opacity-40" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-100 dark:bg-brand-950/60 border border-brand-300/60 dark:border-brand-700/40 rounded-full px-4 py-1.5 text-xs text-brand-700 dark:text-brand-400 font-semibold uppercase tracking-widest mb-6">
            <HelpCircle className="w-3.5 h-3.5" />
            Help Center
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Browse answers to the most common questions about Mesavhub. Can't find what you're looking for? <a href="/contact" className="text-brand-600 dark:text-brand-400 hover:underline">Contact us</a>.
          </p>
        </div>
      </section>

      {/* Category tabs */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-[#0a0a0f]/95 backdrop-blur-md border-b border-gray-100 dark:border-white/5 px-6 py-3">
        <div className="max-w-3xl mx-auto flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === id
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                  : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ list */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto space-y-3">
          {items.map(({ q, a }) => (
            <FAQItem key={q} q={q} a={a} />
          ))}
        </div>
      </section>

      {/* Still need help */}
      <div className="bg-brand-50 dark:bg-brand-950/20 border-t border-brand-100 dark:border-brand-900/30 py-14 px-6 text-center">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Still have questions?</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Our support team is available 24/7 to help with anything not covered here.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="/contact" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-full text-sm font-bold transition-all shadow-lg shadow-brand-600/20">
            Contact Support
          </a>
          <a href="/dashboard/support" className="inline-flex items-center gap-2 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-brand-300 dark:hover:border-brand-700 px-6 py-3 rounded-full text-sm font-bold transition-all">
            Open a Ticket
          </a>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;