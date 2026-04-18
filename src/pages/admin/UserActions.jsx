"use client"

import { useState } from "react"
import {
  DollarSign,
  ShoppingCart,
  Receipt,
  Settings,
  Send,
  LogIn,
  History,
  Edit3,
  Power,
  Mail,
  Lock
} from "lucide-react"
import { useNavigate } from "react-router-dom"; 

const UserActions = ({ user, onActionSelect, onEdit, onToggleStatus }) => {
    const navigate = useNavigate();
  
    const handleView = () => {
      navigate(`/admin/users/${user.id}/View`);
      
    }; 
  return (
    <div className="bg-white rounded-lg p-4 border border-green-100 mb-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5 text-green-600" />
        User Actions
      </h3>
      <div className="flex flex-wrap gap-3">
        <button
            onClick={() => onActionSelect("add_subtract_balance", user)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
        >
          <DollarSign className="w-4 h-4" />
          Add/Subtract Balance
        </button>
        
        <button
           onClick={() => navigate(`/admin/users/${user.id}/orders`)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
        >
          <ShoppingCart className="w-4 h-4" />
          Order
        </button>
        <button
          onClick={() => navigate(`/admin/users/${user.id}/transactions`)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
        >
          <Receipt className="w-4 h-4" />
          Transaction
        </button>
        <button
          onClick={() => onActionSelect("custom_rate", user)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
        >
          <Settings className="w-4 h-4" />
          Custom Rate
        </button>
        <button
               onClick={() => onActionSelect("send_email", user)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
        >
          <Send className="w-4 h-4" />
          Send Email
        </button>
        <button
          onClick={() => onActionSelect("login_as_user", user)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
        >
          <LogIn className="w-4 h-4" />
          Login as User
        </button>
        <button
          onClick={() => onActionSelect("fund_log", user)}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
        >
          <History className="w-4 h-4" />
          Fund Log
        </button>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => onEdit(user)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
        >
          <Edit3 className="w-4 h-4" />
          Edit User
        </button>
        <button
          onClick={() => onToggleStatus(user.id)}
          className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium ${
            user.status === "active"
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          <Power className="w-4 h-4" />
          {user.status === "active" ? "Ban User" : "Activate User"}
        </button>
        <button
          onClick={() => onActionSelect("send_email", user)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
        >
          <Mail className="w-4 h-4" />
          Send Email
        </button>
      </div>
    </div>
  )
}

export default UserActions