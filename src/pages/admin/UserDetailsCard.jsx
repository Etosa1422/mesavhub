"use client"

import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Key,
  Copy,
  Camera,
  DollarSign,
  Lock,
  CheckCircle,
  Smartphone,
  X,
  ArrowLeft,
  ShoppingCart,
  Receipt,
  Settings as SettingsIcon,
  Send,
  LogIn,
  History,
  Edit3,
  Power
} from "lucide-react"
import { useState } from "react"
import UserActions from "./UserActions" // Import the UserActions component



const UserDetailsCard = ({ 
  user, 
  onClose,
  onCopyApiKey,
  onEdit,
  onToggleStatus,
  showPasswordChange,
  onTogglePasswordChange,
  onPasswordUpdate,
  passwordData,
  onPasswordChange,
  onActionSelect,
}) => {
  const [currentModal, setCurrentModal] = useState(null)
  const [modalData, setModalData] = useState(null)

  const formatCurrency = (amount, currency = "NGN") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleActionSelect = (action, userData) => {
    setCurrentModal(action)
    setModalData(userData)
  }

  const closeModal = () => {
    setCurrentModal(null)
    setModalData(null)
  }

  const handleEdit = (user) => {
    setCurrentModal('edit_user')
    setModalData(user)
  }

  const handleToggleStatus = (userId) => {
    onToggleStatus(userId)
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-4 sm:p-6 mb-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-600 rounded-xl flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.username}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-green-200">
              <Camera className="w-3 h-3 text-green-600" />
            </div>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-green-600 font-medium">@{user.username}</p>
            <p className="text-sm text-gray-600">Joined {formatDate(user.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onCopyApiKey}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
          >
            <Key className="w-4 h-4" />
            Generate Key
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* API Key Section */}
      <div className="bg-white rounded-lg p-4 border border-green-100 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Key className="w-5 h-5 text-green-600" />
            API KEY
          </h3>
          <button
            onClick={onCopyApiKey}
            className="text-green-600 hover:text-green-700 transition-colors duration-200"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-800 break-all">
          {user.api_key || user.api_token || "No API key generated yet"}
        </div>
      </div>

      {/* User Actions Section */}
      <UserActions 
        user={user} 
        onActionSelect={onActionSelect || handleActionSelect}
        onEdit={onEdit}
        onToggleStatus={onToggleStatus}
      />

      {/* User Information Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        {/* Personal Info */}
        <div className="bg-white rounded-lg p-4 border border-green-100">
          <div className="flex items-center gap-3 mb-3">
            <User className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Personal Info</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-600">First Name</span>
                <p className="font-semibold text-gray-900">{user.first_name}</p>
              </div>
              <div>
                <span className="text-gray-600">Last Name</span>
                <p className="font-semibold text-gray-900">{user.last_name}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-600">Username</span>
                <p className="font-semibold text-gray-900">{user.username}</p>
              </div>
              <div>
                <span className="text-gray-600">Email</span>
                <p className="font-semibold text-gray-900 break-all">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg p-4 border border-green-100">
          <div className="flex items-center gap-3 mb-3">
            <Phone className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Contact Info</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Phone Number</span>
              <p className="font-semibold text-gray-900">{user.phone}</p>
            </div>
            <div>
              <span className="text-gray-600">Preferred Language</span>
              <p className="font-semibold text-gray-900">{user.preferred_language}</p>
            </div>
            <div>
              <span className="text-gray-600">Address</span>
              <p className="font-semibold text-gray-900">{user.address}</p>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-lg p-4 border border-green-100">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Account Info</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Balance</span>
              <p className="font-bold text-gray-900">{formatCurrency(user.balance, user.currency)}</p>
            </div>
            <div>
              <span className="text-gray-600">Total Orders</span>
              <p className="font-semibold text-gray-900">{user.total_orders}</p>
            </div>
            <div>
              <span className="text-gray-600">Total Spent</span>
              <p className="font-semibold text-gray-900">{formatCurrency(user.total_spent, user.currency)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Toggles */}
      <div className="bg-white rounded-lg p-4 border border-green-100 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          Account Status & Security
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Status</p>
            <div className="flex justify-center">
              <div className="flex bg-gray-100 rounded-full p-1">
                <button
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200 ${
                    user.status === "active" ? "bg-green-500 text-white" : "text-gray-600"
                  }`}
                >
                  Active
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200 ${
                    user.status === "banned" ? "bg-red-500 text-white" : "text-gray-600"
                  }`}
                >
                  Banned
                </button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Email Verification</p>
            <div className="flex justify-center">
              <div className="flex bg-gray-100 rounded-full p-1">
                <button
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200 ${
                    user.email_verified ? "bg-green-500 text-white" : "text-gray-600"
                  }`}
                >
                  Verified
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200 ${
                    !user.email_verified ? "bg-gray-500 text-white" : "text-gray-600"
                  }`}
                >
                  Unverified
                </button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">SMS Verification</p>
            <div className="flex justify-center">
              <div className="flex bg-gray-100 rounded-full p-1">
                <button
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200 ${
                    user.sms_verified ? "bg-green-500 text-white" : "text-gray-600"
                  }`}
                >
                  Verified
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200 ${
                    !user.sms_verified ? "bg-gray-500 text-white" : "text-gray-600"
                  }`}
                >
                  Unverified
                </button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">2FA Security</p>
            <div className="flex justify-center">
              <div className="flex bg-gray-100 rounded-full p-1">
                <button
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200 ${
                    user.two_factor_enabled ? "bg-green-500 text-white" : "text-gray-600"
                  }`}
                >
                  ON
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200 ${
                    !user.two_factor_enabled ? "bg-red-500 text-white" : "text-gray-600"
                  }`}
                >
                  OFF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Section */}
      <div className="bg-white rounded-lg p-4 border border-green-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-600" />
            Password Change
          </h3>
          <button
            onClick={onTogglePasswordChange}
            className="text-green-600 hover:text-green-700 transition-colors duration-200 text-sm font-medium"
          >
            {showPasswordChange ? "Cancel" : "Change Password"}
          </button>
        </div>

        {showPasswordChange && (
          <form onSubmit={onPasswordUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={onPasswordChange}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={onPasswordChange}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
            >
              <Lock className="w-4 h-4" />
              Update Password
            </button>
          </form>
        )}
      </div>

      {/* Modal Renderings */}
      {currentModal === 'add_subtract_balance' && (
        <AddBalanceModal 
          user={modalData} 
          onClose={closeModal} 
          onSuccess={() => {
            closeModal()
            // You might want to refresh user data here
          }}
        />
      )}

      {currentModal === 'order' && (
        <OrderModal 
          user={modalData} 
          onClose={closeModal} 
          onSuccess={closeModal}
        />
      )}

      {currentModal === 'transaction' && (
        <TransactionModal 
          user={modalData} 
          onClose={closeModal} 
          onSuccess={closeModal}
        />
      )}

      {currentModal === 'custom_rate' && (
        <CustomRateModal 
          user={modalData} 
          onClose={closeModal} 
          onSuccess={closeModal}
        />
      )}

      {currentModal === 'send_email' && (
        <SendEmailModal 
          user={modalData} 
          onClose={closeModal} 
          onSuccess={closeModal}
        />
      )}

      {currentModal === 'login_as_user' && (
        <LoginAsUserModal 
          user={modalData} 
          onClose={closeModal} 
          onSuccess={closeModal}
        />
      )}

      {currentModal === 'fund_log' && (
        <FundLogModal 
          user={modalData} 
          onClose={closeModal} 
          onSuccess={closeModal}
        />
      )}

      {currentModal === 'edit_user' && (
        <EditUserModal 
          user={modalData} 
          onClose={closeModal} 
          onSuccess={() => {
            closeModal()
            // You might want to refresh user data here
          }}
        />
      )}
    </div>
  )
}

export default UserDetailsCard