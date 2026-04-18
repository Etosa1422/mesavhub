"use client"
import React from "react"

const StatsCards = ({ user, formattedBalance, selectedCurrency }) => {
  return (
    <>
      {/* Mobile Stats Cards - Vertical Stack */}
      <div className="lg:hidden space-y-3 w-full">
        <div className="bg-white dark:bg-[#0f0f1a] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5 w-full overflow-hidden">
          <div className="flex items-center space-x-3">
            <div className="text-3xl flex-shrink-0">💰</div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Balance</p>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate">{formattedBalance}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#0f0f1a] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
          <div className="flex items-center space-x-3">
            <div className="text-3xl flex-shrink-0">👑</div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate">{user?.status || "NEW"}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#0f0f1a] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
          <div className="flex items-center space-x-3">
            <div className="text-3xl flex-shrink-0">👤</div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Username</p>
              <h3 
                className="text-base font-bold text-gray-800 dark:text-white truncate break-words"
                title={user?.username || "loading.."}
              >
                {user?.username || "loading.."}
              </h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#0f0f1a] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
          <div className="flex items-center space-x-3">
            <div className="text-3xl flex-shrink-0">📦</div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Orders</p>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">{user?.total_orders || "0"}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Stats Cards */}
      <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-[#0f0f1a] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 transition-all duration-300 hover:shadow-md hover:border-brand-200 dark:hover:border-brand-500/30">
          <div className="flex items-center space-x-4">
            <div className="text-4xl flex-shrink-0">💰</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Account Balance</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white truncate">{formattedBalance}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#0f0f1a] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 transition-all duration-300 hover:shadow-md hover:border-brand-200 dark:hover:border-brand-500/30">
          <div className="flex items-center space-x-4">
            <div className="text-4xl flex-shrink-0">👑</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Account Status</p>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white truncate">{user?.status || "NEW"}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#0f0f1a] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 transition-all duration-300 hover:shadow-md hover:border-brand-200 dark:hover:border-brand-500/30">
          <div className="flex items-center space-x-4">
            <div className="text-4xl flex-shrink-0">👤</div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Username</p>
              <h3 
                className="text-xl font-bold text-gray-800 dark:text-white truncate break-all"
                title={user?.username || "loading.."}
              >
                {user?.username || "loading.."}
              </h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#0f0f1a] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 transition-all duration-300 hover:shadow-md hover:border-brand-200 dark:hover:border-brand-500/30">
          <div className="flex items-center space-x-4">
            <div className="text-4xl flex-shrink-0">📦</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{user?.total_orders || "0"}</h3>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default StatsCards
