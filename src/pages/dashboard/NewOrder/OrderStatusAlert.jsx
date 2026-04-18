"use client"
import React from "react"
import { CheckCircle2, AlertCircle } from "lucide-react"

const OrderStatusAlert = ({ orderStatus, setOrderStatus }) => {
  if (!orderStatus) return null

  return (
    <div
      className={`fixed top-2 right-2 left-2 sm:top-4 sm:right-4 sm:left-4 sm:left-auto sm:max-w-md z-50 p-3 sm:p-4 rounded-lg shadow-lg ${
        orderStatus.success 
          ? "bg-green-100 text-green-800 border border-green-200" 
          : "bg-red-100 text-red-800 border border-red-200"
      }`}
    >
      <div className="flex items-start">
        {orderStatus.success ? (
          <CheckCircle2 className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm sm:text-base">
            {orderStatus.success ? "🎉 Success!" : "❌ Error!"}
          </p>
          <p className="text-xs sm:text-sm mt-1 break-words">{orderStatus.message}</p>
          
          {/* Show detailed balance information for insufficient balance errors */}
          {!orderStatus.success && orderStatus.details && orderStatus.details.shortfall && (
            <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
              <p className="text-xs font-medium text-red-700">Balance Details:</p>
              <div className="text-xs text-red-600 mt-1 space-y-1">
                <p>Required: ${orderStatus.details.requiredAmount}</p>
                <p>Current: ${orderStatus.details.currentBalance}</p>
                <p className="font-semibold">Shortfall: ${orderStatus.details.shortfall}</p>
              </div>
            </div>
          )}
          
          {orderStatus.success && orderStatus.orderId && (
            <p className="text-xs mt-2 font-medium">
              Order ID: <span className="font-bold">{orderStatus.orderId}</span>
            </p>
          )}
        </div>
        <button
          onClick={() => setOrderStatus(null)}
          className="ml-2 text-gray-500 hover:text-gray-700 flex-shrink-0"
          aria-label="Close alert"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default OrderStatusAlert
