"use client"

import { NavLink, useLocation } from "react-router-dom"
import {
  ShoppingCart,
  CreditCard,
  History,
  Headphones,
  Settings,
  DollarSign,
  Server,
  RefreshCw,
  Bell,
  BookOpen,
  Menu,
  Phone,
  TrendingUp,
} from "lucide-react"
import { CSS_COLORS, THEME_COLORS } from "../constant/colors"
import { useEffect } from "react"

const Sidebar = ({ sidebarOpen, setSidebarOpen, user }) => {
  const location = useLocation()

  // Collapse sidebar on mobile after route change
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }, [location.pathname])

  const sidebarItems = [
    { icon: ShoppingCart, label: "New order", to: "/dashboard" },
    { icon: Phone, label: "Virtual Numbers", to: "/dashboard/virtual-numbers" },
    { icon: TrendingUp, label: "Boost Followers", to: "/dashboard/boost-followers" },
    { icon: CreditCard, label: "Add funds", to: "/dashboard/add-funds" },
    { icon: History, label: "Order history", to: "/dashboard/orders" },
    { icon: Headphones, label: "Customer Support", to: "/dashboard/support" },
    { icon: Settings, label: "Services", to: "/dashboard/services" },
    { icon: DollarSign, label: "Make money", to: "/dashboard/affiliate" },
    { icon: Server, label: "API", to: "/dashboard/api" },
    { icon: Bell, label: "Notifications", to: "/dashboard/notifications" },
    { icon: RefreshCw, label: "Updates", to: "/dashboard/updates" },
    { icon: BookOpen, label: "Tutorials", to: "/dashboard/tutorials" }
  ]

  return (
    <>
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 sm:w-72 lg:w-64
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${!sidebarOpen ? "pointer-events-none lg:pointer-events-auto" : ""}
          overflow-y-auto text-white
        `}
        style={{
          background: CSS_COLORS.background.sidebar,
          boxShadow: "4px 0 30px rgba(0,0,0,0.4)",
          borderRight: "1px solid rgba(22,163,74,0.15)",
        }}
      >
        {/* Subtle grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(22,163,74,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(22,163,74,0.04) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo & Toggle */}
          <div className="p-4 sm:p-5 lg:p-6 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Mesavhub" className="h-24 w-auto" />
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 rounded-lg transition-colors flex-shrink-0 hover:bg-white/10"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
              </button>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 sm:p-5 lg:p-6 border-b border-white/5">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 font-bold text-base ring-2 ring-green-500/40"
                style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)" }}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.username || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-base sm:text-lg">
                    {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-white font-semibold text-sm sm:text-base truncate">{user?.username || "Loading..."}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-xs text-green-400/80">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Title */}
          <div className="px-4 sm:px-5 lg:px-6 pt-5 pb-2">
            <span className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em]">
              Navigation
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-2 sm:px-3 pb-4">
            <div className="space-y-0.5">
              {sidebarItems.map((item, index) => {
                const isActive = location.pathname === item.to
                return (
                  <NavLink
                    key={index}
                    to={item.to}
                    className={`relative w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? "text-white font-semibold"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                    style={
                      isActive
                        ? {
                            background: CSS_COLORS.background.activeSidebar,
                            boxShadow: "0 4px 15px rgba(22,163,74,0.35)",
                          }
                        : {}
                    }
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-green-400" />
                    )}
                    <item.icon
                      className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors flex-shrink-0 ${
                        isActive ? "text-white" : "text-white/40 group-hover:text-white/80"
                      }`}
                    />
                    <span className="relative z-10 text-sm sm:text-sm truncate">{item.label}</span>
                  </NavLink>
                )
              })}
            </div>
          </nav>

          {/* Footer branding */}
          <div className="p-4 border-t border-white/5">
            <div className="text-[10px] text-white/20 text-center">© 2026 mesavhub.com</div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
