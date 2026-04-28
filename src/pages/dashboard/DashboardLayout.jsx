import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "../../components/dashboard/Header";
import Sidebar from "../../components/dashboard/Sidebar";
import { getUserFromLocalStorage } from "../../utils/helpers";
import { CSS_COLORS } from "../../components/constant/colors";
import toast from "react-hot-toast";
import { fetchCurrencies } from "../../services/services";
import { fetchUserData, fetchActiveAnnouncements } from "../../services/userService";
import { X, Info, CheckCircle, AlertTriangle, AlertCircle, Megaphone } from "lucide-react";

const DISMISSED_KEY = "dismissed_announcements"

const ANNOUNCEMENT_TYPE = {
  info:    { icon: Info,          accent: "#3b82f6", iconBg: "rgba(59,130,246,0.12)",  pillBg: "rgba(59,130,246,0.08)",  pillBorder: "rgba(59,130,246,0.2)",  label: "Info" },
  success: { icon: CheckCircle,   accent: "#16a34a", iconBg: "rgba(22,163,74,0.12)",   pillBg: "rgba(22,163,74,0.08)",   pillBorder: "rgba(22,163,74,0.2)",   label: "Update" },
  warning: { icon: AlertTriangle, accent: "#f59e0b", iconBg: "rgba(245,158,11,0.12)",  pillBg: "rgba(245,158,11,0.08)",  pillBorder: "rgba(245,158,11,0.2)",  label: "Notice" },
  error:   { icon: AlertCircle,   accent: "#ef4444", iconBg: "rgba(239,68,68,0.12)",   pillBg: "rgba(239,68,68,0.08)",   pillBorder: "rgba(239,68,68,0.2)",   label: "Alert" },
}

// Currency utility functions
const convertAmount = (amount, fromRate, toRate) => {
  if (!amount || !fromRate || !toRate) return 0;
  const amountInUSD = amount / fromRate;
  return amountInUSD * toRate;
};

