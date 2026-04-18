"use client"

import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import { Loader2, Send, Info, X, Calendar, Tag, FileText, Search, RefreshCw } from "lucide-react"
import { createServiceUpdate, ServiceUpdateHistory } from "../../services/adminService"

const AdminUpdates = ({ onCancel }) => {
  const [formData, setFormData] = useState({
    service: "",
    details: "",
    date: new Date().toISOString().split('T')[0], // Default to today
    update: "",
    category: "",
  })
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  
  const categories = ["all", "TikTok", "Twitter", "YouTube", "Instagram", "Facebook", "Spotify", "Other"]
  
  const categoryColors = {
    TikTok: "bg-pink-100 text-pink-700 border-pink-200",
    Twitter: "bg-green-100 text-green-700 border-green-200",
    YouTube: "bg-red-100 text-red-700 border-red-200",
    Instagram: "bg-green-100 text-green-700 border-green-200",
    Facebook: "bg-green-50 text-green-800 border-green-200",
    Spotify: "bg-green-100 text-green-700 border-green-200",
    Other: "bg-gray-100 text-gray-700 border-gray-200",
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await createServiceUpdate(formData)
      toast.success(res.message || "Service update saved successfully")

      // Reset form
      setFormData({
        service: "",
        details: "",
        date: new Date().toISOString().split('T')[0],
        update: "",
        category: "",
      })

      // Refresh history after new update
      fetchHistory()

      onCancel?.()
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save update")
    } finally {
      setLoading(false)
    }
  }

  // Fetch history
  const fetchHistory = async () => {
    try {
      setHistoryLoading(true)
      setHistoryError(null)
      const res = await ServiceUpdateHistory()
      
      // Handle different response formats
      const historyData = Array.isArray(res?.data) 
        ? res.data 
        : (res?.data?.data || [])
      
      setHistory(historyData || [])
    } catch (err) {
      console.error('Error fetching history:', err)
      setHistoryError(err?.response?.data?.message || err.message || "Failed to fetch history")
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const filteredHistory = history.filter(item => {
    const matchesSearch = !searchQuery || 
      (item.service || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.update || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.details || '').toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = filterCategory === "all" || 
      (item.category || '').toLowerCase() === filterCategory.toLowerCase()
    
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Service Updates</h1>
              <p className="text-gray-600 text-sm mt-1">
                Create and manage service update announcements for users
              </p>
            </div>
            {onCancel && (
              <button
                onClick={onCancel}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
                Close
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Add New Update
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Fill out the form below to create a service update entry.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Service */}
              <div>
                <label htmlFor="service" className="block text-sm font-semibold text-gray-700 mb-2">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  placeholder="e.g. Instagram Followers | Slow Speed"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                  required
                />
              </div>

              {/* Details */}
              <div>
                <label htmlFor="details" className="block text-sm font-semibold text-gray-700 mb-2">
                  Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="details"
                  name="details"
                  rows="3"
                  value={formData.details}
                  onChange={handleChange}
                  placeholder="Describe the service update in detail..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm resize-none"
                  required
                />
              </div>

              {/* Date & Update */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm bg-white"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.filter(cat => cat !== 'all').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Update */}
              <div>
                <label htmlFor="update" className="block text-sm font-semibold text-gray-700 mb-2">
                  Update Message <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="update"
                  name="update"
                  value={formData.update}
                  onChange={handleChange}
                  placeholder="E.g. Rate decreased from NGN 11309.27 to NGN 11299.25"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      service: "",
                      details: "",
                      date: new Date().toISOString().split('T')[0],
                      update: "",
                      category: "",
                    })
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Save Update
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* History Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Info className="w-5 h-5 text-green-600" />
                  Update History
                </h2>
                <button
                  onClick={fetchHistory}
                  disabled={historyLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${historyLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search updates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {historyLoading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
              </div>
            ) : historyError ? (
              <div className="text-red-700 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="font-medium">Error loading history</p>
                <p className="text-sm mt-1">{historyError}</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No updates found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {history.length === 0 ? 'Create your first service update!' : 'Try adjusting your search or filter'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all bg-gray-50"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.service || 'N/A'}</h3>
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${categoryColors[item.category] || categoryColors.Other}`}>
                          {item.category || 'Uncategorized'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    {item.details && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.details}</p>
                    )}
                    <p className="text-sm font-medium text-gray-900">{item.update || 'N/A'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminUpdates
