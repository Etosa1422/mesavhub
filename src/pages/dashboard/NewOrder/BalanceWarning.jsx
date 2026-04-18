"use client"
import React from "react"
import { AlertTriangle, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

const BalanceWarning = ({ selectedService, quantity, totalCost, convertedBalance, formattedTotalCost, formattedBalance, formatCurrency, selectedCurrency }) => {
  const navigate = useNavigate()
  if (!selectedService || !quantity || totalCost <= convertedBalance) return null

  const shortfall = totalCost - convertedBalance
  const formattedShortfall = formatCurrency(shortfall, selectedCurrency)
  const progressPct = Math.min((convertedBalance / totalCost) * 100, 100)

  return (
    <div className="mb-4 rounded-xl overflow-hidden border border-red-200 dark:border-red-900/40">
      <div className="h-0.5 w-full bg-gradient-to-r from-red-400 via-orange-400 to-red-500" />
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/30 px-3 py-2.5 flex items-center gap-3">
        {/* Icon */}
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/40 flex-shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-red-700 dark:text-red-400 leading-tight">Insufficient Balance</p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Cost <span className="font-semibold text-gray-700 dark:text-gray-200">{formattedTotalCost}</span>
            </span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Balance <span className="font-semibold text-gray-700 dark:text-gray-200">{formattedBalance}</span>
            </span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="text-xs font-bold text-red-600 dark:text-red-400">Need {formattedShortfall} more</span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/dashboard/add-funds')}
          className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition-all active:scale-95 flex-shrink-0"
        >
          Top Up
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

export default BalanceWarning

