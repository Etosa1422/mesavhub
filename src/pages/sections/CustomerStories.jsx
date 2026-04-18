import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Star } from "lucide-react";

const testimonials = [
  { name: "Amara T.", role: "Influencer – Lagos", review: "I grew my Instagram from 800 to over 12,000 followers in two weeks through Mesavs. The orders were fast and the quality was solid. Absolutely worth it.", stars: 5 },
  { name: "Kevin M.", role: "Content Creator – Kenya", review: "Used the WhatsApp number verification multiple times. Works instantly every single time. No issues at all, and very affordable for bulk verifications.", stars: 5 },
  { name: "Sandra O.", role: "SMM Reseller – UK", review: "I run my own panel using their child panel feature. It has been the best business decision I made this year. My clients love the speed and reliability.", stars: 5 },
  { name: "Emeka J.", role: "Entrepreneur – Nigeria", review: "The TikTok views service is genuinely legit. My videos started trending after boosting them here. The panel is easy to use and prices are great.", stars: 5 },
  { name: "Priya K.", role: "Digital Marketer – India", review: "Mesavs is the only SMM panel I recommend to my clients now. From Telegram subscribers to YouTube Watch Hours, everything works perfectly.", stars: 5 },
  { name: "Chris D.", role: "Agency Owner – Ghana", review: "The API integration saved me so much time. I connected Mesavs to my custom dashboard and orders process automatically. Top-tier service.", stars: 5 },
];

const settings = {
  dots: true,
  infinite: true,
  autoplay: true,
  autoplaySpeed: 4000,
  speed: 400,
  slidesToShow: 3,
  slidesToScroll: 1,
  responsive: [
    { breakpoint: 1024, settings: { slidesToShow: 2 } },
    { breakpoint: 640, settings: { slidesToShow: 1 } },
  ],
};

const TestimonialsSection = () => (
  <section className="bg-gray-50 dark:bg-[#0a0a0f] py-24 px-6 overflow-hidden">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-14">
        <span className="text-brand-600 dark:text-brand-400 text-sm font-semibold uppercase tracking-widest mb-4 block">Reviews</span>
        <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white">Real people. Real results.</h2>
      </div>

      <Slider {...settings}>
        {testimonials.map((t, i) => (
          <div key={i} className="px-3">
            <div className="bg-white dark:bg-[#0f0f1a] border border-gray-100 dark:border-white/5 rounded-2xl p-6 hover:border-brand-300 dark:hover:border-brand-500/20 hover:shadow-md dark:hover:shadow-none transition-all duration-200">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-brand-500 text-brand-500 dark:fill-brand-400 dark:text-brand-400" />
                ))}
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-5">&ldquo;{t.review}&rdquo;</p>
              <div>
                <p className="text-gray-900 dark:text-white font-semibold text-sm">{t.name}</p>
                <p className="text-gray-400 dark:text-gray-600 text-xs mt-0.5">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  </section>
);

export default TestimonialsSection;