const formatCurrency = (amount, currency) => {
  if (!currency || amount === null || amount === undefined) return '0.00';
  const formattedAmount = parseFloat(amount).toFixed(2);
  return `${currency.symbol} ${formattedAmount}`;
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(() => getUserFromLocalStorage());
  const [selectedCurrency, setSelectedCurrency] = useState({ 
    code: "NGN", 
    symbol: "₦", 
    rate: 1 
  });
  const [currencies, setCurrencies] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [currentAnnouncementIdx, setCurrentAnnouncementIdx] = useState(0);

  const navigate = useNavigate();

  // Load currencies from backend
  useEffect(() => {
    const handleFetchCurrencies = async () => {
      try {
        const res = await fetchCurrencies();
        if (res?.data?.success && Array.isArray(res.data.currencies)) {
          setCurrencies(res.data.currencies);

          // Default to NGN if available
          const ngnCurrency = res.data.currencies.find(c => c.code === "NGN");
          if (ngnCurrency) setSelectedCurrency(ngnCurrency);
        }
      } catch (err) {
        console.error("Failed to load currencies", err);
      }
    };

    handleFetchCurrencies();
  }, []);

  // Currency conversion function
  const convertToSelectedCurrency = (amount, sourceCurrency = "NGN") => {
    if (!amount || !selectedCurrency?.rate) return 0;
    
    const sourceCurrencyObj = currencies.find(c => c.code === sourceCurrency) || { rate: 1 };
    const sourceRate = sourceCurrencyObj.rate || 1;
    const targetRate = selectedCurrency.rate || 1;
    
    return convertAmount(amount, sourceRate, targetRate);
  };

  // Load user data — lazy init already pre-populates from localStorage;
  // this effect refreshes balance from the API on every mount.
  useEffect(() => {
    const stored = getUserFromLocalStorage();
    if (!stored) { handleLogout(); return; }

    fetchUserData()
      .then((res) => {
        const fresh = res?.data;
        if (fresh) {
          setUser(fresh);
          localStorage.setItem('userData', JSON.stringify(fresh));
        }
      })
      .catch(() => { /* keep showing stored data on network error */ });

  }, []);

  // Fetch announcements independently so they appear as fast as possible
  useEffect(() => {
    fetchActiveAnnouncements().then((list) => {
      const dismissed = JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]");
      const unseen = list.filter(a => !dismissed.includes(a.id));
      if (unseen.length > 0) {
        setAnnouncements(unseen);
        setCurrentAnnouncementIdx(0);
      }
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const dismissAnnouncement = (id) => {
    const dismissed = JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]");
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...dismissed, id]));
    setAnnouncements(prev => {
      const remaining = prev.filter(a => a.id !== id);
      setCurrentAnnouncementIdx(0);
      return remaining;
    });
  };

  const currentAnnouncement = announcements[currentAnnouncementIdx] || null;

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden relative bg-gradient-to-br from-brand-50 via-white to-brand-50 dark:from-[#0a0a0f] dark:via-[#0a0a0f] dark:to-[#0a0a0f]">
      {/* Grid background pattern — matches home page */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(22,163,74,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(22,163,74,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(22,163,74,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(22,163,74,0.04)_1px,transparent_1px)]"
        style={{ backgroundSize: "60px 60px" }}
      />
      {/* Glow blob */}
      <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full z-0 bg-brand-400/5 dark:bg-brand-700/10 blur-[120px]" />

      {/* Announcement popup modal */}
      {currentAnnouncement && (() => {
        const cfg = ANNOUNCEMENT_TYPE[currentAnnouncement.type] || ANNOUNCEMENT_TYPE.info;
        const Icon = cfg.icon;
        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
            style={{ backgroundColor: "rgba(5,46,22,0.6)", backdropFilter: "blur(10px)", animation: "announceBgIn 0.25s ease" }}>

            {/* Card */}
            <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: "linear-gradient(180deg, #052e16 0%, #0a1a0f 100%)", border: "1px solid rgba(22,163,74,0.25)", animation: "announceCardIn 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>

              {/* Top accent stripe */}
              <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${cfg.accent}, ${cfg.accent}88)` }} />

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2">
                  {/* Type pill */}
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: cfg.pillBg, border: `1px solid ${cfg.pillBorder}`, color: cfg.accent }}>
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                  {/* Megaphone badge */}
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.2)", color: "#4ade80" }}>
                    <Megaphone className="w-3 h-3" />
                    Announcement
                  </span>
                </div>
                <button
                  onClick={() => dismissAnnouncement(currentAnnouncement.id)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                  onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.8)"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-4">
                {/* Icon + title */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: cfg.iconBg, border: `1px solid ${cfg.pillBorder}` }}>
                    <Icon className="w-4.5 h-4.5" style={{ color: cfg.accent }} />
                  </div>
                  <h3 className="font-bold text-white text-base leading-snug pt-1.5">{currentAnnouncement.title}</h3>
                </div>

                {/* Message */}
                <p className="text-sm leading-relaxed whitespace-pre-line pl-12"
                  style={{ color: "rgba(255,255,255,0.65)" }}>
                  {currentAnnouncement.message}
                </p>
              </div>

              {/* Footer */}
              <div className="px-5 pb-5 flex items-center justify-between gap-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
                {announcements.length > 1 ? (
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {currentAnnouncementIdx + 1} / {announcements.length}
                  </span>
                ) : <span />}

                <div className="flex gap-2">
                  {announcements.length > 1 && currentAnnouncementIdx < announcements.length - 1 && (
                    <button
                      onClick={() => setCurrentAnnouncementIdx(i => i + 1)}
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
                    >
                      Next
                    </button>
                  )}
                  <button
                    onClick={() => dismissAnnouncement(currentAnnouncement.id)}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{ background: `linear-gradient(135deg, #16a34a 0%, #15803d 100%)`, boxShadow: "0 0 16px rgba(22,163,74,0.35)" }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 24px rgba(22,163,74,0.55)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 16px rgba(22,163,74,0.35)"}
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Announcement keyframes */}
      <style>{`
        @keyframes announceBgIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes announceCardIn {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden transition-opacity duration-300"
          style={{ backgroundColor: "rgba(5,46,22,0.5)", backdropFilter: "blur(8px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        currencies={currencies}
        user={user}
        onLogout={handleLogout}
        convertToSelectedCurrency={convertToSelectedCurrency}
        formatCurrency={formatCurrency}
      />

      <div className="flex flex-1">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          selectedCurrency={selectedCurrency}
          convertToSelectedCurrency={convertToSelectedCurrency}
          formatCurrency={formatCurrency}
          user={user}
        />

        <main className="flex-1 lg:ml-64 overflow-x-hidden relative z-10">
          <div className="w-full min-h-[calc(100vh-4rem)] overflow-x-hidden">
            <div className="min-h-full px-2 pb-2 sm:px-3 sm:pb-3 md:px-4 md:pb-4 lg:px-6 lg:pb-6 w-full overflow-x-hidden">
              <Outlet context={{
                selectedCurrency,
                setSelectedCurrency,
                currencies,
                convertToSelectedCurrency,
                formatCurrency,
                user
              }} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;