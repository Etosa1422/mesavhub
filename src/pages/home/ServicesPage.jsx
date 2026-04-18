import { useEffect, useState, useRef } from "react";
import { Search, Filter, Clock, ChevronDown, ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchAllSmmServices, fetchCurrencies } from "../../services/services";

const platforms = [
  {
    name: "All",
    emoji: "🌐",
    desc: "Browse our full catalog — SMM services and number verification across every major platform.",
  },
  {
    name: "Instagram",
    emoji: "📸",
    desc: "Followers, likes, views, story views, reel plays, saves, and comments. Build real credibility fast.",
    keywords: ["instagram"],
  },
  {
    name: "TikTok",
    emoji: "🎵",
    desc: "Followers, hearts, video views, live stream viewers, and shares. Get your content on the For You Page.",
    keywords: ["tiktok", "tik tok"],
  },
  {
    name: "YouTube",
    emoji: "▶️",
    desc: "Watch Hours, subscribers, views, likes, and comments. Hit monetization requirements faster.",
    keywords: ["youtube", "yt"],
  },
  {
    name: "Telegram",
    emoji: "✈️",
    desc: "Channel members, post views, reactions, and channel boosts. Grow an engaged Telegram community.",
    keywords: ["telegram"],
  },
  {
    name: "WhatsApp",
    emoji: "📱",
    desc: "Virtual SMS numbers for WhatsApp OTP from 150+ countries. Instant delivery, no personal SIM needed.",
    keywords: ["whatsapp"],
  },
  {
    name: "Twitter",
    emoji: "🐦",
    desc: "Followers, retweets, likes, impressions, and views. Build authority on Twitter/X quickly.",
    keywords: ["twitter", "x "],
  },
  {
    name: "Facebook",
    emoji: "👥",
    desc: "Page likes, followers, post reactions, video views, and group members.",
    keywords: ["facebook", "fb"],
  },
  {
    name: "Spotify",
    emoji: "🎧",
    desc: "Streams, monthly listeners, followers, playlist plays. Grow your music presence organically.",
    keywords: ["spotify"],
  },
];

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({});
  const [symbols, setSymbols] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("NGN");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [loading, setLoading] = useState(true);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesRes, currencyRes] = await Promise.all([
          fetchAllSmmServices(),
          fetchCurrencies(),
        ]);
        if (servicesRes?.data?.success && Array.isArray(servicesRes.data.data)) {
          setServices(servicesRes.data.data);
        }
        if (currencyRes?.data?.success && Array.isArray(currencyRes.data.currencies)) {
          setCurrencies(currencyRes.data.currencies);
          const ratesObj = {};
          const symbolsObj = {};
          currencyRes.data.currencies.forEach((c) => {
            ratesObj[c.code] = c.rate;
            symbolsObj[c.code] = c.symbol || "";
          });
          setExchangeRates(ratesObj);
          setSymbols(symbolsObj);
        }
      } catch (err) {
        console.error("Error loading services:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCurrencyDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getConvertedRate = (rate) => {
    if (!exchangeRates[selectedCurrency]) return rate;
    return (rate * exchangeRates[selectedCurrency]).toFixed(2);
  };

  const activePlatform = platforms.find((p) => p.name === selectedPlatform) || platforms[0];

  const filteredServices = services.filter((s) => {
    const title = s.service_title?.toLowerCase() || "";
    const matchesSearch = title.includes(searchTerm.toLowerCase());
    const matchesPlatform =
      selectedPlatform === "All" ||
      (activePlatform.keywords || []).some((kw) => title.includes(kw));
    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f]">
      {/* ── Hero ── */}
      <section className="relative pt-28 pb-16 px-6 overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white dark:from-[#0a0a0f] dark:via-[#0a0a0f] dark:to-[#0a0a0f]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(22,163,74,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(22,163,74,0.05)_1px,transparent_1px)] bg-[size:50px_50px] dark:opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand-400/8 dark:bg-brand-700/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-100 dark:bg-brand-950/60 border border-brand-300/60 dark:border-brand-700/40 rounded-full px-4 py-1.5 text-xs text-brand-700 dark:text-brand-400 font-semibold uppercase tracking-widest mb-6">
            <Zap className="w-3.5 h-3.5" />
            SMM Panel + Number Verification
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-4">
            Our Services
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Real followers, likes, views and SMS verifications for every platform. Instant delivery, lowest prices, 150+ countries.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-7 py-3 rounded-full font-bold text-sm transition-all shadow-lg shadow-brand-600/20"
          >
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Platform Tabs ── */}
      <section className="bg-white dark:bg-[#0f0f1a] border-b border-gray-100 dark:border-white/5 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {platforms.map(({ name, emoji }) => (
              <button
                key={name}
                onClick={() => setSelectedPlatform(name)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  selectedPlatform === name
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20"
                    : "bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400"
                }`}
              >
                {emoji} {name}
              </button>
            ))}
          </div>

          {/* Platform description */}
          <div className="mt-5 max-w-2xl mx-auto text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              {activePlatform.desc}
            </p>
          </div>
        </div>
      </section>

      {/* ── Search + Currency + Table ── */}
      <section className="bg-gray-50 dark:bg-[#0a0a0f] py-10 px-6">
        <div className="max-w-7xl mx-auto">

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Currency dropdown */}
            <div className="relative sm:w-40" ref={dropdownRef}>
              <button
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="w-full flex items-center justify-between gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-brand-600/20"
              >
                <span>{selectedCurrency} {symbols[selectedCurrency] || ""}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${currencyDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {currencyDropdownOpen && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#0f0f1a] border border-gray-100 dark:border-white/10 rounded-xl shadow-xl max-h-52 overflow-y-auto z-30">
                  {currencies.length > 0 ? (
                    currencies.map((c) => (
                      <div
                        key={c.code}
                        onClick={() => { setSelectedCurrency(c.code); setCurrencyDropdownOpen(false); }}
                        className="px-4 py-2.5 cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-950/30 text-gray-800 dark:text-gray-200 text-sm font-medium transition-colors"
                      >
                        {c.code} {c.symbol || ""}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-400 text-sm">Loading...</div>
                  )}
                </div>
              )}
            </div>

            {/* Search bar */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-5 pr-14 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f0f1a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 transition-colors shadow-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-600 text-white p-1.5 rounded-lg">
                <Search className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
            {/* Header */}
            <div className="bg-brand-600 text-white">
              <div className="min-w-[700px] grid grid-cols-12 gap-4 px-5 py-4 text-xs font-bold uppercase tracking-wide">
                <div className="col-span-1">#</div>
                <div className="col-span-4">Service</div>
                <div className="col-span-2">Rate / 1000</div>
                <div className="col-span-1">Min</div>
                <div className="col-span-1">Max</div>
                <div className="col-span-2 flex items-center gap-1"><Clock className="w-3 h-3" /> Avg Time</div>
                <div className="col-span-1">Order</div>
              </div>
            </div>

            {/* Rows */}
            <div className="min-w-[700px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Loading services...</p>
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No services found.</p>
                  <p className="text-gray-400 dark:text-gray-600 text-sm mt-1">Try a different keyword or platform.</p>
                </div>
              ) : (
                filteredServices.map((service, idx) => (
                  <div
                    key={service.id}
                    className={`grid grid-cols-12 gap-4 px-5 py-4 items-center border-b border-gray-50 dark:border-white/5 transition-colors hover:bg-brand-50 dark:hover:bg-brand-950/20 ${idx % 2 === 0 ? "bg-white dark:bg-[#0f0f1a]" : "bg-gray-50/60 dark:bg-[#0f0f1a]/60"}`}
                  >
                    <div className="col-span-1 text-gray-400 dark:text-gray-600 text-xs font-mono">{service.id}</div>
                    <div className="col-span-4">
                      <p className="text-gray-800 dark:text-gray-200 font-semibold text-sm leading-snug">{service.service_title}</p>
                      {service.featured && (
                        <span className="inline-block mt-1 bg-brand-100 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400 px-2 py-0.5 rounded-full text-xs font-semibold">
                          ⚡ Featured
                        </span>
                      )}
                    </div>
                    <div className="col-span-2 text-brand-700 dark:text-brand-400 font-bold text-sm">
                      {symbols[selectedCurrency] || ""}{getConvertedRate(service.rate_per_1000)}
                    </div>
                    <div className="col-span-1 text-gray-600 dark:text-gray-400 text-sm">{service.min_amount}</div>
                    <div className="col-span-1 text-gray-600 dark:text-gray-400 text-sm">{service.max_amount}</div>
                    <div className="col-span-2 text-gray-500 dark:text-gray-500 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3 text-brand-500" />{service.average_time}
                    </div>
                    <div className="col-span-1">
                      <Link
                        to="/signup"
                        className="inline-flex items-center justify-center bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
                      >
                        Order
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {!loading && filteredServices.length > 0 && (
            <p className="text-center text-gray-400 dark:text-gray-600 text-xs mt-4">
              Showing {filteredServices.length} of {services.length} services
            </p>
          )}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="bg-white dark:bg-[#0f0f1a] py-16 px-6 border-t border-gray-100 dark:border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Ready to place your first order?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-base">Create a free account and get started in under 2 minutes.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-brand-600/20">
              Create Free Account
            </Link>
            <Link to="/" className="bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 px-8 py-3.5 rounded-full font-bold text-sm transition-all">
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;