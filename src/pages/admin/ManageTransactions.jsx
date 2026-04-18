"use client"

import { useState, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import {
  Search,
  MoreVertical,
  Edit3,
  Trash2,
  X,
  Check,
  AlertCircle,
  User,
  Clock,
  TrendingUp,
  TrendingDown,
  FileText,
  Copy,
  Menu,
  Loader2,
  Activity,
  RefreshCw,
  Eye,
  DollarSign
} from "lucide-react"
import toast from "react-hot-toast"
import {
  fetchTransactions,
  fetchTransactionDetails,
  updateTransaction,
  deleteTransaction,
  changeTransactionStatus,
} from "../../services/adminService"

const ManageTransactions = () => {
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
    if (!currency || amount === null || amount === undefined) return '0.00'
    const formattedAmount = parseFloat(amount).toFixed(2)
    return `${currency?.symbol || '₦'} ${formattedAmount}`
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [typeFilter, setTypeFilter] = useState("All Types")
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  })

  const loadTransactions = async (page = 1) => {
    try {
      setIsLoading(true)
      const params = {
        page,
        per_page: 15,
        search: searchTerm || undefined,
        status: statusFilter !== "All Status" ? statusFilter.toLowerCase() : undefined,
        type: typeFilter !== "All Types" ? typeFilter.toLowerCase() : undefined,
      }
      
      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });
      
      const response = await fetchTransactions(params)
      
      // Handle response structure
      const transactionsData = Array.isArray(response?.data) 
        ? response.data 
        : Array.isArray(response)
          ? response
          : []
      
      setTransactions(transactionsData)
      
      // Handle pagination with fallbacks
      setPagination({
        current_page: response?.current_page || page || 1,
        last_page: response?.last_page || 1,
        per_page: response?.per_page || 15,
        total: response?.total || transactionsData.length,
      })
      
      setError(null)
    } catch (err) {
      console.error('Error loading transactions:', err)
      const errorMsg = err?.response?.data?.message || err.message || "Failed to load transactions. Please try again."
      setError(errorMsg)
      setTransactions([]) // Reset to empty array on error
    } finally {
      setIsLoading(false)
    }
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTransactions()
    }, 500)
    
    return () => clearTimeout(timer)
  }, [searchTerm, statusFilter, typeFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (error) setError(null)
      if (success) setSuccess(null)
    }, 5000)
    return () => clearTimeout(timer)
  }, [error, success])

  // Initial load
  useEffect(() => {
    loadTransactions()
  }, [])

  const [formData, setFormData] = useState({
    amount: 0,
    charge: 0,
    transaction_type: "",
    description: "",
    status: "pending",
  })

  // Format price using currency conversion (same as user side)
  const formatPrice = (price) => {
    if (!price || price === null || price === undefined) return formatCurrency(0, selectedCurrency)
    const convertedPrice = convertToSelectedCurrency(price, "NGN")
    return formatCurrency(convertedPrice, selectedCurrency)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleStatusChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      status: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      
      if (editingTransaction) {
        const response = await updateTransaction(editingTransaction.id, formData)
        // Reload transactions to get updated data
        await loadTransactions(pagination.current_page)
        setEditingTransaction(null)
        setSuccess('Transaction updated successfully!')
        toast.success('Transaction updated successfully!')
      }
      
      setFormData({
        amount: 0,
        charge: 0,
        transaction_type: "",
        description: "",
        status: "pending",
      })
      setError(null)
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err.message || "Failed to save transaction"
      setError(errorMsg)
      setSuccess(null)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (transaction) => {
    setFormData({
      amount: parseFloat(transaction.amount),
      charge: parseFloat(transaction.charge),
      transaction_type: transaction.transaction_type,
      description: transaction.description,
      status: transaction.status,
    })
    setEditingTransaction(transaction)
    setActiveDropdown(null)
    setSelectedTransaction(null)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction? This action cannot be undone.")) return
    
    try {
      setIsLoading(true)
      await deleteTransaction(id)
      // Reload transactions
      await loadTransactions(pagination.current_page)
      setActiveDropdown(null)
      setSelectedTransaction(null)
      setSuccess('Transaction deleted successfully!')
      toast.success('Transaction deleted successfully!')
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err.message || "Failed to delete transaction"
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const changeStatus = async (id, newStatus) => {
    try {
      setIsLoading(true)
      await changeTransactionStatus(id, newStatus)
      // Reload transactions
      await loadTransactions(pagination.current_page)
      setActiveDropdown(null)
      const successMsg = `Transaction status changed to ${newStatus} successfully!`
      setSuccess(successMsg)
      toast.success(successMsg)
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err.message || "Failed to change transaction status"
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = async (transaction) => {
    try {
      setIsLoading(true)
      const details = await fetchTransactionDetails(transaction.id)
      setSelectedTransaction(details)
      setActiveDropdown(null)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err) {
      setError(err.message || "Failed to load transaction details")
    } finally {
      setIsLoading(false)
    }
  }

  const ActionDropdown = ({ transaction, isOpen, onToggle }) => (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
        disabled={isLoading}
      >
        <MoreVertical className="w-4 h-4 text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-1 bg-white rounded-xl shadow-lg border border-gray-100 py-2 px-1 z-50"
          style={{ width: 'auto', minWidth: 'max-content' }}
        >
          <div className="flex flex-row gap-1">
            <button
              onClick={() => {
                handleViewDetails(transaction)
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
                handleEdit(transaction)
                setActiveDropdown(null)
              }}
              className="px-3 py-2 hover:bg-gray-50 flex flex-col items-center gap-1 text-sm font-medium text-gray-700 transition-colors duration-200 rounded-lg"
              style={{ minWidth: '100px' }}
            >
              <Edit3 className="w-4 h-4 text-green-600" />
              <span>Edit</span>
            </button>

            <div className="border-l border-gray-100 mx-1"></div>

            <button
              onClick={() => {
                handleDelete(transaction.id)
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

  const TransactionDetailsCard = ({ transaction }) => {
    if (!transaction) return null
    
    return (
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-4 sm:p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-gray-900">Transaction Details</h3>
          <button 
            onClick={() => setSelectedTransaction(null)}
            className="p-1 hover:bg-gray-200 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-700 mb-3">Transaction Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">ID:</span>
                <span className="font-mono">{transaction.transaction_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type:</span>
                <span className={`font-semibold ${
                  transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.transaction_type?.charAt(0).toUpperCase() + transaction.transaction_type?.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span className="font-bold">
                  {formatPrice(transaction.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Fee:</span>
                <span>{formatPrice(transaction.charge)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  transaction.status === 'completed' 
                    ? "bg-emerald-100 text-emerald-800" 
                    : transaction.status === 'failed'
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span>{formatDate(transaction.created_at)}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-700 mb-3">User Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Name:</span>
                <span>{transaction.user?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span>{transaction.user?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Account:</span>
                <span>{transaction.user?.account_number || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
        
        {transaction.description && (
          <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-700 mb-2">Description</h4>
            <p className="text-gray-600">{transaction.description}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">
            <span>Dashboard</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Transactions</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Manage Transactions</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            View and manage all system transactions
          </p>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500" />
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

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500" />
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

        {/* Transaction Details Card */}
        {selectedTransaction && <TransactionDetailsCard transaction={selectedTransaction} />}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1 w-full sm:w-auto">
              <div className="relative flex-1 max-w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search transactions..."
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
                <option>Completed</option>
                <option>Pending</option>
                <option>Failed</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white min-w-[140px] transition-all duration-200 text-sm"
                disabled={isLoading}
              >
                <option>All Types</option>
                <option>Credit</option>
                <option>Debit</option>
              </select>
            </div>

            <button 
              onClick={() => loadTransactions()}
              className="w-full sm:w-auto px-6 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors duration-200 flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </button>
          </div>
        </div>

        {/* Edit Transaction Form */}
        {editingTransaction && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingTransaction ? "Edit Transaction" : "Create Transaction"}
              </h3>
              <button 
                onClick={() => setEditingTransaction(null)}
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fee</label>
                  <input
                    type="number"
                    name="charge"
                    value={formData.charge}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    name="transaction_type"
                    value={formData.transaction_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleStatusChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTransaction(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading && !editingTransaction && !selectedTransaction && (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading transactions...</p>
            </div>
          )}

          {/* Mobile View */}
          <div className="block sm:hidden">
            <div className="p-4 border-b border-gray-100 bg-green-600">
              <h3 className="text-white font-semibold">
                Transactions ({transactions.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {!isLoading && transactions.length === 0 ? (
                <div className="p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No transactions found</p>
                </div>
              ) : (
                Array.isArray(transactions) && transactions.map((transaction) => (
                  <div key={transaction.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.transaction_id || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.status === 'completed' 
                          ? "bg-emerald-100 text-emerald-800" 
                          : transaction.status === 'failed'
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="text-sm text-gray-700">
                          {transaction.user?.name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.user?.email || 'N/A'}
                        </p>
                      </div>
                      <p className={`font-bold ${
                        transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.transaction_type === 'credit' ? '+' : '-'}
                        {formatPrice(transaction.amount)}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        Fee: {formatPrice(transaction.charge)}
                      </p>
                      <ActionDropdown
                        transaction={transaction}
                        isOpen={activeDropdown === transaction.id}
                        onToggle={() => setActiveDropdown(activeDropdown === transaction.id ? null : transaction.id)}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold">No.</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Transaction ID</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">User</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Amount</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Type</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Date</th>
                  {/* <th className="px-4 py-4 text-left text-sm font-semibold">Action</th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!isLoading && transactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="w-12 h-12 text-gray-400" />
                        <p className="text-gray-500 font-medium">No transactions found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  Array.isArray(transactions) && transactions.map((transaction, index) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{(pagination.current_page - 1) * pagination.per_page + index + 1}</td>
                      <td className="px-4 py-4 text-sm font-mono text-gray-900">
                        {transaction.transaction_id}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">
                            {transaction.user?.name || 'Unknown User'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {transaction.user?.email || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className={`text-sm font-bold ${
                            transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.transaction_type === 'credit' ? '+' : '-'}
                            {formatPrice(transaction.amount)}
                          </span>
                          <span className="text-xs text-gray-500">
                            Fee: {formatPrice(transaction.charge)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-sm font-semibold ${
                          transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.transaction_type?.charAt(0).toUpperCase() + transaction.transaction_type?.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            transaction.status === 'completed' 
                              ? "bg-emerald-100 text-emerald-800" 
                              : transaction.status === 'failed'
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {formatDate(transaction.created_at)}
                      </td>
                      <td className="px-4 py-4">
                        <ActionDropdown
                          transaction={transaction}
                          isOpen={activeDropdown === transaction.id}
                          onToggle={() => setActiveDropdown(activeDropdown === transaction.id ? null : transaction.id)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.current_page - 1) * pagination.per_page + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</span> of{' '}
                  <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => loadTransactions(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="px-4 py-2 border rounded-md disabled:opacity-50 flex items-center gap-2"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                  let pageNum
                  if (pagination.last_page <= 5) {
                    pageNum = i + 1
                  } else if (pagination.current_page <= 3) {
                    pageNum = i + 1
                  } else if (pagination.current_page >= pagination.last_page - 2) {
                    pageNum = pagination.last_page - 4 + i
                  } else {
                    pageNum = pagination.current_page - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => loadTransactions(pageNum)}
                      className={`px-4 py-2 border rounded-md ${
                        pagination.current_page === pageNum
                          ? 'bg-green-600 text-white border-green-600'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => loadTransactions(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="px-4 py-2 border rounded-md disabled:opacity-50 flex items-center gap-2"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        {!isLoading && transactions.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Total Transactions</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{pagination.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Total Credits</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">
                    {formatPrice(transactions
                      .filter(t => t.transaction_type === 'credit')
                      .reduce((sum, t) => {
                        const convertedAmount = convertToSelectedCurrency(parseFloat(t.amount || 0), "NGN")
                        return sum + convertedAmount
                      }, 0)
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Total Debits</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">
                    {formatPrice(transactions
                      .filter(t => t.transaction_type === 'debit')
                      .reduce((sum, t) => {
                        const convertedAmount = convertToSelectedCurrency(parseFloat(t.amount || 0), "NGN")
                        return sum + convertedAmount
                      }, 0)
                    )}
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
                  <p className="text-xs sm:text-sm text-gray-500">Total Fees</p>
                
                  <p className="text-lg sm:text-xl font-bold text-gray-900">
                    {formatPrice(transactions.reduce((sum, t) => {
                      const convertedCharge = convertToSelectedCurrency(parseFloat(t.charge || 0), "NGN")
                      return sum + convertedCharge
                    }, 0))}
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

export default ManageTransactions