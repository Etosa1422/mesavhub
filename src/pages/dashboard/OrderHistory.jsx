"use client"
import { useState, useEffect, useRef } from "react"
import { useOutletContext } from "react-router-dom"
import {
  Search,
  ExternalLink,
  RefreshCw,
  Download,
  Copy,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import toast from "react-hot-toast"
import { THEME_COLORS, CSS_COLORS } from "../../components/constant/colors"
import { fetchOrderHistory } from "../../services/services"

/* ---------- constants ---------- */
const statusTabs = [
  { id: "all", label: "All", color: null },
  { id: "pending", label: "Pending", color: "#3b82f6" },
  { id: "processing", label: "Processing", color: "#f59e0b" },
  { id: "in-progress", label: "In Progress", color: "#06b6d4" },
  { id: "completed", label: "Completed", color: "#10b981" },
  { id: "partial", label: "Partial", color: "#8b5cf6" },
  { id: "cancelled", label: "Cancelled", color: "#ef4444" },
  { id: "failed", label: "Failed", color: "#dc2626" },
  { id: "refunded", label: "Refunded", color: "#6b7280" },
]

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "processing":
      return `${THEME_COLORS.primary?.[100] ?? "bg-green-100"} ${THEME_COLORS.text?.primary700 ?? "text-green-700"}`
    case "in-progress":
      return "bg-cyan-100 text-cyan-800"
    case "partial":
      return "bg-green-100 text-green-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    case "failed":
      return "bg-red-100 text-red-800"
    case "refunded":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const formatDate = (dateString) => {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/* ---------- component ---------- */
const OrderHistory = () => {
  // Get currency context from DashboardLayout
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

  // Fallback convertToSelectedCurrency if not provided
  const convertToSelectedCurrency = contextConvertToSelectedCurrency || ((amount, sourceCurrency = "NGN") => {
    if (!amount || !selectedCurrency?.rate) return 0
    // Simple conversion: if rates are available, use them, otherwise assume 1:1
    return amount * (selectedCurrency.rate || 1)
  })

  // Fallback formatCurrency if not provided in context (matches NewOrder)
  const formatCurrency = contextFormatCurrency || ((amount, currency) => {
    if (!currency || amount === null || amount === undefined) return '0.00'
    const formattedAmount = parseFloat(amount).toFixed(2)
    return `${currency?.symbol || '₦'} ${formattedAmount}`
  })

  // Format price using the same currency as NewOrder page
  const formatPrice = (price) => {
    if (price === null || price === undefined || price === 0) {
      return formatCurrency(0, selectedCurrency)
    }
    // Convert price from NGN to selected currency (prices are stored in NGN in database)
    const convertedPrice = convertToSelectedCurrency(price, "NGN")
    return formatCurrency(convertedPrice, selectedCurrency)
  }
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusCounts, setStatusCounts] = useState({})
  const [pagination, setPagination] = useState({
    currentPage: 1,
    total: 0,
    perPage: 10,
    lastPage: 1,
  })
  const [expandedOrder, setExpandedOrder] = useState(null)

  // sorting
  const [sortBy, setSortBy] = useState(null) // column key
  const [sortOrder, setSortOrder] = useState("desc") // 'asc' | 'desc'

  // infinite scroll
  const sentinelRef = useRef(null)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders(1, { replace: true })
    }, 500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  // Fetch orders when tab or sorting changes
  useEffect(() => {
    fetchOrders(1, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, sortBy, sortOrder])

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !loading && !isFetchingMore) {
            if (pagination.currentPage < pagination.lastPage) {
              fetchOrders(pagination.currentPage + 1, { append: true })
            }
          }
        })
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      }
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage, pagination.lastPage, loading, isFetchingMore])

  const buildRequestPayload = (page = 1) => {
    return {
      status: activeTab === "all" ? null : activeTab,
      search: searchQuery,
      page,
      sort_by: sortBy,
      sort_order: sortOrder,
    }
  }

  const fetchOrders = async (page = 1, { replace = false, append = false } = {}) => {
    try {
      if (append) setIsFetchingMore(true)
      else setLoading(true)

      const payload = buildRequestPayload(page)
      console.log('🔄 Fetching orders with payload:', payload)
      
      const response = await fetchOrderHistory(payload)
      console.log('📦 API Response:', response)
      
      const incoming = response.data || []
      console.log('📊 Incoming orders data:', incoming)

      // Debug: Check first order structure
      if (incoming.length > 0) {
        console.log('🔍 First order structure:', incoming[0])
        console.log('📋 Available fields:', Object.keys(incoming[0]))
      }

      const newOrders = append ? [...orders, ...incoming] : incoming

      setOrders(newOrders)
      setStatusCounts(response.status_counts || {})

      setPagination({
        currentPage: response.meta?.current_page || page,
        total: response.meta?.total ?? (append ? pagination.total : incoming.length),
        perPage: response.meta?.per_page || pagination.perPage,
        lastPage: response.meta?.last_page || 1,
      })
    } catch (error) {
      console.error('❌ Error fetching orders:', error)
      console.error('📄 Error response:', error.response)
      toast.error(error.response?.data?.message || error.message || "Failed to fetch orders")
    } finally {
      setLoading(false)
      setIsFetchingMore(false)
    }
  }

  const handleRefresh = () => {
    fetchOrders(1, { replace: true })
    toast.success("Orders refreshed!")
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.lastPage) {
      fetchOrders(page, { replace: true })
    }
  }

  const handleExport = async ({ exportAll = false } = {}) => {
    try {
      toast.loading("Preparing CSV...", { id: "csv" })

      let exportOrders = orders

      if (exportAll && pagination.lastPage > pagination.currentPage) {
        // fetch remaining pages sequentially
        const all = [...orders]
        for (let p = pagination.currentPage + 1; p <= pagination.lastPage; p++) {
          const r = await fetchOrderHistory(buildRequestPayload(p))
          const d = r.data || []
          all.push(...d)
        }
        exportOrders = all
      }

      if (!exportOrders || exportOrders.length === 0) {
        toast.dismiss("csv")
        toast.error("No orders to export")
        return
      }

      // build CSV
      const headers = [
        "id",
        "user_id",
        "service_id",
        "api_order_id",
        "category_id",
        "link",
        "price",
        "quantity",
        "start_counter",
        "remains",
        "status",
        "status_description",
        "reason",
        "runs",
        "interval",
        "drip_feed",
        "refilled_at",
        "created_at",
        "updated_at",
      ]

      const csvRows = [
        headers.join(","),
        ...exportOrders.map((o) =>
          headers
            .map((h) => {
              let v = o[h]
              if (v === null || v === undefined) return '""'
              if (typeof v === "string") {
                return `"${v.replace(/"/g, '""')}"`
              }
              if (v instanceof Date) return `"${v.toISOString()}"`
              return `"${String(v)}"`
            })
            .join(",")
        ),
      ].join("\n")

      const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      const filename = `orders_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`
      link.setAttribute("download", filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.dismiss("csv")
      toast.success("CSV downloaded")
    } catch (err) {
      toast.dismiss("csv")
      toast.error("Failed to export CSV")
    }
  }

  const copyToClipboard = (text) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  const setSorting = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder((s) => (s === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(columnKey)
      setSortOrder("asc")
    }
  }

  // Helper function to check if value exists and is not null
  const hasValue = (value) => {
    return value !== null && value !== undefined && value !== ""
  }

  // Mobile table columns configuration - only show non-null values
  const mobileColumns = [
    { key: "id", label: "ID", className: "font-semibold", alwaysShow: true },
    { 
      key: "created_at", 
      label: "Date", 
      render: (order) => formatDate(order.created_at || order.added_on),
      alwaysShow: true
    },
    {
      key: "status",
      label: "Status",
      render: (order) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {order.status || "N/A"}
        </span>
      ),
      alwaysShow: true
    },
  ]

  /* ---------- small skeleton helpers ---------- */
  const MobileSkeleton = () => (
    <div className={`rounded-xl p-4 border ${THEME_COLORS.border?.primary200 ?? "border-gray-200"} ${THEME_COLORS.background?.card ?? "bg-white"} shadow-sm`}>
      <div className="animate-pulse space-y-3">
        <div className="flex justify-between">
          <div className="h-5 bg-gray-200 rounded w-20" />
          <div className="h-6 bg-gray-200 rounded w-16" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-12" />
            <div className="h-4 bg-gray-200 rounded w-full" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-12" />
            <div className="h-4 bg-gray-200 rounded w-full" />
          </div>
        </div>
        <div className="h-12 bg-gray-200 rounded" />
      </div>
    </div>
  )

  const DesktopRowSkeleton = ({ columns = 14 }) => (
    <div className={`grid grid-cols-14 gap-2 px-4 py-4 items-center text-sm`}>
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded w-full" />
      ))}
    </div>
  )

  return (
    <div className="w-full min-h-screen" style={{ background: CSS_COLORS.background?.primary ?? "#f7fafc" }}>
      {/* Mobile View (Table Cards) */}
      <div className="block lg:hidden w-full overflow-x-hidden">
        <div className="w-full p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-gray-800">Order History</h1>
            <button
              onClick={handleRefresh}
              className={`p-2 rounded-lg border flex items-center justify-center ${THEME_COLORS.background?.card ?? "bg-white"} ${THEME_COLORS.border?.primary200 ?? "border-gray-200"} ${THEME_COLORS.hover?.primary100 ?? ""}`}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Status Filter Pills */}
          <div className="overflow-x-auto pb-2 -mx-4 px-4">
            <div className="flex space-x-2" style={{ minWidth: "max-content" }}>
              {statusTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? `${THEME_COLORS.primary?.[500] ?? "bg-green-600"} text-white shadow-md`
                      : `${THEME_COLORS.background?.card ?? "bg-white"} text-gray-700 ${THEME_COLORS.border?.primary200 ?? "border-gray-200"} border ${THEME_COLORS.hover?.primary100 ?? ""}`
                  }`}
                >
                  {tab.color && activeTab !== tab.id && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: tab.color }} />}
                  <span>{tab.label}</span>
                  {statusCounts[tab.id] > 0 && activeTab !== tab.id && <span className="text-xs text-gray-500">({statusCounts[tab.id]})</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm ${THEME_COLORS.border?.primary200 ?? "border-gray-200"} ${THEME_COLORS.background?.muted ?? "bg-gray-50"}`}
              />
            </div>
            <button
              onClick={() => handleExport({ exportAll: false })}
              className={`px-4 py-3 rounded-xl border flex items-center justify-center gap-2 ${THEME_COLORS.background?.card ?? "bg-white"} ${THEME_COLORS.border?.primary200 ?? "border-gray-200"} ${THEME_COLORS.hover?.primary100 ?? ""} text-sm font-medium`}
              title="Export visible"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>

          {/* Orders List - Mobile Table Cards */}
          <div className="space-y-4">
            {loading && orders.length === 0 ? (
              <>
                <MobileSkeleton />
                <MobileSkeleton />
                <MobileSkeleton />
              </>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <div key={order.id} className={`rounded-xl p-4 border ${THEME_COLORS.border?.primary200 ?? "border-gray-200"} ${THEME_COLORS.background?.card ?? "bg-white"} shadow-sm hover:shadow-md transition-shadow`}>
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-100">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Order ID</div>
                      <div className="text-base font-bold text-gray-800">#{order.id}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1">Status</div>
                      <div className="flex flex-col items-end gap-1">
                        {mobileColumns.find(c => c.key === "status")?.render(order)}
                        {order.status?.toLowerCase() === 'refunded' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            Refunded
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Main Info Grid - Only show non-null values */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Date</div>
                      <div className="text-sm font-medium text-gray-800">{formatDate(order.created_at || order.added_on)}</div>
                    </div>
                    {hasValue(order.price) && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Price</div>
                        <div className="text-sm font-semibold text-gray-800">{formatPrice(order.price)}</div>
                      </div>
                    )}
                    {(order.service_name || order.service_id) && (
                      <div className="col-span-2">
                        <div className="text-xs text-gray-500 mb-1">Service</div>
                        <div className="text-sm font-medium text-gray-800 truncate">{order.service_name || `Service #${order.service_id}`}</div>
                      </div>
                    )}
                    {hasValue(order.quantity) && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Quantity</div>
                        <div className="text-sm font-medium text-gray-800">{order.quantity}</div>
                      </div>
                    )}
                    {hasValue(order.remains) && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Remains</div>
                        <div className="text-sm font-medium text-gray-800">{order.remains}</div>
                      </div>
                    )}
                    {hasValue(order.start_counter) && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Start Counter</div>
                        <div className="text-sm font-medium text-gray-800">{order.start_counter}</div>
                      </div>
                    )}
                  </div>

                  {/* Link Preview - Only show if exists */}
                  {hasValue(order.link) && (
                    <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Link</div>
                      <div className="flex items-center gap-2">
                        <a 
                          href={order.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs text-green-600 hover:underline truncate flex-1"
                          title={order.link}
                        >
                          {order.link?.length > 40 ? `${order.link.substring(0, 40)}...` : order.link}
                        </a>
                        <button 
                          onClick={() => copyToClipboard(order.link)} 
                          className="text-gray-400 hover:text-green-500 flex-shrink-0"
                          title="Copy link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Expandable details section */}
                  <button
                    onClick={() => toggleOrderExpansion(order.id)}
                    className="w-full pt-3 border-t border-gray-200 flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <span>{expandedOrder === order.id ? "Hide" : "View"} Details</span>
                    {expandedOrder === order.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>

                  {expandedOrder === order.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                      {/* Link - Full display - Only if exists */}
                      {hasValue(order.link) && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-medium text-gray-700">Full Link</div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => copyToClipboard(order.link)} 
                                className="text-gray-500 hover:text-green-600 transition-colors"
                                title="Copy link"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <a 
                                href={order.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-xs text-green-600 hover:underline font-medium"
                              >
                                Open
                              </a>
                            </div>
                          </div>
                          <a 
                            href={order.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-green-600 hover:underline break-all block"
                          >
                            {order.link}
                          </a>
                        </div>
                      )}

                      {/* Order Details Grid - Only show non-null values */}
                      <div className="grid grid-cols-2 gap-3">
                        {hasValue(order.api_order_id) && (
                          <div className="p-2 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">API Order ID</div>
                            <div className="text-sm font-medium text-gray-800">{order.api_order_id}</div>
                          </div>
                        )}
                        {hasValue(order.api_refill_id) && (
                          <div className="p-2 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">API Refill ID</div>
                            <div className="text-sm font-medium text-gray-800">{order.api_refill_id}</div>
                          </div>
                        )}
                        {hasValue(order.category_id) && (
                          <div className="p-2 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Category ID</div>
                            <div className="text-sm font-medium text-gray-800">{order.category_id}</div>
                          </div>
                        )}
                        {hasValue(order.service_id) && (
                          <div className="p-2 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">Service ID</div>
                            <div className="text-sm font-medium text-gray-800">{order.service_id}</div>
                          </div>
                        )}
                      </div>

                      {/* Status Description - Only if exists */}
                      {hasValue(order.status_description) && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                          <div className="text-xs font-medium text-green-700 mb-1">Status Description</div>
                          <div className="text-sm text-green-800">{order.status_description}</div>
                        </div>
                      )}

                      {/* Refill Status - Only if exists */}
                      {hasValue(order.refill_status) && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                          <div className="text-xs font-medium text-green-700 mb-1">Refill Status</div>
                          <div className="text-sm text-green-800">{order.refill_status}</div>
                        </div>
                      )}

                      {/* Reason - Only if exists */}
                      {hasValue(order.reason) && (
                        <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                          <div className="text-xs font-medium text-red-700 mb-1">Reason</div>
                          <div className="text-sm text-red-800">{order.reason}</div>
                        </div>
                      )}

                      {/* Additional Details - Only show non-null values */}
                      {(hasValue(order.runs) || hasValue(order.interval) || hasValue(order.drip_feed) || hasValue(order.refilled_at)) && (
                        <div className="grid grid-cols-2 gap-2">
                          {hasValue(order.runs) && (
                            <div className="p-2 bg-gray-50 rounded-lg">
                              <div className="text-xs text-gray-500 mb-1">Runs</div>
                              <div className="text-sm font-medium text-gray-800">{order.runs}</div>
                            </div>
                          )}
                          {hasValue(order.interval) && (
                            <div className="p-2 bg-gray-50 rounded-lg">
                              <div className="text-xs text-gray-500 mb-1">Interval (min)</div>
                              <div className="text-sm font-medium text-gray-800">{order.interval}</div>
                            </div>
                          )}
                          {hasValue(order.drip_feed) && (
                            <div className="p-2 bg-gray-50 rounded-lg">
                              <div className="text-xs text-gray-500 mb-1">Drip Feed</div>
                              <div className="text-sm font-medium text-gray-800">{order.drip_feed ? "Yes" : "No"}</div>
                            </div>
                          )}
                          {hasValue(order.refilled_at) && (
                            <div className="p-2 bg-gray-50 rounded-lg">
                              <div className="text-xs text-gray-500 mb-1">Refilled At</div>
                              <div className="text-sm font-medium text-gray-800">{formatDate(order.refilled_at)}</div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="pt-2 border-t border-gray-200">
                        <div className="text-xs text-gray-500 space-y-1">
                          {(order.created_at || order.added_on) && (
                            <div className="flex justify-between">
                              <span>Created:</span>
                              <span className="text-gray-700">{formatDate(order.created_at || order.added_on)}</span>
                            </div>
                          )}
                          {hasValue(order.updated_at) && (
                            <div className="flex justify-between">
                              <span>Updated:</span>
                              <span className="text-gray-700">{formatDate(order.updated_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className={`w-16 h-16 ${THEME_COLORS.background?.muted ?? "bg-gray-100"} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium text-base mb-1">No orders found</p>
                <p className="text-sm text-gray-500">{searchQuery ? "Try adjusting your search terms" : "You haven't placed any orders yet"}</p>
              </div>
            )}
          </div>

          {/* Loading More Indicator */}
          {isFetchingMore && (
            <div className="flex justify-center items-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500" />
            </div>
          )}

          {/* Pagination Info */}
          {orders.length > 0 && (
            <div className={`rounded-xl p-4 border ${THEME_COLORS.border?.primary200 ?? "border-gray-200"} ${THEME_COLORS.background?.card ?? "bg-white"}`}>
              <div className="text-center text-sm text-gray-600">
                Showing {orders.length} of {pagination.total} orders
                {pagination.currentPage < pagination.lastPage && (
                  <span className="block mt-1 text-xs text-gray-500">Scroll down for more</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block p-4 xl:p-6">
        <div className="space-y-6">
          {/* Status Filter Pills */}
          <div className={`rounded-xl p-6 border ${THEME_COLORS.border?.primary200 ?? "border-gray-200"} ${THEME_COLORS.background?.card ?? "bg-white"}`}>
            <div className="flex flex-wrap gap-3">
              {statusTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium ${
                    activeTab === tab.id
                      ? `${THEME_COLORS.primary?.[500] ?? "bg-green-600"} text-white shadow-lg`
                      : `${THEME_COLORS.background?.card ?? "bg-white"} text-gray-700 ${THEME_COLORS.border?.primary200 ?? "border-gray-200"} border ${THEME_COLORS.hover?.primary100 ?? ""}`
                  }`}
                >
                  {tab.color && activeTab !== tab.id && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tab.color }} />}
                  <span>{tab.label}</span>
                  {statusCounts[tab.id] > 0 && activeTab !== tab.id && <span className="text-xs text-gray-500">({statusCounts[tab.id]})</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Actions */}
          <div className={`rounded-xl p-6 border ${THEME_COLORS.border?.primary200 ?? "border-gray-200"} ${THEME_COLORS.background?.card ?? "bg-white"}`}>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search orders, services, or links..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base ${THEME_COLORS.border?.primary200 ?? "border-gray-200"} ${THEME_COLORS.background?.muted ?? "bg-gray-50"}`}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={handleRefresh} className={`p-3 rounded-xl border flex items-center ${THEME_COLORS.background?.card ?? "bg-white"} ${THEME_COLORS.border?.primary200 ?? "border-gray-200"} ${THEME_COLORS.hover?.primary100 ?? ""}`}>
                  <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                </button>
                <div className="relative inline-flex">
                  <button onClick={() => handleExport({ exportAll: false })} className={`p-3 rounded-xl border flex items-center ${THEME_COLORS.background?.card ?? "bg-white"} ${THEME_COLORS.border?.primary200 ?? "border-gray-200"} ${THEME_COLORS.hover?.primary100 ?? ""}`}>
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleExport({ exportAll: true })}
                    className={`p-3 rounded-xl border flex items-center -ml-px ${THEME_COLORS.background?.card ?? "bg-white"} ${THEME_COLORS.border?.primary200 ?? "border-gray-200"} ${THEME_COLORS.hover?.primary100 ?? ""}`}
                    title="Export all pages"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className={`rounded-xl border overflow-hidden ${THEME_COLORS.border?.primary200 ?? "border-gray-200"} ${THEME_COLORS.background?.card ?? "bg-white"} shadow-sm`}>
            {/* Table Header - Better organized */}
            <div className="min-w-full">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 text-white font-semibold text-sm" style={{ background: CSS_COLORS.background?.sidebar ?? "#0f172a" }}>
                <div className="col-span-1 cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1" onClick={() => setSorting("id")}>
                  ID {sortBy === "id" && (sortOrder === "asc" ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}
                </div>
                <div className="col-span-2 cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1" onClick={() => setSorting("created_at")}>
                  Date {sortBy === "created_at" && (sortOrder === "asc" ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}
                </div>
                <div className="col-span-2">Service</div>
                <div className="col-span-3">Link</div>
                <div className="col-span-1 cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1" onClick={() => setSorting("price")}>
                  Price {sortBy === "price" && (sortOrder === "asc" ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}
                </div>
                <div className="col-span-1 cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1" onClick={() => setSorting("quantity")}>
                  Qty {sortBy === "quantity" && (sortOrder === "asc" ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}
                </div>
                <div className="col-span-1 cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1" onClick={() => setSorting("status")}>
                  Status {sortBy === "status" && (sortOrder === "asc" ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}
                </div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {loading && orders.length === 0 ? (
                <>
                  <DesktopRowSkeleton />
                  <DesktopRowSkeleton />
                  <DesktopRowSkeleton />
                </>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <div key={order.id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center text-sm border-b border-gray-100 hover:bg-gray-50 transition-colors ${expandedOrder === order.id ? "bg-green-50" : ""}`}>
                    <div className="col-span-1 font-bold text-gray-900">#{order.id}</div>
                    <div className="col-span-2 text-gray-600 text-sm">
                      {formatDate(order.created_at || order.added_on)}
                    </div>
                    <div className="col-span-2 text-gray-800 truncate font-medium" title={order.service_name || `Service #${order.service_id}`}>
                      {order.service_name || (order.service_id ? `Service #${order.service_id}` : "—")}
                    </div>
                    <div className="col-span-3">
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
                    <div className="col-span-1 flex flex-col gap-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status || "—"}
                      </span>
                      {order.status?.toLowerCase() === 'refunded' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          Refunded
                        </span>
                      )}
                    </div>
                    <div className="col-span-1 flex items-center space-x-2 justify-end">
                      {hasValue(order.link) && (
                        <a 
                          href={order.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-gray-400 hover:text-green-600 transition-colors" 
                          title="Open link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button 
                        onClick={() => toggleOrderExpansion(order.id)} 
                        className="text-gray-400 hover:text-green-600 transition-colors" 
                        title="View details"
                      >
                        {expandedOrder === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16">
                  <div className={`w-16 h-16 ${THEME_COLORS.background?.muted ?? "bg-gray-100"} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No orders found</p>
                  <p className="text-sm text-gray-400 mt-1">{searchQuery ? "Try adjusting your search terms" : "You haven't placed any orders yet"}</p>
                </div>
              )}

              {/* Loading more indicator */}
              {isFetchingMore && (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500" />
                </div>
              )}
            </div>
          </div>

          {/* Expanded Order Details Modal */}
          {expandedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setExpandedOrder(null)}>
              <div 
                className={`rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto ${THEME_COLORS.background?.card ?? "bg-white"} ${THEME_COLORS.border?.primary200 ?? "border-gray-200"} border shadow-2xl`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">Order Details #{expandedOrder}</h3>
                  <button 
                    onClick={() => setExpandedOrder(null)} 
                    className="text-gray-500 hover:text-gray-700 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    ×
                  </button>
                </div>

                {(() => {
                  const order = orders.find((o) => o.id === expandedOrder)
                  if (!order) return null

                  return (
                    <div className="space-y-4 text-sm">
                      {/* Primary Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Order ID</div>
                          <div className="font-semibold text-base">#{order.id}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Status</div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{order.status || "—"}</span>
                        </div>
                        {hasValue(order.price) && (
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Price</div>
                            <div className="font-semibold text-base">{formatPrice(order.price)}</div>
                          </div>
                        )}
                        {hasValue(order.quantity) && (
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Quantity</div>
                            <div className="font-semibold text-base">{order.quantity}</div>
                          </div>
                        )}
                      </div>

                      {/* Link - Only if exists */}
                      {hasValue(order.link) && (
                        <div>
                          <div className="text-xs text-gray-500 mb-2">Link</div>
                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <a 
                              href={order.link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-green-600 hover:underline break-all flex-1 text-sm"
                            >
                              {order.link}
                            </a>
                            <button 
                              onClick={() => copyToClipboard(order.link)} 
                              className="text-gray-400 hover:text-green-500 flex-shrink-0"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Status Description - Only if exists */}
                      {hasValue(order.status_description) && (
                        <div>
                          <div className="text-xs text-gray-500 mb-2">Status Description</div>
                          <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-sm text-green-800">{order.status_description}</div>
                        </div>
                      )}

                      {/* Refill Status - Only if exists */}
                      {hasValue(order.refill_status) && (
                        <div>
                          <div className="text-xs text-gray-500 mb-2">Refill Status</div>
                          <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-sm text-green-800">{order.refill_status}</div>
                        </div>
                      )}

                      {/* Reason - Only if exists */}
                      {hasValue(order.reason) && (
                        <div>
                          <div className="text-xs text-gray-500 mb-2">Reason</div>
                          <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-sm text-red-800">{order.reason}</div>
                        </div>
                      )}

                      {/* Additional Details - Only show non-null values */}
                      {(hasValue(order.api_order_id) || hasValue(order.api_refill_id) || hasValue(order.category_id) || hasValue(order.service_id) || hasValue(order.user_id)) && (
                        <div>
                          <div className="text-xs font-medium text-gray-700 mb-2">Order Information</div>
                          <div className="grid grid-cols-2 gap-3">
                            {hasValue(order.api_order_id) && (
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">API Order ID</div>
                                <div className="text-sm font-medium text-gray-800">{order.api_order_id}</div>
                              </div>
                            )}
                            {hasValue(order.api_refill_id) && (
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">API Refill ID</div>
                                <div className="text-sm font-medium text-gray-800">{order.api_refill_id}</div>
                              </div>
                            )}
                            {hasValue(order.service_id) && (
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">Service ID</div>
                                <div className="text-sm font-medium text-gray-800">{order.service_id}</div>
                              </div>
                            )}
                            {hasValue(order.category_id) && (
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">Category ID</div>
                                <div className="text-sm font-medium text-gray-800">{order.category_id}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Counters - Only show non-null values */}
                      {(hasValue(order.start_counter) || hasValue(order.remains)) && (
                        <div>
                          <div className="text-xs font-medium text-gray-700 mb-2">Counters</div>
                          <div className="grid grid-cols-2 gap-3">
                            {hasValue(order.start_counter) && (
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">Start Counter</div>
                                <div className="text-sm font-medium text-gray-800">{order.start_counter}</div>
                              </div>
                            )}
                            {hasValue(order.remains) && (
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">Remains</div>
                                <div className="text-sm font-medium text-gray-800">{order.remains}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Drip Feed Settings - Only if any value exists */}
                      {(hasValue(order.runs) || hasValue(order.interval) || hasValue(order.drip_feed) || hasValue(order.refilled_at)) && (
                        <div>
                          <div className="text-xs font-medium text-gray-700 mb-2">Drip Feed Settings</div>
                          <div className="grid grid-cols-2 gap-3">
                            {hasValue(order.runs) && (
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">Runs</div>
                                <div className="text-sm font-medium text-gray-800">{order.runs}</div>
                              </div>
                            )}
                            {hasValue(order.interval) && (
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">Interval (minutes)</div>
                                <div className="text-sm font-medium text-gray-800">{order.interval}</div>
                              </div>
                            )}
                            {hasValue(order.drip_feed) && (
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">Drip Feed</div>
                                <div className="text-sm font-medium text-gray-800">{order.drip_feed ? "Enabled" : "Disabled"}</div>
                              </div>
                            )}
                            {hasValue(order.refilled_at) && (
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">Refilled At</div>
                                <div className="text-sm font-medium text-gray-800">{formatDate(order.refilled_at)}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500 space-y-2">
                          {(order.created_at || order.added_on) && (
                            <div className="flex justify-between">
                              <span>Created:</span>
                              <span className="text-gray-700 font-medium">{formatDate(order.created_at || order.added_on)}</span>
                            </div>
                          )}
                          {hasValue(order.updated_at) && (
                            <div className="flex justify-between">
                              <span>Updated:</span>
                              <span className="text-gray-700 font-medium">{formatDate(order.updated_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-gray-200">
                        <button 
                          onClick={() => setExpandedOrder(null)} 
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

          {/* Pagination (fallback) */}
          {orders.length > 0 && (
            <div className={`rounded-xl p-4 border ${THEME_COLORS.border?.primary200 ?? "border-gray-200"} ${THEME_COLORS.background?.card ?? "bg-white"}`}>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Showing {orders.length} of {pagination.total} orders</div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1 || loading} className={`px-4 py-2 border rounded-lg text-sm font-medium disabled:opacity-50 ${THEME_COLORS.border?.primary200 ?? "border-gray-200"} ${THEME_COLORS.hover?.primary100 ?? ""}`}>
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-600">Page {pagination.currentPage} of {pagination.lastPage}</span>
                  <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.lastPage || loading} className={`px-4 py-2 border rounded-lg text-sm font-medium disabled:opacity-50 ${THEME_COLORS.border?.primary200 ?? "border-gray-200"} ${THEME_COLORS.hover?.primary100 ?? ""}`}>
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Shared sentinel for infinite scroll */}
      <div ref={sentinelRef} />
    </div>
  )
}

export default OrderHistory