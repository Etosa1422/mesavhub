import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "../../components/dashboard/Header";
import Sidebar from "../../components/dashboard/Sidebar";
import { getUserFromLocalStorage } from "../../utils/helpers";
import { CSS_COLORS } from "../../components/constant/colors";
import toast from "react-hot-toast";
import { fetchCurrencies } from "../../services/services";
import { fetchUserData } from "../../services/userService";

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

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden relative bg-gradient-to-br from-brand-50 via-white to-brand-50 dark:from-[#0a0a0f] dark:via-[#0a0a0f] dark:to-[#0a0a0f]">
      {/* Grid background pattern — matches home page */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(22,163,74,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(22,163,74,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(22,163,74,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(22,163,74,0.04)_1px,transparent_1px)]"
        style={{ backgroundSize: "60px 60px" }}
      />
      {/* Glow blob */}
      <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full z-0 bg-brand-400/5 dark:bg-brand-700/10 blur-[120px]" />

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