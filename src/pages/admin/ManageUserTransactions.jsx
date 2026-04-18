"use client"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import {
  Search,
  Plus,
  ArrowLeft,
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
  User,
  Tag,
  FileText,
  Activity,
  Calendar,
  Copy,
  Menu,
  Loader2,
} from "lucide-react"
import { getUserById, fetchUserTransactions} from "../../services/adminService"

const ManageUserTransactions = () => {
  const params = useParams()
  const userId = params.id
  const [user, setUser] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [typeFilter, setTypeFilter] = useState("All Types")
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userTransactions, setUserTransactions] = useState([])

  // Fetch transactions on component mount
 useEffect(() => {
  const loadTransactions = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const transactionsResponse = await fetchUserTransactions(userId)

      let transactionsData = []
      if (Array.isArray(transactionsResponse)) {
        transactionsData = transactionsResponse
      } else if (Array.isArray(transactionsResponse?.data)) {
        transactionsData = transactionsResponse.data
      } else if (transactionsResponse?.data) {
        transactionsData = transactionsResponse.data.transactions || []
      }

      setUserTransactions(transactionsData)
    } catch (err) {
      console.error("Error fetching transactions:", err)
      setError(err.message || "Failed to load user transactions")
      setUserTransactions([])
    } finally {
      setIsLoading(false)
    }
  }

  if (userId) loadTransactions()
}, [userId])


  const [formData, setFormData] = useState({
    transaction_id: "",
    user_id: "",
    amount: "",
    currency: "USD",
    type: "Deposit", // e.g., Deposit, Withdrawal, Purchase, Fee
    status: "Completed", // e.g., Completed, Pending, Failed
    description: "",
    transaction_date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
  })

  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

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
    setFormData((prev) => {
      let newStatus
      if (prev.status === "Completed") {
        newStatus = "Pending"
      } else if (prev.status === "Pending") {
        newStatus = "Failed"
      } else {
        newStatus = "Completed"
      }
      return {
        ...prev,
        status: newStatus,
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      if (editingTransaction) {
        const updatedTransaction = await updateUserTransaction(editingTransaction.id, formData)
        setUserTransactions((prev) =>
          prev.map((transaction) => (transaction.id === editingTransaction.id ? updatedTransaction : transaction)),
        )
        setEditingTransaction(null)
      } else {
        const newTransaction = await createUserTransaction({
          ...formData,
          amount: Number.parseFloat(formData.amount) || 0,
        })
        setUserTransactions((prev) => [...prev, newTransaction])
      }

      setFormData({
        transaction_id: "",
        user_id: "",
        amount: "",
        currency: "USD",
        type: "Deposit",
        status: "Completed",
        description: "",
        transaction_date: new Date().toISOString().split("T")[0],
      })
      setShowAddForm(false)
      setError(null)
    } catch (err) {
      setError(err.message || "Failed to save user transaction")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (transaction) => {
    setFormData({
      transaction_id: transaction.transaction_id,
      user_id: transaction.user_id,
      amount: transaction.amount.toString(),
      currency: transaction.currency,
      type: transaction.type,
      status: transaction.status,
      description: transaction.description,
      transaction_date: transaction.created_at
        ? new Date(transaction.created_at).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    })
    setEditingTransaction(transaction)
    setShowAddForm(true)
    setActiveDropdown(null)
    setSelectedTransaction(null)
  }

  const handleDelete = async (id) => {
    try {
      setIsLoading(true)
      await deleteUserTransaction(id)
      setUserTransactions((prev) => prev.filter((transaction) => transaction.id !== id))
      setActiveDropdown(null)
      setSelectedTransaction(null)
      setError(null)
    } catch (err) {
      setError(err.message || "Failed to delete user transaction")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleStatus = async (id) => {
    try {
      setIsLoading(true)
      const updatedTransaction = await toggleUserTransactionStatus(id)
      setUserTransactions((prev) =>
        prev.map((transaction) => (transaction.id === id ? updatedTransaction : transaction)),
      )
      setActiveDropdown(null)
      setError(null)
    } catch (err) {
      setError(err.message || "Failed to toggle transaction status")
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = async (transaction) => {
    try {
      setIsLoading(true)
      const details = await fetchUserTransactionDetails(transaction.id)
      setSelectedTransaction(details)
      setActiveDropdown(null)
      window.scrollTo({ top: 0, behavior: "smooth" })
      setError(null)
    } catch (err) {
      setError(err.message || "Failed to load transaction details")
    } finally {
      setIsLoading(false)
    }
  }

 const filteredTransactions = userTransactions.filter((transaction) => {
  const matchesSearch =
    (transaction.transaction_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (transaction.user_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (transaction.description || "").toLowerCase().includes(searchTerm.toLowerCase());

  const matchesStatus = statusFilter === "All Status" || transaction.status === statusFilter;
  const matchesType = typeFilter === "All Types" || transaction.type === typeFilter;

  return matchesSearch && matchesStatus && matchesType;
});


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
        <div
          className="absolute right-0 bottom-full mb-1 bg-white rounded-xl shadow-lg border border-gray-100 py-2 px-1 z-50"
          style={{ width: "auto", minWidth: "max-content" }}
        >
          <div className="flex flex-row gap-1">
            <button
              onClick={() => {
                handleViewDetails(transaction)
                setActiveDropdown(null)
              }}
              className="px-3 py-2 hover:bg-gray-50 flex flex-col items-center gap-1 text-sm font-medium text-gray-700 transition-colors duration-200 rounded-lg"
              style={{ minWidth: "100px" }}
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
              style={{ minWidth: "100px" }}
            >
              <Edit3 className="w-4 h-4 text-green-600" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => {
                toggleStatus(transaction.id)
                setActiveDropdown(null)
              }}
              className="px-3 py-2 hover:bg-gray-50 flex flex-col items-center gap-1 text-sm font-medium text-gray-700 transition-colors duration-200 rounded-lg"
              style={{ minWidth: "100px" }}
            >
              <Power className={`w-4 h-4 ${transaction.status === "Completed" ? "text-red-600" : "text-green-600"}`} />
              <span>{transaction.status === "Completed" ? "Mark Pending" : "Mark Completed"}</span>
            </button>
            <div className="border-l border-gray-100 mx-1"></div>
            <button
              onClick={() => {
                handleDelete(transaction.id)
                setActiveDropdown(null)
              }}
              className="px-3 py-2 hover:bg-red-50 flex flex-col items-center gap-1 text-sm font-medium text-red-600 transition-colors duration-200 rounded-lg"
              style={{ minWidth: "100px" }}
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const TransactionDetailsCard = ({ transaction }) => (
    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Transaction #{transaction.transaction_id}</h2>
            <p className="text-green-600 font-medium">User Transaction Details</p>
          </div>
        </div>
        <button
          onClick={() => setSelectedTransaction(null)}
          className="self-end sm:self-auto p-2 hover:bg-white/50 rounded-lg transition-colors duration-200"
          disabled={isLoading}
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg p-4 border border-green-100">
          <div className="flex items-center gap-3 mb-3">
            <Tag className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Transaction Info</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-900 font-mono text-xs break-all">{transaction.transaction_id}</span>
                <button
                  onClick={() => copyToClipboard(transaction.transaction_id)}
                  className="text-green-600 hover:text-green-700"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">User ID:</span>
              <span className="text-gray-900 font-semibold">{transaction.user_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="text-gray-900 font-semibold">{transaction.type}</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-green-100">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Financial Details</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="text-gray-900 font-bold">
                {formatCurrency(transaction.amount, transaction.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Currency:</span>
              <span className="text-gray-900 font-semibold">{transaction.currency}</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-green-100 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Status & Dates</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status:</span>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                  transaction.status === "Completed"
                    ? "bg-emerald-100 text-emerald-800"
                    : transaction.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {transaction.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="text-gray-900">{formatDate(transaction.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated:</span>
              <span className="text-gray-900">{formatDate(transaction.updated_at)}</span>
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
            {transaction.description || "No description provided"}
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => handleEdit(transaction)}
          className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2 text-sm font-medium disabled:opacity-50`}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
          Edit Transaction
        </button>
        <button
          onClick={() => toggleStatus(transaction.id)}
          className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium disabled:opacity-50 ${
            transaction.status === "Completed"
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
          {transaction.status === "Completed" ? "Mark Pending" : "Mark Completed"}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-700 hover:text-black mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">
            <span>Dashboard</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">User Transactions</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Manage User Transactions</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            View, add, and manage user financial transactions.
          </p>
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

        {/* Transaction Details Card - Shows at top when action is clicked */}
        {selectedTransaction && <TransactionDetailsCard transaction={selectedTransaction} />}

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
                  <option>Deposit</option>
                  <option>Withdrawal</option>
                  <option>Purchase</option>
                  <option>Fee</option>
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
                    setEditingTransaction(null)
                    setSelectedTransaction(null)
                    setFormData({
                      transaction_id: "",
                      user_id: "",
                      amount: "",
                      currency: "USD",
                      type: "Deposit",
                      status: "Completed",
                      description: "",
                      transaction_date: new Date().toISOString().split("T")[0],
                    })
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add Transaction
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

        {/* Add/Edit Transaction Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {editingTransaction ? "Edit User Transaction" : "Add New User Transaction"}
                </h2>
                <p className="text-gray-600 mt-1 text-sm">
                  {editingTransaction ? "Update transaction information" : "Record a new user transaction"}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setEditingTransaction(null)
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
                    <Tag className="w-4 h-4 inline mr-2" />
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    name="transaction_id"
                    value={formData.transaction_id}
                    onChange={handleInputChange}
                    placeholder="e.g., TXN123456789"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    User ID
                  </label>
                  <input
                    type="text"
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleInputChange}
                    placeholder="e.g., user_xyz"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Amount
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white transition-all duration-200 text-sm"
                    disabled={isLoading}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="NGN">NGN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white transition-all duration-200 text-sm"
                    disabled={isLoading}
                  >
                    <option value="Deposit">Deposit</option>
                    <option value="Withdrawal">Withdrawal</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Fee">Fee</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    name="transaction_date"
                    value={formData.transaction_date}
                    onChange={handleInputChange}
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
                  placeholder="Describe the transaction..."
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
                      formData.status === "Completed"
                        ? "bg-emerald-600"
                        : formData.status === "Pending"
                          ? "bg-yellow-500"
                          : "bg-red-600"
                    }`}
                    disabled={isLoading}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 ${
                        formData.status === "Completed"
                          ? "translate-x-9"
                          : formData.status === "Pending"
                            ? "translate-x-4"
                            : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className="ml-3 text-sm font-medium text-gray-700">{formData.status}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {editingTransaction ? "Update Transaction" : "Add Transaction"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingTransaction(null)
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

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Loading State */}
          {isLoading && !showAddForm && !selectedTransaction && (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading user transactions...</p>
            </div>
          )}

          {/* Mobile Card View */}
          <div className="block sm:hidden">
            <div className="p-4 border-b border-gray-100 bg-green-600">
              <h3 className="text-white font-semibold">User Transactions ({filteredTransactions.length})</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {!isLoading && filteredTransactions.length === 0 ? (
                <div className="p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No user transactions found</p>
                  <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                </div>
              ) : (
                filteredTransactions.map((transaction, index) => (
                  <div key={transaction.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">#{index + 1}</span>
                          <h4 className="font-semibold text-gray-900">{transaction.transaction_id}</h4>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">User: {transaction.user_id}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-gray-900">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                              transaction.status === "Completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : transaction.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {transaction.status}
                          </span>
                          <span className="text-xs text-gray-500">{transaction.type}</span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {transaction.description || "No description provided"}
                        </p>
                      </div>
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

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold">
                    <input type="checkbox" className="rounded border-green-300" disabled={isLoading} />
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">No.</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Transaction ID</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">User ID</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Amount</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Type</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Description</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!isLoading && filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="w-12 h-12 text-gray-400" />
                        <p className="text-gray-500 font-medium">No user transactions found</p>
                        <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction, index) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-4 py-4">
                        <input type="checkbox" className="rounded border-gray-300" disabled={isLoading} />
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-gray-900">{transaction.transaction_id}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">{transaction.user_id}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">{transaction.type}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            transaction.status === "Completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : transaction.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-600 max-w-xs truncate" title={transaction.description}>
                          {transaction.description || "No description provided"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">{formatDate(transaction.created_at)}</span>
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
        </div>

        {/* Stats Summary */}
        {!isLoading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Total Transactions</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{userTransactions.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Completed Transactions</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">
                    {userTransactions.filter((t) => t.status === "Completed").length}
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
                  <p className="text-xs sm:text-sm text-gray-500">Total Transaction Value</p>
                  <p className="text-sm sm:text-xl font-bold text-gray-900">
                    {formatCurrency(userTransactions.reduce((sum, t) => sum + t.amount, 0))}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Pending Transactions</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">
                    {userTransactions.filter((t) => t.status === "Pending").length}
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

export default ManageUserTransactions
