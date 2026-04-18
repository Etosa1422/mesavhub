import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from '../../components/admin/Header';
import Sidebar from '../../components/admin/Sidebar';
import { getAdminFromLocalStorage } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { fetchCurrencies } from '../../services/services';

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

const AdminLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState({ 
    code: "NGN", 
    symbol: "₦", 
    rate: 1 
  });
  const [currencies, setCurrencies] = useState([]);

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

  useEffect(() => {
    const adminData = getAdminFromLocalStorage();
    if (adminData) {
      setAdmin(adminData);
    } else {
      handleLogout();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        admin={admin}
        onLogout={handleLogout}
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        currencies={currencies}
        convertToSelectedCurrency={convertToSelectedCurrency}
        formatCurrency={formatCurrency}
      />
      <div className="flex">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full lg:ml-72">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 min-h-[calc(100vh-8rem)]">
            <Outlet context={{
              selectedCurrency,
              setSelectedCurrency,
              currencies,
              convertToSelectedCurrency,
              formatCurrency,
              admin
            }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
