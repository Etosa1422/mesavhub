"use client"

import { useState, useEffect } from "react"
import { Search, UserPlus, Menu, X, RefreshCw, Download, Filter } from "lucide-react"
import UserDetailsCard from "./UserDetailsCard"
import UserForm from "./UserForm"
import SendEmailForm from "./SendEmailForm"
import BalanceForm from "./BalanceForm"
import CustomRateForm from "./CustomRateForm"
import UserTable from "./UserTable"
import UserStats from "./UserStats"
import { 
  fetchUsers, 
  updateUser, 
  deleteUser, 
  changeUserStatus,
  generateUserApiKey,
  adjustUserBalance,
  sendEmailToUser,
  fetchUserOrders,
  fetchUserTransactions,
  loginAsUser,
} from "../../services/adminService"
import toast from "react-hot-toast"
import { useOutletContext } from "react-router-dom"

const ManageUsers = () => {
  // State management
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [selectedUser, setSelectedUser] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeUserAction, setActiveUserAction] = useState(null)
  const [users, setUsers] = useState({ data: [] })
  const [activeDropdownUserId, setActiveDropdownUserId] = useState(null)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  })

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

  // Format user balance with currency conversion
  const formatUserBalance = (user) => {
    if (!user || user.balance === null || user.balance === undefined) return formatCurrency(0, selectedCurrency)
    const userCurrency = user.currency || "NGN"
    const convertedBalance = convertToSelectedCurrency(user.balance, userCurrency)
    return formatCurrency(convertedBalance, selectedCurrency)
  }

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.current_page === 1) {
        loadUsers()
      } else {
        setPagination(prev => ({ ...prev, current_page: 1 }))
      }
    }, 500) // 500ms debounce
    
    return () => clearTimeout(timer)
  }, [searchTerm, statusFilter])

  // Fetch users on component mount and when pagination changes
  useEffect(() => {
    loadUsers()
  }, [pagination.current_page])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const params = {
        page: pagination.current_page,
        per_page: pagination.per_page,
      }
      if (searchTerm) params.search = searchTerm
      if (statusFilter !== "All Status") params.status = statusFilter.toLowerCase()

      const response = await fetchUsers(params)
      
      // Handle both paginated and non-paginated responses
      if (response?.data) {
        setUsers({ data: response.data })
        setPagination(prev => ({
          ...prev,
          current_page: response.current_page || 1,
          last_page: response.last_page || 1,
          total: response.total || response.data.length,
        }))
      } else if (Array.isArray(response)) {
        setUsers({ data: response })
        setPagination(prev => ({
          ...prev,
          total: response.length,
        }))
      } else {
        setUsers({ data: [] })
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error("Request timeout")
        toast.error("Request took too long. Please try again.")
      } else {
        console.error("Failed to fetch users:", error)
        toast.error("Failed to load users. Please try again.")
      }
      setUsers({ data: [] })
    } finally {
      setIsLoading(false)
    }
  }

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
    address: "",
    preferred_language: "English",
    status: "active",
    email_verified: false,
    sms_verified: false,
    two_factor_enabled: false,
    balance: "",
    currency: "NGN",
    account_type: "standard",
  })

  // Handler functions
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (editingUser) {
        // Update existing user
        const updateData = {
          firstname: formData.first_name,
          lastname: formData.last_name,
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        }
        
        await updateUser(editingUser.id, updateData)
        toast.success("User updated successfully!")
        await loadUsers()
        setEditingUser(null)
        setShowAddForm(false)
        setActiveUserAction(null)
      } else {
        toast.error("User creation not yet implemented. Please use registration.")
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "Failed to update user"
      toast.error(errorMsg)
      console.error("User update error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (user) => {
    setFormData({
      first_name: user.first_name || user.firstname || "",
      last_name: user.last_name || user.lastname || "",
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      preferred_language: user.preferred_language || "English",
      status: user.status === 1 ? "active" : user.status === 0 ? "banned" : user.status || "active",
      email_verified: user.email_verified || false,
      sms_verified: user.sms_verified || false,
      two_factor_enabled: user.two_factor_enabled || false,
      balance: (user.balance || 0).toString(),
      currency: user.currency || "NGN",
      account_type: user.account_type || "standard",
    })
    setEditingUser(user)
    setShowAddForm(true)
    setSelectedUser(null)
    setActiveUserAction("edit")
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    setIsLoading(true)
    try {
      await deleteUser(id)
      toast.success("User deleted successfully!")
      await loadUsers()
      if (selectedUser?.id === id) {
        setSelectedUser(null)
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "Failed to delete user"
      toast.error(errorMsg)
      console.error("Delete user error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleUserStatus = async (id) => {
    setIsLoading(true)
    try {
      const user = users.data.find(u => u.id === id)
      if (!user) return

      // Convert status to backend format (0 = banned, 1 = active)
      const newStatus = user.status === "active" || user.status === 1 ? 0 : 1
      
      await changeUserStatus(id, newStatus)
      toast.success(`User ${newStatus === 1 ? "activated" : "deactivated"} successfully!`)
      await loadUsers()
      
      // Update selected user if it's the one being toggled
      if (selectedUser?.id === id) {
        const updatedUser = { ...selectedUser, status: newStatus === 1 ? "active" : "banned" }
        setSelectedUser(updatedUser)
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "Failed to update user status"
      toast.error(errorMsg)
      console.error("Toggle status error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateApiKey = async (userId) => {
    setIsLoading(true)
    try {
      const response = await generateUserApiKey(userId)
      toast.success("API key generated successfully!")
      await loadUsers()
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, api_token: response.data?.api_key })
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "Failed to generate API key"
      toast.error(errorMsg)
      console.error("Generate API key error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (user) => {
    setSelectedUser(user)
    setActiveUserAction(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleActionSubmit = async (action, data) => {
    switch (action) {
      case "add_subtract_balance":
        setIsLoading(true)
        try {
          await adjustUserBalance(
            data.userId,
            data.action,
            data.amount,
            data.notes || ""
          )
          toast.success(`Balance ${data.action === "add" ? "added" : "subtracted"} successfully!`)
          await loadUsers()
          // Refresh selected user from the reloaded list
          if (selectedUser?.id === data.userId) {
            setSelectedUser(prev => {
              const updated = users.data?.find(u => u.id === data.userId)
              return updated || prev
            })
          }
        } catch (error) {
          const errorMsg = error?.response?.data?.message || "Failed to adjust balance"
          toast.error(errorMsg)
        } finally {
          setIsLoading(false)
        }
        setActiveUserAction(null)
        break
      case "send_email":
        setIsLoading(true)
        try {
          await sendEmailToUser(data.userId, data.subject, data.message)
          toast.success("Email sent successfully!")
        } catch (error) {
          const errorMsg = error?.response?.data?.message || "Failed to send email"
          toast.error(errorMsg)
        } finally {
          setIsLoading(false)
        }
        setActiveUserAction(null)
        break
      case "custom_rate":
        toast.success(`Custom rate set for ${data.service}: ${data.rate}${data.type === "percentage" ? "%" : ""}`)
        setActiveUserAction(null)
        break
      case "login_as_user":
        handleLoginAsUser(data.userId)
        break
      default:
        break
    }
  }

  const handleLoginAsUser = async (userId) => {
    setIsLoading(true)
    try {
      // Store current admin session before impersonating
      const adminToken = localStorage.getItem('adminToken')
      const adminData = localStorage.getItem('adminData')
      
      // Store admin info for return
      if (adminToken) {
        sessionStorage.setItem('adminToken_backup', adminToken)
      }
      if (adminData) {
        sessionStorage.setItem('adminData_backup', adminData)
      }
      
      // Login as user
      const response = await loginAsUser(userId)
      
      if (response.success && response.token && response.user) {
        // Store user token and data
        localStorage.setItem('authToken', response.token)
        localStorage.setItem('userData', JSON.stringify(response.user))
        localStorage.setItem('isAdminImpersonating', 'true') // Flag to indicate impersonation
        
        toast.success(`Logged in as ${response.user.first_name || response.user.firstname || response.user.username}`)
        
        // Navigate to user dashboard
        window.location.href = '/dashboard'
      } else {
        toast.error(response.message || 'Failed to login as user')
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "Failed to login as user"
      toast.error(errorMsg)
      console.error("Login as user error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Users are already filtered in loadUsers, so use them directly
  const filteredUsers = users.data || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-cyan-50 to-green-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">
            <span>Dashboard</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Users</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Manage Users</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Manage user accounts, permissions, and activities
              </p>
            </div>
            <button
              onClick={loadUsers}
              disabled={isLoading}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* User Details Card */}
        {selectedUser && !activeUserAction && (
          <UserDetailsCard
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onCopyApiKey={() => handleGenerateApiKey(selectedUser.id)}
            onEdit={handleEdit}
            onToggleStatus={toggleUserStatus}
            showPasswordChange={false}
            onTogglePasswordChange={() => {}}
            onPasswordUpdate={() => {}}
            passwordData={{ new_password: "", confirm_password: "" }}
            onPasswordChange={() => {}}
            onActionSelect={(action, userData) => {
              if (action === "add_subtract_balance" || action === "send_email" || action === "custom_rate") {
                setActiveUserAction(action)
              } else if (action === "login_as_user") {
                handleActionSubmit("login_as_user", { userId: selectedUser.id })
              } else {
                toast.info(`Action "${action}" coming soon!`)
              }
            }}
          />
        )}

        {/* Conditional Rendering - Forms */}
        {activeUserAction === "edit" && showAddForm && editingUser && (
          <UserForm
            formData={formData}
            editingUser={editingUser}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onClose={() => {
              setShowAddForm(false)
              setEditingUser(null)
              setActiveUserAction(null)
            }}
          />
        )}

        {activeUserAction === "send_email" && selectedUser && (
          <SendEmailForm
            user={selectedUser}
            onCancel={() => setActiveUserAction(null)}
            onSubmit={(data) => handleActionSubmit("send_email", {
              userId: selectedUser.id,
              ...data
            })}
          />
        )}

        {activeUserAction === "add_subtract_balance" && selectedUser && (
          <BalanceForm
            user={selectedUser}
            onCancel={() => setActiveUserAction(null)}
            onSubmit={(data) => handleActionSubmit("add_subtract_balance", {
              userId: selectedUser.id,
              ...data
            })}
          />
        )}

        {activeUserAction === "custom_rate" && selectedUser && (
          <CustomRateForm
            user={selectedUser}
            onCancel={() => setActiveUserAction(null)}
            onSubmit={(data) => handleActionSubmit("custom_rate", {
              userId: selectedUser.id,
              ...data
            })}
          />
        )}

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
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white min-w-[140px] transition-all duration-200 text-sm"
                >
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Banned</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingUser(null)
                    setSelectedUser(null)
                    setActiveUserAction(null)
                    toast.info("User creation is handled through registration. Please use the registration system.")
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <UserTable
          users={filteredUsers}
          selectedUser={selectedUser}
          showAddForm={showAddForm}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onToggleStatus={toggleUserStatus}
          onSyncServices={() => {}}
          onDelete={handleDelete}
          isLoading={isLoading}
          formatCurrency={formatUserBalance}
          activeDropdownUserId={activeDropdownUserId}
          setActiveDropdownUserId={setActiveDropdownUserId}
        />

        {/* Stats Summary */}
        <UserStats users={users.data || []} formatCurrency={formatCurrency} selectedCurrency={selectedCurrency} convertToSelectedCurrency={convertToSelectedCurrency} />

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
              disabled={pagination.current_page === 1 || isLoading}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
              disabled={pagination.current_page >= pagination.last_page || isLoading}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageUsers
