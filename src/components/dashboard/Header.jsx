"use client"
import NotificationButton from "./NotificationButton"
import { useState, useRef, useEffect } from "react"
import { LogOut, Globe, ChevronDown, Settings, Menu, Shield, Sun, Moon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../../context/ThemeContext"

const Header = ({
  sidebarOpen,
  setSidebarOpen,
  selectedCurrency,
  setSelectedCurrency,
  currencies,
  user,
  onLogout,
}) => {
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false)
  const currencyRef = useRef(null)
  const navigate = useNavigate()
  const isAdminImpersonating = localStorage.getItem('isAdminImpersonating') === 'true'
  const { isDark, toggle } = useTheme()

  // Handle return to admin
  const handleReturnToAdmin = () => {
    // Restore admin session
    const adminToken = sessionStorage.getItem('adminToken_backup')
    const adminData = sessionStorage.getItem('adminData_backup')
    
    if (adminToken && adminData) {
      localStorage.setItem('adminToken', adminToken)
      localStorage.setItem('adminData', adminData)
    }
    
    // Clear impersonation flags
    localStorage.removeItem('isAdminImpersonating')
    sessionStorage.removeItem('adminToken_backup')
    sessionStorage.removeItem('adminData_backup')
    
    // Clear user session
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    
    // Navigate to admin dashboard
    window.location.href = '/admin/dashboard'
  }

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setCurrencyDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-30 mx-2 sm:mx-4 mt-2 sm:mt-3 rounded-2xl shadow-sm overflow-hidden bg-white/90 dark:bg-[#0a0a0f]/90 backdrop-blur-xl border border-green-200/40 dark:border-brand-900/30"
      style={{ boxShadow: isDark ? "0 4px 20px rgba(22,163,74,0.1), 0 1px 3px rgba(0,0,0,0.3)" : "0 4px 20px rgba(22,163,74,0.08), 0 1px 3px rgba(0,0,0,0.05)" }}
    >
      {/* Top green accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-60" />

      <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-3.5">
        {/* Left side */}
        <div className="flex items-center space-x-3">
          {/* Hamburger Menu - Mobile only */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="block lg:hidden p-2 rounded-xl hover:bg-green-50 dark:hover:bg-green-950/40 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Page Title - Desktop */}
          <div className="hidden lg:flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl hover:bg-green-50 dark:hover:bg-green-950/40 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                Panel — <strong className="text-gray-800 dark:text-white font-semibold">Dashboard</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3">
          {/* Return to Admin Button */}
          {isAdminImpersonating && (
            <button
              onClick={handleReturnToAdmin}
              className="flex items-center space-x-1.5 sm:space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm"
              title="Return to Admin Panel"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Return to Admin</span>
            </button>
          )}

          {/* Currency Dropdown */}
          <div className="relative" ref={currencyRef}>
            <button
              onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
              className="flex items-center space-x-1 sm:space-x-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl border text-xs sm:text-sm transition-all duration-200 bg-green-50 dark:bg-green-950/30 border-green-200/60 dark:border-green-800/40 text-green-800 dark:text-green-300 hover:border-green-400/60 dark:hover:border-green-600/60"
            >
              <Globe className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              <span className="font-semibold">
                {selectedCurrency.symbol} {selectedCurrency.code}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform text-green-600/60 dark:text-green-400/60 ${currencyDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {currencyDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0d1a0f] border border-green-100 dark:border-green-900/50 rounded-2xl shadow-xl overflow-y-auto transition-all duration-150 z-50"
                style={{ maxHeight: "70vh", boxShadow: isDark ? "0 10px 40px rgba(0,0,0,0.5)" : "0 10px 40px rgba(22,163,74,0.12)" }}
              >
                {currencies.map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => {
                      setSelectedCurrency(currency)
                      setCurrencyDropdownOpen(false)
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left border-b last:border-b-0 border-green-50 dark:border-green-900/30 hover:bg-green-50 dark:hover:bg-green-950/40 transition-colors"
                  >
                    <Globe className="w-4 h-4 text-green-400" />
                    <div className="font-medium text-gray-700 dark:text-gray-300">
                      {currency.symbol} {currency.code}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <NotificationButton />

          {/* 🌙 Dark / Light toggle */}
          <button
            onClick={toggle}
            className="p-1.5 sm:p-2 rounded-full hover:bg-green-50 dark:hover:bg-green-950/40 transition-colors"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark
              ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 hover:text-green-600 transition-colors" />
            }
          </button>

          {/* ⚙️ Settings */}
          <button
            onClick={() => navigate(`/dashboard/account`)}
            className="p-1.5 sm:p-2 rounded-full hover:bg-green-50 dark:hover:bg-green-950/40 transition-colors"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors" />
          </button>

          {/* 🚪 Logout */}
          <button
            onClick={onLogout}
            className="text-white px-2 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center space-x-1 sm:space-x-2 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #16a34a, #15803d)",
              boxShadow: "0 4px 12px rgba(22,163,74,0.35)",
            }}
          >
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
