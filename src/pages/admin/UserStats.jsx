"use client"

import { User, CheckCircle, Mail, DollarSign } from "lucide-react"

const UserStats = ({ users = [], formatCurrency }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Total Users</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900">{users.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Active Users</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900">
              {users.filter((u) => u.status === "active").length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Verified Users</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900">
              {users.filter((u) => u.email_verified).length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Total Balance</p>
            <p className="text-sm sm:text-xl font-bold text-gray-900">
              {formatCurrency(users.reduce((sum, u) => sum + (u.balance || 0), 0), { symbol: "₦" })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserStats