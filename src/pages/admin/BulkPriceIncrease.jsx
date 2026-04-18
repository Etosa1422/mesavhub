"use client"

import { useState, useEffect } from "react"
import {
  TrendingUp,
  Package,
  BarChart3,
  AlertCircle,
  Check,
  X,
  Loader2,
  Globe,
  Server,
  Zap
} from "lucide-react"
import {
  applyServiceMarkup,
  getServicePriceStats,
  fetchApiProviders,
  fetchAdminCategories
} from "../../services/adminService"

const MARKUP_PRESETS = [0, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100]

const BulkPriceIncrease = () => {
  const [markup, setMarkup] = useState(20)
  const [scope, setScope] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedProvider, setSelectedProvider] = useState("")
  const [categories, setCategories] = useState([])
  const [providers, setProviders] = useState([])
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const scopeOptions = [
    { value: "all",      label: "All Services",    icon: Globe,    description: "Apply markup to every service" },
    { value: "category", label: "By Category",     icon: Package,  description: "Apply markup to one category only" },
    { value: "provider", label: "By API Provider", icon: Server,   description: "Apply markup to one provider only" },
  ]

  useEffect(() => {
    loadCategories()
    loadProviders()
  }, [])

  useEffect(() => {
    loadPriceStats()
  }, [scope, selectedCategory, selectedProvider])

  const loadCategories = async () => {
    try {
      const response = await fetchAdminCategories()
      const data = response?.data || response || []
      setCategories(Array.isArray(data) ? data : [])
    } catch {
      setCategories([])
    }
  }

  const loadProviders = async () => {
    try {
      const response = await fetchApiProviders()
      setProviders(Array.isArray(response) ? response : response?.data || [])
    } catch {
      setProviders([])
    }
  }

  const buildPreview = (statsData) => {
    if (!statsData) return
    const currentMarkup = statsData.average_markup ?? 0
    const divisor = 1 + (currentMarkup / 100)
    const providerAvg = divisor > 0 ? (statsData.average_price / divisor) : statsData.average_price
    const newAverage = providerAvg * (1 + markup / 100)
    return { providerAvg, newAverage, currentMarkup }
  }

  const loadPriceStats = async () => {
    try {
      setIsLoadingStats(true)
      const params = {}
      if (scope === "category" && selectedCategory) params.category_id = selectedCategory
      else if (scope === "provider" && selectedProvider) params.provider_id = selectedProvider

      const response = await getServicePriceStats(params)
      setStats(response?.data || response)
    } catch {
      setStats(null)
    } finally {
      setIsLoadingStats(false)
    }
  }

  const handleApplyMarkup = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      const payload = { markup, scope }
      if (scope === "category" && selectedCategory) payload.category_id = selectedCategory
      else if (scope === "provider" && selectedProvider) payload.provider_id = selectedProvider

      const response = await applyServiceMarkup(payload)
      setSuccess(response?.message || "Markup applied successfully!")
      await loadPriceStats()
      setTimeout(() => setSuccess(null), 6000)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to apply markup")
    } finally {
      setIsLoading(false)
    }
  }

  const getScopeLabel = () => scopeOptions.find(o => o.value === scope)?.label ?? ""
  const preview = stats ? buildPreview(stats) : null

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <span>Dashboard</span><span className="mx-2">/</span>
            <span>Services</span><span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Markup Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bulk Markup Management</h1>
          <p className="text-gray-600 mt-2">
            Set your profit margin above provider cost. Setting 20% twice still gives exactly 20% — no compounding.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="ml-3 text-sm text-red-700 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-600"><X className="h-4 w-4" /></button>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg flex items-center">
            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
            <p className="ml-3 text-sm text-green-700 flex-1">{success}</p>
            <button onClick={() => setSuccess(null)} className="ml-2 text-green-400 hover:text-green-600"><X className="h-4 w-4" /></button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-3 space-y-6">

            {/* Scope Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Scope</h2>
                  <p className="text-gray-600 text-sm">Which services to update</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {scopeOptions.map(({ value, label, icon: Icon, description }) => (
                  <button
                    key={value}
                    onClick={() => { setScope(value); setSelectedCategory(""); setSelectedProvider("") }}
                    className={`p-4 rounded-lg border transition-all text-left ${
                      scope === value
                        ? "bg-green-50 border-green-500 ring-2 ring-green-500 ring-opacity-20"
                        : "bg-white border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${scope === value ? "bg-green-600" : "bg-gray-100"}`}>
                        <Icon className={`w-4 h-4 ${scope === value ? "text-white" : "text-gray-600"}`} />
                      </div>
                      <span className={`font-medium ${scope === value ? "text-green-900" : "text-gray-900"}`}>{label}</span>
                    </div>
                    <p className="text-xs text-gray-500">{description}</p>
                  </button>
                ))}
              </div>

              {scope === "category" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Category</label>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Choose a category...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.category_title}</option>)}
                  </select>
                </div>
              )}

              {scope === "provider" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select API Provider</label>
                  <select
                    value={selectedProvider}
                    onChange={e => setSelectedProvider(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Choose a provider...</option>
                    {providers.map(p => <option key={p.id} value={p.id}>{p.api_name}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Markup Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Markup Percentage</h2>
                  <p className="text-gray-600 text-sm">Your profit above provider cost. Can be set up or down anytime.</p>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-2 mb-5">
                {MARKUP_PRESETS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setMarkup(opt)}
                    className={`py-3 rounded-lg border text-sm font-bold transition-all ${
                      markup === opt
                        ? "bg-green-600 text-white border-green-600 shadow"
                        : "bg-white text-gray-700 border-gray-200 hover:border-green-400 hover:bg-green-50"
                    }`}
                  >
                    {opt}%
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={markup}
                  onChange={e => setMarkup(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Custom markup %"
                />
                <span className="flex items-center px-4 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium">%</span>
              </div>
            </div>

            {/* Action Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Apply Markup</h2>
                  <p className="text-gray-600 text-sm">Review then apply</p>
                </div>
              </div>

              {/* Preview */}
              {preview && stats && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-medium text-green-900 mb-3">Preview</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-green-700">Scope:</span> <span className="font-medium text-green-900">{getScopeLabel()}</span></div>
                    <div><span className="text-green-700">Services:</span> <span className="font-medium text-green-900">{stats.total_services}</span></div>
                    <div><span className="text-green-700">Current markup:</span> <span className="font-medium text-green-900">{preview.currentMarkup?.toFixed(1)}%</span></div>
                    <div><span className="text-green-700">New markup:</span> <span className="font-bold text-green-600">{markup}%</span></div>
                    <div><span className="text-green-700">Current avg per 1k:</span> <span className="font-medium text-green-900">&#8358;{stats.average_price?.toFixed(4)}</span></div>
                    <div><span className="text-green-700">New avg per 1k:</span> <span className="font-bold text-green-600">&#8358;{preview.newAverage?.toFixed(4)}</span></div>
                  </div>
                </div>
              )}

              <button
                onClick={handleApplyMarkup}
                disabled={isLoading || (scope === "category" && !selectedCategory) || (scope === "provider" && !selectedProvider)}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-3 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
                Apply {markup}% Markup to {getScopeLabel()}
              </button>

              <p className="text-xs text-gray-400 mt-3 text-center">
                Sets prices to {markup}% above provider cost for {stats?.total_services ?? 0} services. Safe to re-apply at any time.
              </p>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">

            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Current Stats</h3>
              </div>

              {isLoadingStats ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-green-600 animate-spin" /></div>
              ) : stats ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Total Services</span>
                    <span className="text-sm font-semibold text-gray-900">{stats.total_services}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Avg Markup</span>
                    <span className="text-sm font-semibold text-green-600">{stats.average_markup?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Avg per 1k</span>
                    <span className="text-sm font-semibold text-gray-900">&#8358;{stats.average_price?.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Range per 1k</span>
                    <span className="text-sm font-semibold text-gray-900">&#8358;{stats.min_price?.toFixed(2)} – &#8358;{stats.max_price?.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No data available</p>
                </div>
              )}
            </div>

            {/* Quick Presets */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Presets</h3>
              <div className="space-y-2">
                {[
                  { label: "No markup (0%)",   value: 0 },
                  { label: "Small (10%)",       value: 10 },
                  { label: "Standard (20%)",    value: 20 },
                  { label: "High (50%)",        value: 50 },
                ].map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => setMarkup(preset.value)}
                    className={`w-full p-3 text-left rounded-lg border transition-all ${
                      markup === preset.value
                        ? "border-green-500 bg-green-50 text-green-900"
                        : "border-gray-200 hover:border-green-400 hover:bg-green-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{preset.label}</span>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-800 mb-1">How it works</h3>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Price = provider cost x (1 + markup%). Setting it to 20% twice always gives exactly 20% above cost - never compounds. You can lower it back anytime.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default BulkPriceIncrease
