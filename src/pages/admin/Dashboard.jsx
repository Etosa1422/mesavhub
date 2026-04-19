import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, DollarSign, ShoppingBag, TrendingUp, Calendar, UserPlus, Clock, BarChart3 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {AdminDashboard} from "../../services/adminService"

const Dashboard = () => {
  // Get currency context from AdminLayout
  const context = useOutletContext();
  const {
    selectedCurrency: contextSelectedCurrency,
    convertToSelectedCurrency: contextConvertToSelectedCurrency,
    formatCurrency: contextFormatCurrency,
  } = context || {};

  // Default currency if not provided
  const selectedCurrency = contextSelectedCurrency || { 
    code: "NGN", 
    symbol: "₦", 
    rate: 1 
  };

  // Fallback functions if not provided
  const convertToSelectedCurrency = contextConvertToSelectedCurrency || ((amount, sourceCurrency = "NGN") => {
    if (!amount || !selectedCurrency?.rate) return 0;
    return amount * (selectedCurrency.rate || 1);
  });

  const formatCurrency = contextFormatCurrency || ((amount, currency) => {
    if (!currency || amount === null || amount === undefined) return '0.00';
    const formattedAmount = parseFloat(amount).toFixed(2);
    return `${currency?.symbol || '₦'} ${formattedAmount}`;
  });

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await AdminDashboard();
        setDashboardData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data');
        toast.error(err.response?.data?.message || 'Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format price using currency conversion (same as user side)
  const formatPrice = (price) => {
    if (!price || price === null || price === undefined) return formatCurrency(0, selectedCurrency);
    const convertedPrice = convertToSelectedCurrency(price, "NGN");
    return formatCurrency(convertedPrice, selectedCurrency);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const StatCard = ({ title, value, icon: Icon, iconColor, trend, subtitle }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-300 hover:border-gray-200 h-full">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
          <p className="text-xl font-bold text-gray-900 mb-1 break-words leading-tight">{value}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
            <Icon className="w-4 h-4" style={{ color: iconColor }} />
          </div>
        </div>
      </div>
      {trend && (
        <div className="pt-3 border-t border-gray-50">
          <div className="flex items-center">
            <TrendingUp className="w-3 h-3 text-emerald-500 mr-2 flex-shrink-0" />
            <span className="text-xs text-emerald-600 font-medium">{trend}</span>
          </div>
        </div>
      )}
    </div>
  );

  const Last30DaysCard = ({ data }) => {
    // Calculate average order value
    const avgOrderValue = data?.totalAmountReceived && data?.orders?.records?.totalOrder
      ? data.totalAmountReceived / data.orders.records.totalOrder
      : 0;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 col-span-full">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mr-3">
            <BarChart3 className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Last 30 Days Overview</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Revenue</p>
            <p className="text-lg font-bold text-gray-900 break-words">
              {formatPrice(data?.transactionProfit?.profit_30_days)}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Orders</p>
            <p className="text-lg font-bold text-gray-900 break-words">
              {formatNumber(data?.orders?.records?.totalOrder)}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">New Users</p>
            <p className="text-lg font-bold text-gray-900 break-words">
              {formatNumber(data?.userRecord?.totalUser)}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Avg Order Value</p>
            <p className="text-lg font-bold text-gray-900 break-words">
              {formatPrice(avgOrderValue)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-md text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading dashboard</h3>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Monitor your business performance and key metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={formatNumber(dashboardData?.userRecord?.totalUser)}
            icon={Users}
            iconColor="#3B82F6"
            trend="+12% from last month"
          />
          
          <StatCard
            title="Total Balance"
            value={formatPrice(dashboardData?.userRecord?.totalUserBalance)}
            icon={DollarSign}
            iconColor="#10B981"
            trend="+8% from last month"
          />
          
          <StatCard
            title="Total Orders"
            value={formatNumber(dashboardData?.totalOrder)}
            icon={ShoppingBag}
            iconColor="#8B5CF6"
            trend="+15% from last month"
          />
          
          <StatCard
            title="Funds Collected"
            value={formatPrice(dashboardData?.totalAmountReceived)}
            icon={TrendingUp}
            iconColor="#F59E0B"
            trend="+22% from last month"
          />
        </div>

        {/* Today's Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Today's Performance
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <StatCard
              title="Today's Profit"
              value={formatPrice(dashboardData?.transactionProfit?.profit_today)}
              icon={DollarSign}
              iconColor="#DC2626"
              subtitle="Real-time earnings"
            />
            
            <StatCard
              title="Today's Orders"
              value={formatNumber(dashboardData?.orders?.records?.todaysOrder)}
              icon={ShoppingBag}
              iconColor="#7C3AED"
              subtitle="Orders placed today"
            />
            
            <StatCard
              title="New Users Today"
              value={formatNumber(dashboardData?.userRecord?.todayJoin)}
              icon={UserPlus}
              iconColor="#059669"
              subtitle="Fresh registrations"
            />
          </div>
        </div>

        {/* Last 30 Days Overview */}
        <div className="mb-8">
          <Last30DaysCard data={dashboardData} />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-center border border-gray-100 min-h-[80px] flex flex-col items-center justify-center">
              <Users className="w-5 h-5 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Manage Users</span>
            </button>
            <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-center border border-gray-100 min-h-[80px] flex flex-col items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">View Orders</span>
            </button>
            <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-center border border-gray-100 min-h-[80px] flex flex-col items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Financial Reports</span>
            </button>
            <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-center border border-gray-100 min-h-[80px] flex flex-col items-center justify-center">
              <BarChart3 className="w-5 h-5 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;