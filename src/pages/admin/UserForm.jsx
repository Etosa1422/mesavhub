"use client"

import {
  User,
  Mail,
  Phone,
  Globe,
  DollarSign,
  MapPin,
  Shield,
  Check,
  X
} from "lucide-react"

const UserForm = ({ 
  formData, 
  editingUser, 
  onInputChange, 
  onSubmit, 
  onClose 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {editingUser ? "Edit User" : "Add New User"}
          </h2>
          <p className="text-gray-600 mt-1 text-sm">
            {editingUser ? "Update user information" : "Create a new user account"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="self-end sm:self-auto p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              First Name
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={onInputChange}
              placeholder="Enter first name"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Last Name
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={onInputChange}
              placeholder="Enter last name"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={onInputChange}
              placeholder="Enter username"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onInputChange}
              placeholder="Enter email address"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onInputChange}
              placeholder="Enter phone number"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-2" />
              Preferred Language
            </label>
            <select
              name="preferred_language"
              value={formData.preferred_language}
              onChange={onInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white transition-all duration-200 text-sm"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Initial Balance
            </label>
            <input
              type="number"
              name="balance"
              value={formData.balance}
              onChange={onInputChange}
              placeholder="0.00"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
            <select
              name="account_type"
              value={formData.account_type}
              onChange={onInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white transition-all duration-200 text-sm"
            >
              <option value="basic">Basic</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={onInputChange}
            placeholder="Enter user address..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none text-sm"
          />
        </div>

        {/* Status and Verification Checkboxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Account Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={onInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white transition-all duration-200 text-sm"
            >
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="email_verified"
              checked={formData.email_verified}
              onChange={onInputChange}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">Email Verified</label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="sms_verified"
              checked={formData.sms_verified}
              onChange={onInputChange}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">SMS Verified</label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="two_factor_enabled"
              checked={formData.two_factor_enabled}
              onChange={onInputChange}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">2FA Enabled</label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium text-sm"
          >
            <Check className="w-4 h-4" />
            {editingUser ? "Update User" : "Add User"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserForm