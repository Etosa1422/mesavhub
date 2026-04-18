"use client"

import { useState } from "react"
import { X, Settings } from "lucide-react"
import toast from "react-hot-toast"
import { setCustomRateForUser } from "../../services/adminService"

const CustomRateForm = ({ user, onCancel }) => {
  const [service, setService] = useState("")
  const [rate, setRate] = useState("")
  const [type, setType] = useState("percentage")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await setCustomRateForUser(
        user.id,
        service,
        parseFloat(rate),
        type
      )

      toast.success(response.message || "Custom rate saved")
      setService("")
      setRate("")
      setType("percentage")
      onCancel?.()
    } catch (error) {
      if (error.response) {
        const res = error.response.data
        if (res.errors) {
          Object.entries(res.errors).forEach(([field, messages]) => {
            toast.error(`${field}: ${messages.join(', ')}`)
          })
        } else {
          toast.error(res.message || "Something went wrong.")
        }
      } else {
        toast.error("Network error.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Set Custom Rate for {user.username}
          </h2>
          <p className="text-gray-600 mt-1 text-sm">Configure special pricing for this user.</p>
        </div>
        <button
          onClick={onCancel}
          className="self-end sm:self-auto p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
            required
          >
            <option value="">Select a service</option>
            <option value="instagram_followers">Instagram Followers</option>
            <option value="youtube_views">YouTube Views</option>
            <option value="twitter_followers">Twitter Followers</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rate Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
              required
            >
              <option value="percentage">Percentage Discount</option>
              <option value="fixed">Fixed Price</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {type === "percentage" ? "Discount Percentage" : "Fixed Price"}
            </label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder={type === "percentage" ? "0.00%" : "0.00"}
              step="0.01"
              min="0"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-50"
        >
          <Settings className="w-4 h-4" />
          {loading ? "Setting..." : "Set Custom Rate"}
        </button>
      </form>
    </div>
  )
}

export default CustomRateForm
