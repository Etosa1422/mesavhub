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
  ShoppingBag,
  FileText,
  Copy,
  Loader2,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Calendar,
  Tag,
  DollarSign,
  TrendingUp,
  Package
} from "lucide-react"
import {
  fetchAllOrders,
  fetchOrderDetails,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
} from "../../services/adminService"
import toast from "react-hot-toast"

const ShowOrders = () => {
  // Get currency context from AdminLayout
  const context = useOutletContext()
  const {
    selectedCurrency: contextSelectedCurrency,
    convertToSelectedCurrency: contextConvertToSelectedCurrency,
    formatCurrency: contextFormatCurrency,
  } = context || {}

  const selectedCurrency = contextSelectedCurrency || { 
    code: "NGN", 
    symbol: "₦", 
    rate: 1 
  }

  const convertToSelectedCurrency = contextConvertToSelectedCurrency || ((amount, sourceCurrency = "NGN") => {
    if (!amount || !selectedCurrency?.rate) return 0
    return amount * (selectedCurrency.rate || 1)
  })

  const formatCurrency = contextFormatCurrency || ((amount, currency) => {
    if (!currency || amount === null || amount === undefined) return '0.00'
    const formattedAmount = parseFloat(amount).toFixed(2)
    return `${currency?.symbol || '₦'} ${formattedAmount}`
  })

  const formatPrice = (amount) => {
    if (!selectedCurrency || amount === null || amount === undefined) return '—'
    const convertedAmount = convertToSelectedCurrency(amount, "NGN")
    return formatCurrency(convertedAmount, selectedCurrency)
  }

  const hasValue = (value) => {
    return value !== null && value !== undefined && value !== "" && !(Array.isArray(value) && value.length === 0)
  }

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [editingOrder, setEditingOrder] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  })

  const loadOrders = async (page = 1) => {
    try {
      setIsLoading(true)
      const params = {
        page,
        search: searchTerm,
        status: statusFilter !== "All Status" ? statusFilter.toLowerCase() : undefined,
      }
      
      const response = await fetchAllOrders(params)
      
      const ordersData = Array.isArray(response?.data) 
        ? response.data 
        : []
      
      setOrders(ordersData)
      
      setPagination({
        current_page: response?.current_page || 1,
        last_page: response?.last_page || 1,
        per_page: response?.per_page || 15,
        total: response?.total || 0,
      })
      
      setError(null)
    } catch (err) {
      console.error("Error loading orders:", err)
      setError(err.response?.data?.message || "Failed to load orders")
      setOrders([])
      toast.error(err.response?.data?.message || "Failed to load orders")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrders(1)
  }, [searchTerm, statusFilter])

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) {
      return
    }

    try {
      await deleteOrder(id)
      toast.success("Order deleted successfully")
      loadOrders(pagination.current_page)
      setActiveDropdown(null)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete order")
    }
  }

  const handleUpdate = async (orderData) => {
    try {
      await updateOrder(editingOrder.id, orderData)
      toast.success("Order updated successfully")
      setEditingOrder(null)
      loadOrders(pagination.current_page)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update order")
    }
  }

  const handleStatusUpdate = async (status, statusDescription, reason) => {
    try {
      await updateOrderStatus(editingOrder.id, {
        status,
        statusDescription,
        reason
      })
      toast.success("Order status updated successfully")
      setEditingOrder(null)
      loadOrders(pagination.current_page)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update order status")
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "—"
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "—"
    }
  }

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-700"
    const statusLower = status.toLowerCase()
    if (statusLower.includes("completed")) return "bg-emerald-100 text-emerald-800"
    if (statusLower.includes("pending") || statusLower.includes("processing")) return "bg-yellow-100 text-yellow-800"
    if (statusLower.includes("failed") || statusLower.includes("cancelled")) return "bg-red-100 text-red-800"
    if (statusLower.includes("partial")) return "bg-green-100 text-green-800"
    if (statusLower.includes("refunded")) return "bg-green-100 text-green-800"
    return "bg-gray-100 text-gray-700"
  }

  const copyToClipboard = (text) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
    setActiveDropdown(null)
  }

  const statusOptions = [
    "All Status",
    "Completed",
    "Pending",
    "Processing",
    "In-Progress",
    "Partial",
    "Failed",
    "Cancelled",
    "Refunded",
  ]

  // Mobile Order Card
  const MobileOrderCard = ({ order }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-600 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">#{order.id}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {order.status || "—"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{formatDate(order.created_at || order.added_on)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleOrderExpansion(order.id)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {expandedOrder === order.id ? (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === order.id ? null : order.id)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>
            {activeDropdown === order.id && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    setEditingOrder(order)
                    setSelectedOrder(order)
                    setActiveDropdown(null)
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4 text-green-600" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedOrder(order)
                    setActiveDropdown(null)
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4 text-green-600" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => handleDelete(order.id)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Info */}
      <div className="space-y-2 mb-3">
        {hasValue(order.service_name || order.service?.service_title) && (
          <div>
            <span className="text-xs text-gray-500">Service:</span>
            <p className="text-sm font-medium text-gray-900 truncate">
              {order.service_name || order.service?.service_title || "—"}
            </p>
          </div>
        )}
        {order.user && (
          <div>
            <span className="text-xs text-gray-500">User:</span>
            <p className="text-sm font-medium text-gray-900">
              {order.user.first_name} {order.user.last_name} ({order.user.username || order.user.email})
            </p>
          </div>
        )}
        {hasValue(order.price) && (
          <div>
            <span className="text-xs text-gray-500">Price:</span>
            <p className="text-sm font-semibold text-gray-900">{formatPrice(order.price)}</p>
          </div>
        )}
        {hasValue(order.quantity) && (
          <div>
            <span className="text-xs text-gray-500">Quantity:</span>
            <p className="text-sm font-medium text-gray-900">{order.quantity}</p>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {expandedOrder === order.id && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
          {hasValue(order.link) && (
            <div>
              <span className="text-xs text-gray-500 mb-1 block">Link:</span>
              <div className="flex items-center gap-2">
                <a
                  href={order.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline text-sm truncate flex-1"
                >
                  {order.link.length > 50 ? `${order.link.substring(0, 50)}...` : order.link}
                </a>
                <button
                  onClick={() => copyToClipboard(order.link)}
                  className="text-gray-400 hover:text-green-500"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          {hasValue(order.start_counter) && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-gray-500">Start Counter:</span>
                <p className="text-sm font-medium">{order.start_counter}</p>
              </div>
              {hasValue(order.remains) && (
                <div>
                  <span className="text-xs text-gray-500">Remains:</span>
                  <p className="text-sm font-medium">{order.remains}</p>
                </div>
              )}
            </div>
          )}
          {hasValue(order.api_order_id) && (
            <div>
              <span className="text-xs text-gray-500">API Order ID:</span>
              <p className="text-sm font-mono">{order.api_order_id}</p>
            </div>
          )}
          {hasValue(order.status_description) && (
            <div>
              <span className="text-xs text-gray-500">Status Description:</span>
              <p className="text-sm bg-green-50 p-2 rounded text-green-700">{order.status_description}</p>
            </div>
          )}
          {hasValue(order.reason) && (
            <div>
              <span className="text-xs text-gray-500">Reason:</span>
              <p className="text-sm bg-red-50 p-2 rounded text-red-700">{order.reason}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )

  // Desktop Table Row
  const DesktopTableRow = ({ order }) => (
    <div className={`grid grid-cols-12 gap-4 px-6 py-4 items-center text-sm border-b border-gray-100 hover:bg-gray-50 transition-colors ${expandedOrder === order.id ? "bg-green-50" : ""}`}>
      <div className="col-span-1 font-bold text-gray-900">#{order.id}</div>
      <div className="col-span-2 text-gray-600 text-sm">
        {formatDate(order.created_at || order.added_on)}
      </div>
      <div className="col-span-2 text-gray-800 truncate font-medium" title={order.service_name || order.service?.service_title}>
        {order.service_name || order.service?.service_title || (order.service_id ? `Service #${order.service_id}` : "—")}
      </div>
      <div className="col-span-2">
        {order.user ? (
          <div>
            <p className="font-medium text-gray-900">{order.user.first_name} {order.user.last_name}</p>
            <p className="text-xs text-gray-500">{order.user.username || order.user.email}</p>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        )}
      </div>
      <div className="col-span-2">
        {hasValue(order.link) ? (
          <div className="flex items-center gap-2">
            <a
              href={order.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:underline truncate text-sm flex-1"
              title={order.link}
            >
              {order.link.length > 40 ? `${order.link.substring(0, 40)}...` : order.link}
            </a>
            <button
              onClick={() => copyToClipboard(order.link)}
              className="text-gray-400 hover:text-green-500 flex-shrink-0"
              title="Copy link"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        )}
      </div>
      <div className="col-span-1 font-semibold text-gray-900">
        {hasValue(order.price) ? formatPrice(order.price) : "—"}
      </div>
      <div className="col-span-1 text-gray-700 font-medium">
        {hasValue(order.quantity) ? order.quantity : "—"}
      </div>
      <div className="col-span-1">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {order.status || "—"}
        </span>
      </div>
      <div className="col-span-1 flex items-center space-x-2 justify-end">
        <button
          onClick={() => {
            setSelectedOrder(order)
            setActiveDropdown(null)
          }}
          className="text-gray-400 hover:text-green-600 transition-colors"
          title="View details"
        >
          <Eye className="w-4 h-4" />
        </button>
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === order.id ? null : order.id)}
            className="text-gray-400 hover:text-green-600 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {activeDropdown === order.id && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  setEditingOrder(order)
                  setSelectedOrder(order)
                  setActiveDropdown(null)
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4 text-green-600" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(order.id)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Orders</h1>
            <p className="text-gray-600 mt-1">View and manage all customer orders</p>
          </div>
          <button
            onClick={() => loadOrders(pagination.current_page)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total || 0}</p>
              </div>
              <ShoppingBag className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Completed</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {orders.filter(o => o.status?.toLowerCase().includes('completed')).length}
                </p>
              </div>
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {orders.filter(o => o.status?.toLowerCase().includes('pending') || o.status?.toLowerCase().includes('processing')).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatPrice(orders.reduce((sum, o) => sum + parseFloat(o.price || 0), 0))}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by order ID, service, user, or link..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table/List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No orders found</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="lg:hidden space-y-4">
              {orders.map((order) => (
                <MobileOrderCard key={order.id} order={order} />
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="min-w-full">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 text-white font-semibold text-sm bg-gradient-to-r from-green-600 to-green-700">
                  <div className="col-span-1">ID</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-2">Service</div>
                  <div className="col-span-2">User</div>
                  <div className="col-span-2">Link</div>
                  <div className="col-span-1">Price</div>
                  <div className="col-span-1">Qty</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <DesktopTableRow key={order.id} order={order} />
                ))}
              </div>
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => loadOrders(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1 || isLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {pagination.current_page} of {pagination.last_page}
                </span>
                <button
                  onClick={() => loadOrders(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page || isLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Edit Order Modal */}
        {editingOrder && (
          <EditOrderModal
            order={editingOrder}
            onClose={() => {
              setEditingOrder(null)
              setSelectedOrder(null)
            }}
            onSave={handleUpdate}
            onStatusUpdate={handleStatusUpdate}
            formatPrice={formatPrice}
            hasValue={hasValue}
            getStatusColor={getStatusColor}
            statusOptions={statusOptions.filter(s => s !== "All Status")}
          />
        )}

        {/* View Order Details Modal */}
        {selectedOrder && !editingOrder && (
          <ViewOrderModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            formatPrice={formatPrice}
            formatDate={formatDate}
            hasValue={hasValue}
            getStatusColor={getStatusColor}
            copyToClipboard={copyToClipboard}
          />
        )}
      </div>
    </div>
  )
}

// Edit Order Modal Component
const EditOrderModal = ({ order, onClose, onSave, onStatusUpdate, formatPrice, hasValue, getStatusColor, statusOptions }) => {
  const [formData, setFormData] = useState({
    status: order.status || "",
    refill_status: order.refill_status || "",
    status_description: order.status_description || "",
    reason: order.reason || "",
    link: order.link || "",
    quantity: order.quantity || "",
    price: order.price || "",
    start_counter: order.start_counter || "",
    remains: order.remains || "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onStatusUpdate(formData.status, formData.status_description, formData.reason)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Edit Order #{order.id}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Status Update Section */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Status Update</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Description</label>
                <textarea
                  name="status_description"
                  value={formData.status_description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Optional status description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Optional reason"
                />
              </div>
              <button
                type="button"
                onClick={handleStatusSubmit}
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
              >
                {isSubmitting ? "Updating..." : "Update Status Only"}
              </button>
            </div>
          </div>

          {/* Full Edit Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Full Order Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Counter</label>
                <input
                  type="number"
                  name="start_counter"
                  value={formData.start_counter}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remains</label>
                <input
                  type="number"
                  name="remains"
                  value={formData.remains}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// View Order Details Modal Component
const ViewOrderModal = ({ order, onClose, formatPrice, formatDate, hasValue, getStatusColor, copyToClipboard }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Order Details #{order.id}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Primary Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Order ID</div>
              <div className="font-semibold text-lg">#{order.id}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Status</div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status || "—"}
              </span>
            </div>
            {hasValue(order.price) && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Price</div>
                <div className="font-semibold text-lg">{formatPrice(order.price)}</div>
              </div>
            )}
            {hasValue(order.quantity) && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Quantity</div>
                <div className="font-semibold text-lg">{order.quantity}</div>
              </div>
            )}
          </div>

          {/* Service & User Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(hasValue(order.service_name) || order.service) && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Service</div>
                <div className="font-medium">{order.service_name || order.service?.service_title || "—"}</div>
              </div>
            )}
            {order.user && (
              <div>
                <div className="text-xs text-gray-500 mb-1">User</div>
                <div className="font-medium">
                  {order.user.first_name} {order.user.last_name}
                  <span className="text-gray-500 text-sm ml-2">({order.user.username || order.user.email})</span>
                </div>
              </div>
            )}
          </div>

          {/* Link */}
          {hasValue(order.link) && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Link</div>
              <div className="flex items-center gap-2">
                <a
                  href={order.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline break-all flex-1"
                >
                  {order.link}
                </a>
                <button onClick={() => copyToClipboard(order.link)} className="text-gray-400 hover:text-green-500">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Additional Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            {hasValue(order.api_order_id) && (
              <div>
                <div className="text-xs text-gray-500 mb-1">API Order ID</div>
                <div className="font-mono text-sm">{order.api_order_id}</div>
              </div>
            )}
            {hasValue(order.api_refill_id) && (
              <div>
                <div className="text-xs text-gray-500 mb-1">API Refill ID</div>
                <div className="font-mono text-sm">{order.api_refill_id}</div>
              </div>
            )}
            {hasValue(order.start_counter) && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Start Counter</div>
                <div>{order.start_counter}</div>
              </div>
            )}
            {hasValue(order.remains) && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Remains</div>
                <div>{order.remains}</div>
              </div>
            )}
          </div>

          {/* Status Description & Reason */}
          {hasValue(order.status_description) && (
            <div className="pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Status Description</div>
              <div className="bg-green-50 p-3 rounded text-green-700 border border-green-200">{order.status_description}</div>
            </div>
          )}
          {hasValue(order.reason) && (
            <div className="pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Reason</div>
              <div className="bg-red-50 p-3 rounded text-red-700 border border-red-200">{order.reason}</div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>Created:</span>
                <span className="text-gray-700">{formatDate(order.created_at || order.added_on)}</span>
              </div>
              {hasValue(order.updated_at) && (
                <div className="flex justify-between">
                  <span>Updated:</span>
                  <span className="text-gray-700">{formatDate(order.updated_at)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button onClick={onClose} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShowOrders
