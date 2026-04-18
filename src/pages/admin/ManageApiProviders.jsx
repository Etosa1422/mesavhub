"use client"

import { useState, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import {
  Search,
  Plus,
  MoreVertical,
  Edit3,
  Power,
  DollarSign,
  RefreshCw,
  Wallet,
  Eye,
  Trash2,
  X,
  Check,
  AlertCircle,
  Globe,
  Key,
  FileText,
  Activity,
  Server,
  ExternalLink,
  Copy,
  Menu,
  Loader2,
} from "lucide-react"
import {
  fetchApiProviders,
  fetchApiProviderDetails,
  createApiProvider,
  updateApiProvider,
  deleteApiProvider,
  toggleApiProviderStatus,
  syncApiProviderServices,
} from "../../services/adminService"
import toast from "react-hot-toast"

const ManageApiProviders = () => {
  // Get currency context from AdminLayout
  const context = useOutletContext()
  const {
    selectedCurrency: contextSelectedCurrency,
    convertToSelectedCurrency: contextConvertToSelectedCurrency,
    formatCurrency: contextFormatCurrency,
  } = context || {}

  // Default currency if not provided
  const selectedCurrency = contextSelectedCurrency || { 
    code: "NGN", 
    symbol: "₦", 
    rate: 1 
  }

  // Fallback functions if not provided
  const convertToSelectedCurrency = contextConvertToSelectedCurrency || ((amount, sourceCurrency = "NGN") => {
    if (!amount || !selectedCurrency?.rate) return 0
    return amount * (selectedCurrency.rate || 1)
  })

  const formatCurrency = contextFormatCurrency || ((amount, currency) => {
    if (!currency || amount === null || amount === undefined) return '₦ 0.00'
    const currencySymbol = currency?.symbol || '₦'
    const formattedAmount = parseFloat(amount).toFixed(2)
    return `${currencySymbol} ${formattedAmount}`
  })

  // Find USD currency for equivalent display
  const [usdCurrency, setUsdCurrency] = useState({ code: "USD", symbol: "$", rate: 1 })
  
  useEffect(() => {
    // Try to get USD currency from context currencies
    if (context?.currencies) {
      const usd = context.currencies.find(c => c.code === "USD")
      if (usd) setUsdCurrency(usd)
    }
  }, [context?.currencies])

  // Format provider balance with conversion
  const formatProviderBalance = (provider) => {
    if (!provider || provider.balance === null || provider.balance === undefined) {
      return { converted: formatCurrency(0, selectedCurrency), original: "0.00", usd: "$0.00" }
    }
    
    const providerCurrency = provider.currency || "USD"
    const balance = parseFloat(provider.balance) || 0
    
    // Convert to selected currency (admin's chosen currency)
    const convertedBalance = convertToSelectedCurrency(balance, providerCurrency)
    const formattedConverted = formatCurrency(convertedBalance, selectedCurrency)
    
    // Convert to USD equivalent
    // All currencies in the system are based on rates relative to a base currency
    // We'll convert: provider currency -> NGN -> USD
    let usdEquivalent = 0
    
    if (providerCurrency === "USD") {
      usdEquivalent = balance
    } else {
      // Find currency rates
      const providerCurrencyObj = currencies.find(c => c.code === providerCurrency)
      const ngnCurrencyObj = currencies.find(c => c.code === "NGN")
      
      const providerRate = providerCurrencyObj?.rate || 1
      const ngnRate = ngnCurrencyObj?.rate || 1
      const usdRate = usdCurrency.rate || 1
      
      // Convert: provider currency -> NGN -> USD
      // If rates are relative to USD, then: providerRate is provider/USD, ngnRate is NGN/USD
      // So: balance in provider currency / providerRate = balance in USD
      // But if rates are relative to NGN, then we need: balance / providerRate * ngnRate = NGN, then NGN / ngnRate * usdRate = USD
      
      // Simplified: Assuming all rates are relative to USD
      // If provider rate is provider/USD, then balance / providerRate gives USD
      // If provider rate is provider/NGN, then we need to convert via NGN
      
      // Try direct conversion first (assuming rates are USD-based)
      try {
        if (providerRate > 0) {
          const balanceInUSD = balance / providerRate
          usdEquivalent = balanceInUSD
        } else {
          // Fallback: assume 1:1 if rate is 0 or invalid
          usdEquivalent = providerCurrency === "NGN" ? (balance / (ngnRate || 1)) * (usdRate || 1) : balance
        }
      } catch {
        // Fallback calculation
        usdEquivalent = balance
      }
    }
    
    const formattedUSD = `$${Math.max(0, usdEquivalent).toFixed(2)}`
    
    // Original balance in provider's currency
    const originalFormat = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: providerCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(balance)
    
    return {
      converted: formattedConverted,
      original: originalFormat,
      usd: formattedUSD,
      providerCurrency: providerCurrency
    }
  }
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [editingProvider, setEditingProvider] = useState(null)
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [apiProviders, setApiProviders] = useState([])

  // Fetch providers on component mount
  useEffect(() => {
    const loadProviders = async () => {
      try {
        setIsLoading(true)
        const data = await fetchApiProviders()
        setApiProviders(Array.isArray(data) ? data : [])
        setError(null)
      } catch (err) {
        const errorMsg = err?.response?.data?.message || err.message || "Failed to load API providers"
        setError(errorMsg)
        toast.error(errorMsg)
        setApiProviders([])
      } finally {
        setIsLoading(false)
      }
    }
    
    loadProviders()
  }, [])

  // Clear messages after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (error) setError(null)
      if (success) setSuccess(null)
    }, 5000)
    return () => clearTimeout(timer)
  }, [error, success])

  const [formData, setFormData] = useState({
    api_name: "",
    url: "",
    api_key: "",
    status: 1,
    description: "",
  })


  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleStatusToggle = () => {
    setFormData((prev) => ({
      ...prev,
      status: prev.status === 1 ? 0 : 1,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      let response
      
      if (editingProvider) {
        await updateApiProvider(editingProvider.id, formData)
        setEditingProvider(null)
      } else {
        await createApiProvider(formData)
      }
      
      // Reload providers to get updated data
      const updatedProviders = await fetchApiProviders()
      setApiProviders(Array.isArray(updatedProviders) ? updatedProviders : [])
      
      setFormData({
        api_name: "",
        url: "",
        api_key: "",
        status: 1,
        description: "",
      })
      setShowAddForm(false)
      setError(null)
      const successMsg = editingProvider ? 'API provider updated successfully!' : 'API provider created successfully!'
      setSuccess(successMsg)
      toast.success(successMsg)
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err.message || "Failed to save API provider"
      setError(errorMsg)
      setSuccess(null)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (provider) => {
    setFormData({
      api_name: provider.api_name,
      url: provider.url,
      api_key: provider.api_key,
      status: provider.status,
      description: provider.description,
    })
    setEditingProvider(provider)
    setShowAddForm(true)
    setActiveDropdown(null)
    setSelectedProvider(null)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this API provider? This action cannot be undone.")) {
      return
    }
    try {
      setIsLoading(true)
      await deleteApiProvider(id)
      setApiProviders((prev) => prev.filter((provider) => provider.id !== id))
      setActiveDropdown(null)
      setSelectedProvider(null)
      setError(null)
      setSuccess('API provider deleted successfully!')
      toast.success('API provider deleted successfully!')
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err.message || "Failed to delete API provider"
      setError(errorMsg)
      setSuccess(null)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleStatus = async (id) => {
    try {
      setIsLoading(true)
      const updatedProvider = await toggleApiProviderStatus(id)
      setApiProviders((prev) =>
        prev.map((provider) =>
          provider.id === id ? updatedProvider : provider
        )
      )
      setActiveDropdown(null)
      setError(null)
      const successMsg = `Provider ${updatedProvider.status === 1 ? 'activated' : 'deactivated'} successfully!`
      setSuccess(successMsg)
      toast.success(successMsg)
    } catch (err) {
      const errorMsg = err.message || err?.response?.data?.message || "Failed to toggle provider status"
      setError(errorMsg)
      setSuccess(null)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = async (provider) => {
    try {
      setIsLoading(true)
      const details = await fetchApiProviderDetails(provider.id)
      setSelectedProvider(details)
      setActiveDropdown(null)
      window.scrollTo({ top: 0, behavior: "smooth" })
      setError(null)
    } catch (err) {
      setError(err.message || "Failed to load provider details")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSyncServices = async (id) => {
    try {
      setIsLoading(true)
      await syncApiProviderServices(id)
      const updatedProviders = await fetchApiProviders()
      setApiProviders(updatedProviders)
      setError(null)
      setSuccess('Services synchronized successfully!')
      toast.success('Services synchronized successfully!')
    } catch (err) {
      const errorMsg = err.message || err?.response?.data?.message || "Failed to sync services"
      setError(errorMsg)
      setSuccess(null)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const ActionDropdown = ({ provider, isOpen, onToggle }) => (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
        disabled={isLoading}
      >
        <MoreVertical className="w-4 h-4 text-gray-600" />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 bottom-full mb-1 bg-white rounded-xl shadow-lg border border-gray-100 py-2 px-1 z-50"
          style={{ width: 'auto', minWidth: 'max-content' }}
        >
          <div className="flex flex-row gap-1">
            <button
              onClick={() => {
                handleViewDetails(provider)
                setActiveDropdown(null)
              }}
              className="px-3 py-2 hover:bg-gray-50 flex flex-col items-center gap-1 text-sm font-medium text-gray-700 transition-colors duration-200 rounded-lg"
              style={{ minWidth: '100px' }}
            >
              <Eye className="w-4 h-4 text-green-600" />
              <span>View</span>
            </button>

            <button
              onClick={() => {
                handleEdit(provider)
                setActiveDropdown(null)
              }}
              className="px-3 py-2 hover:bg-gray-50 flex flex-col items-center gap-1 text-sm font-medium text-gray-700 transition-colors duration-200 rounded-lg"
              style={{ minWidth: '100px' }}
            >
              <Edit3 className="w-4 h-4 text-green-600" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => {
                toggleStatus(provider.id)
                setActiveDropdown(null)
              }}
              className="px-3 py-2 hover:bg-gray-50 flex flex-col items-center gap-1 text-sm font-medium text-gray-700 transition-colors duration-200 rounded-lg"
              style={{ minWidth: '100px' }}
            >
              <Power className={`w-4 h-4 ${provider.status === 1 ? "text-red-600" : "text-green-600"}`} />
              <span>{provider.status === 1 ? "Deactivate" : "Activate"}</span>
            </button>

            <button
              onClick={() => {
                handleSyncServices(provider.id)
                setActiveDropdown(null)
              }}
              className="px-3 py-2 hover:bg-gray-50 flex flex-col items-center gap-1 text-sm font-medium text-gray-700 transition-colors duration-200 rounded-lg"
              style={{ minWidth: '100px' }}
            >
              <RefreshCw className="w-4 h-4 text-orange-600" />
              <span>Sync</span>
            </button>

            <div className="border-l border-gray-100 mx-1"></div>

            <button
              onClick={() => {
                handleDelete(provider.id)
                setActiveDropdown(null)
              }}
              className="px-3 py-2 hover:bg-red-50 flex flex-col items-center gap-1 text-sm font-medium text-red-600 transition-colors duration-200 rounded-lg"
              style={{ minWidth: '100px' }}
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const ProviderDetailsCard = ({ provider }) => (
    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
            <Server className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{provider.api_name}</h2>
            <p className="text-green-600 font-medium">API Provider Details</p>
          </div>
        </div>
        <button
          onClick={() => setSelectedProvider(null)}
          className="self-end sm:self-auto p-2 hover:bg-white/50 rounded-lg transition-colors duration-200"
          disabled={isLoading}
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg p-4 border border-green-100">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">API Information</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">URL:</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-900 font-mono text-xs break-all">{provider.url}</span>
                <button onClick={() => copyToClipboard(provider.url)} className="text-green-600 hover:text-green-700">
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Services:</span>
              <span className="text-gray-900 font-semibold">{provider.services_count || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Response Time:</span>
              <span className="text-green-600 font-semibold">{provider.response_time || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-green-100">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Financial Details</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Balance:</span>
                <div className="text-right">
                  <span className="text-gray-900 font-bold text-base">{formatProviderBalance(provider).converted}</span>
                  <span className="text-gray-500 text-xs block mt-0.5">
                    ({formatProviderBalance(provider).original})
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                <span className="text-gray-600">USD Equivalent:</span>
                <span className="text-gray-900 font-semibold text-sm">{formatProviderBalance(provider).usd}</span>
              </div>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-100">
              <span className="text-gray-600">Currency:</span>
              <span className="text-gray-900 font-semibold">{provider.currency || "USD"}</span>
            </div>
            {provider.convention_rate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Rate (1 NGN):</span>
                <span className="text-gray-900 font-semibold">₦{provider.convention_rate}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-green-100 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Status & Activity</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status:</span>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                  provider.status === 1 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                }`}
              >
                {provider.status === 1 ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="text-gray-900">{formatDate(provider.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Sync:</span>
              <span className="text-gray-900">{formatDate(provider.last_sync)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="bg-white rounded-lg p-4 border border-green-100">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Description</h3>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            {provider.description || "No description provided"}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => handleEdit(provider)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2 text-sm font-medium disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
          Edit Provider
        </button>
        <button
          onClick={() => toggleStatus(provider.id)}
          className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium disabled:opacity-50 ${
            provider.status === 1
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
          {provider.status === 1 ? "Deactivate" : "Activate"}
        </button>
        <button
          onClick={() => window.open(provider.url, '_blank')}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          Test API
        </button>
      </div>
    </div>
  )

  // Filter out invalid providers first
  const validProviders = apiProviders.filter(provider => 
    provider && typeof provider.api_name === 'string'
  )

  const filteredProviders = validProviders.filter((provider) => {
    const matchesSearch =
      provider.api_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (provider.description && provider.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus =
      statusFilter === "All Status" ||
      (statusFilter === "Active" && provider.status === 1) ||
      (statusFilter === "Inactive" && provider.status === 0)
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">
            <span>Dashboard</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Api Provider</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Manage API Providers</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Configure and monitor your API service providers
              </p>
            </div>
            <button
              onClick={async () => {
                try {
                  setIsLoading(true)
                  const data = await fetchApiProviders()
                  setApiProviders(Array.isArray(data) ? data : [])
                  toast.success('Providers refreshed successfully!')
                } catch (err) {
                  toast.error('Failed to refresh providers')
                } finally {
                  setIsLoading(false)
                }
              }}
              disabled={isLoading}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg p-1.5 hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="ml-auto -mx-1.5 -my-1.5 bg-green-50 text-green-500 rounded-lg p-1.5 hover:bg-green-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Provider Details Card - Shows at top when action is clicked */}
        {selectedProvider && <ProviderDetailsCard provider={selectedProvider} />}

        {/* Search and Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
          {/* Mobile Filter Toggle */}
          <div className="flex items-center justify-between mb-4 sm:hidden">
            <h3 className="font-semibold text-gray-900">Filters & Actions</h3>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className={`${showMobileFilters ? "block" : "hidden"} sm:block`}>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1 w-full sm:w-auto">
                <div className="relative flex-1 max-w-full sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search providers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
                    disabled={isLoading}
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white min-w-[140px] transition-all duration-200 text-sm"
                  disabled={isLoading}
                >
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>

                <button 
                  className="w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Search
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setShowAddForm(!showAddForm)
                    setEditingProvider(null)
                    setSelectedProvider(null)
                    setFormData({
                      api_name: "",
                      url: "",
                      api_key: "",
                      status: 1,
                      description: "",
                    })
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add Providers
                </button>

                <button 
                  className="w-full sm:w-auto px-6 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors duration-200 flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-50"
                  disabled={isLoading}
                >
                  <MoreVertical className="w-4 h-4" />
                  Action
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Provider Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {editingProvider ? "Edit API Provider" : "Add New API Provider"}
                </h2>
                <p className="text-gray-600 mt-1 text-sm">
                  {editingProvider ? "Update provider information" : "Configure a new API service provider"}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setEditingProvider(null)
                }}
                className="self-end sm:self-auto p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                disabled={isLoading}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    API Name
                  </label>
                  <input
                    type="text"
                    name="api_name"
                    value={formData.api_name}
                    onChange={handleInputChange}
                    placeholder="Enter API provider name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    URL
                  </label>
                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    placeholder="https://api.example.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Key className="w-4 h-4 inline mr-2" />
                    API Key
                  </label>
                  <input
                    type="password"
                    name="api_key"
                    value={formData.api_key}
                    onChange={handleInputChange}
                    placeholder="Enter API key"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the API provider and its services..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none text-sm"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={handleStatusToggle}
                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                      formData.status === 1 ? "bg-green-600" : "bg-gray-300"
                    }`}
                    disabled={isLoading}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 ${
                        formData.status === 1 ? "translate-x-9" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {formData.status === 1 ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {editingProvider ? "Update Provider" : "Add Provider"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingProvider(null)
                  }}
                  className="w-full sm:w-auto px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium text-sm disabled:opacity-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Providers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Loading State */}
          {isLoading && !showAddForm && !selectedProvider && (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading API providers...</p>
            </div>
          )}

          {/* Mobile Card View */}
          <div className="block sm:hidden">
            <div className="p-4 border-b border-gray-100 bg-green-600">
              <h3 className="text-white font-semibold">
                API Providers ({filteredProviders.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {!isLoading && filteredProviders.length === 0 ? (
                <div className="p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No API providers found</p>
                  <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                </div>
              ) : (
                filteredProviders.map((provider, index) => (
                  <div key={provider.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">#{index + 1}</span>
                          <h4 className="font-semibold text-gray-900">{provider.api_name}</h4>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{provider.services_count || 0} services</p>
                        <div className="flex flex-col gap-1 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">
                              {formatProviderBalance(provider).converted}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                provider.status === 1 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {provider.status === 1 ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatProviderBalance(provider).usd} USD
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {provider.description || "No description provided"}
                        </p>
                      </div>
                      <ActionDropdown
                        provider={provider}
                        isOpen={activeDropdown === provider.id}
                        onToggle={() => setActiveDropdown(activeDropdown === provider.id ? null : provider.id)}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold">
                    <input type="checkbox" className="rounded border-green-300" disabled={isLoading} />
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">No.</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Name</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Balance</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Description</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!isLoading && filteredProviders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="w-12 h-12 text-gray-400" />
                        <p className="text-gray-500 font-medium">No API providers found</p>
                        <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProviders.map((provider, index) => (
                    <tr key={provider.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-4 py-4">
                        <input type="checkbox" className="rounded border-gray-300" disabled={isLoading} />
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">{provider.api_name}</span>
                          <span className="text-xs text-gray-500">{provider.services_count || 0} services</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">
                            {formatProviderBalance(provider).converted}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatProviderBalance(provider).usd} USD
                          </span>
                          {provider.convention_rate && (
                            <span className="text-xs text-gray-400">Rate: ₦{provider.convention_rate}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-600 max-w-xs truncate" title={provider.description}>
                          {provider.description || "No description provided"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            provider.status === 1 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {provider.status === 1 ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <ActionDropdown
                          provider={provider}
                          isOpen={activeDropdown === provider.id}
                          onToggle={() => setActiveDropdown(activeDropdown === provider.id ? null : provider.id)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Summary */}
        {!isLoading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Total Providers</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{apiProviders.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Active Providers</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">
                    {apiProviders.filter((p) => p.status === 1).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Total Balance</p>
                  <div className="flex flex-col">
                    <p className="text-sm sm:text-xl font-bold text-gray-900">
                      {formatCurrency(
                        apiProviders.reduce((sum, p) => {
                          const balance = parseFloat(p.balance) || 0
                          const providerCurrency = p.currency || "USD"
                          return sum + convertToSelectedCurrency(balance, providerCurrency)
                        }, 0),
                        selectedCurrency
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(() => {
                        const totalUSD = apiProviders.reduce((sum, p) => {
                          const balance = parseFloat(p.balance) || 0
                          const providerCurrency = p.currency || "USD"
                          if (providerCurrency === "USD") return sum + balance
                          
                          const providerRate = currencies.find(c => c.code === providerCurrency)?.rate || 1
                          const usdRate = usdCurrency.rate || 1
                          
                          if (providerRate > 0 && usdRate > 0) {
                            return sum + ((balance / providerRate) * usdRate)
                          }
                          return sum + balance
                        }, 0)
                        return `$${totalUSD.toFixed(2)} USD`
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Total Services</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">
                    {apiProviders.reduce((sum, p) => sum + (p.services_count || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageApiProviders