import { useState } from "react";
import { X } from "lucide-react";

const steps = [
  { num: "01", title: "Create your account", desc: "Sign up in under a minute. No credit card required to get started." },
  { num: "02", title: "Add funds", desc: "Top up your balance using any supported payment method — instant credit." },
  { num: "03", title: "Place your order", desc: "Choose a service, enter your link or number, set quantity and submit." },
  { num: "04", title: "Watch it grow", desc: "Track delivery in real time from your dashboard. Most orders start within seconds." },
];

const HowItWorks = () => {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <section className="bg-gray-50 dark:bg-[#0a0a0f] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-brand-600 dark:text-brand-400 text-sm font-semibold uppercase tracking-widest mb-4 block">How it works</span>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white">Up and running in 4 steps</h2>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(({ num, title, desc }, i) => (
            <div key={num} className="relative bg-white dark:bg-[#0f0f1a] border border-gray-100 dark:border-white/5 rounded-2xl p-7 hover:border-brand-300 dark:hover:border-brand-500/30 hover:shadow-md dark:hover:shadow-none transition-all duration-200">
              <span className="text-7xl font-black text-brand-100 dark:text-brand-900/40 leading-none block mb-4">{num}</span>
              <h3 className="text-gray-900 dark:text-white font-bold text-base mb-2">{title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-brand-200 dark:bg-brand-900/40 z-10" />
              )}
            </div>
          ))}
        </div>

        {/* Video CTA */}
        <div className="mt-12 bg-white dark:bg-[#0f0f1a] border border-gray-100 dark:border-white/5 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm dark:shadow-none">
          <div>
            <p className="text-gray-900 dark:text-white font-bold text-lg mb-1">See a full walkthrough</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Watch our 3-minute beginner guide to placing your first order.</p>
          </div>
          <button
            onClick={() => setVideoOpen(true)}
            className="flex-shrink-0 inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 shadow-lg shadow-brand-600/20"
          >
            ▶ Watch Video
          </button>
        </div>
      </div>

      {/* Video modal */}
      {videoOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            <iframe
              src="https://www.youtube.com/embed/ggCXWAJ1gRA?autoplay=1&controls=1"
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default HowItWorks;