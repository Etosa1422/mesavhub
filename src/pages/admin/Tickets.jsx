"use client"

import React, { useEffect, useState } from 'react'
import { 
  Search, 
  Filter, 
  X, 
  Send, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Eye,
  Edit3,
  Trash2,
  MoreVertical,
  Loader2,
  RefreshCw,
  Mail,
  Flag,
  User,
  Calendar
} from 'lucide-react'
import { 
  fetchAdminTickets, 
  fetchAdminTicketDetails,
  updateTicketStatus,
  updateTicketPriority,
  replyToTicketAdmin,
  deleteTicket
} from '../../services/adminService'
import toast from 'react-hot-toast'

const AdminTickets = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [replyMessage, setReplyMessage] = useState("")
  const [isInternal, setIsInternal] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [isLoadingTicket, setIsLoadingTicket] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [activeDropdown, setActiveDropdown] = useState(null)

  const loadTickets = async () => {
    try {
      setLoading(true)
      const params = {
        status: statusFilter !== "all" ? statusFilter : undefined,
        priority: priorityFilter !== "all" ? priorityFilter : undefined,
        search: searchTerm || undefined,
      }
      const data = await fetchAdminTickets(params)
      setTickets(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load tickets:', error)
      toast.error('Failed to load tickets')
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [statusFilter, priorityFilter])

  const handleViewTicket = async (ticketId) => {
    setIsLoadingTicket(true)
    try {
      const response = await fetchAdminTicketDetails(ticketId)
      setSelectedTicket(response.ticket || response.data)
      setShowTicketModal(true)
    } catch (error) {
      toast.error('Failed to load ticket details')
    } finally {
      setIsLoadingTicket(false)
    }
  }

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      await updateTicketStatus(ticketId, newStatus)
      toast.success('Ticket status updated')
      loadTickets()
      if (selectedTicket && selectedTicket.id === ticketId) {
        const response = await fetchAdminTicketDetails(ticketId)
        setSelectedTicket(response.ticket || response.data)
      }
      setActiveDropdown(null)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update status')
    }
  }

  const handlePriorityUpdate = async (ticketId, newPriority) => {
    try {
      await updateTicketPriority(ticketId, newPriority)
      toast.success('Ticket priority updated')
      loadTickets()
      if (selectedTicket && selectedTicket.id === ticketId) {
        const response = await fetchAdminTicketDetails(ticketId)
        setSelectedTicket(response.ticket || response.data)
      }
      setActiveDropdown(null)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update priority')
    }
  }

  const handleReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return
    
    setIsReplying(true)
    try {
      await replyToTicketAdmin(selectedTicket.id, replyMessage, isInternal)
      toast.success(isInternal ? 'Internal note added' : 'Reply sent successfully!')
      setReplyMessage("")
      setIsInternal(false)
      // Reload ticket details
      const response = await fetchAdminTicketDetails(selectedTicket.id)
      setSelectedTicket(response.ticket || response.data)
      loadTickets()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to send reply')
    } finally {
      setIsReplying(false)
    }
  }

  const handleDelete = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return
    
    try {
      await deleteTicket(ticketId)
      toast.success('Ticket deleted successfully')
      loadTickets()
      if (selectedTicket && selectedTicket.id === ticketId) {
        setShowTicketModal(false)
        setSelectedTicket(null)
      }
      setActiveDropdown(null)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete ticket')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      0: { text: 'Pending', class: 'bg-yellow-100 text-yellow-700' },
      1: { text: 'Answered', class: 'bg-green-100 text-green-700' },
      2: { text: 'In Progress', class: 'bg-green-100 text-green-700' },
      3: { text: 'Closed', class: 'bg-red-100 text-red-700' },
    }
    return badges[status] || badges[0]
  }

  const getPriorityBadge = (priority) => {
    const badges = {
      1: { text: 'Low', class: 'bg-gray-100 text-gray-700' },
      2: { text: 'Medium', class: 'bg-orange-100 text-orange-700' },
      3: { text: 'High', class: 'bg-red-100 text-red-700' },
    }
    return badges[priority] || badges[1]
  }

  const filteredTickets = tickets.filter(ticket => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        ticket.id.toString().includes(search) ||
        ticket.subject?.toLowerCase().includes(search) ||
        ticket.user?.first_name?.toLowerCase().includes(search) ||
        ticket.user?.last_name?.toLowerCase().includes(search) ||
        ticket.user?.email?.toLowerCase().includes(search)
      )
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Support Tickets</h1>
            <p className="text-gray-600 mt-1">Manage and respond to customer support tickets</p>
          </div>
          <button
            onClick={loadTickets}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tickets..."
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
              <option value="all">All Status</option>
              <option value="0">Pending</option>
              <option value="1">Answered</option>
              <option value="2">In Progress</option>
              <option value="3">Closed</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="all">All Priorities</option>
              <option value="1">Low</option>
              <option value="2">Medium</option>
              <option value="3">High</option>
            </select>
          </div>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No tickets found</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mobile View */}
            <div className="lg:hidden space-y-4">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">#{ticket.id}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(ticket.status).class}`}>
                          {getStatusBadge(ticket.status).text}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(ticket.priority || 1).class}`}>
                          {getPriorityBadge(ticket.priority || 1).text}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{ticket.subject}</h3>
                      <p className="text-sm text-gray-600 mb-2">{ticket.user?.first_name} {ticket.user?.last_name} ({ticket.user?.email})</p>
                      <p className="text-xs text-gray-500">{new Date(ticket.created_at).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => handleViewTicket(ticket.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Eye className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  {ticket.replies && ticket.replies.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                      <MessageCircle className="w-4 h-4" />
                      <span>{ticket.replies.length} {ticket.replies.length === 1 ? 'reply' : 'replies'}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-green-600 to-green-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">#{ticket.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div>
                            <p className="font-medium text-gray-900">{ticket.user?.first_name} {ticket.user?.last_name}</p>
                            <p className="text-gray-500 text-xs">{ticket.user?.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <p className="font-medium text-gray-900">{ticket.subject}</p>
                          <p className="text-gray-500 text-xs mt-1">{ticket.category_id} - {ticket.request_type}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(ticket.status).class}`}>
                            {getStatusBadge(ticket.status).text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadge(ticket.priority || 1).class}`}>
                            {getPriorityBadge(ticket.priority || 1).text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewTicket(ticket.id)}
                              className="p-2 hover:bg-green-50 rounded-lg text-green-600"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <div className="relative">
                              <button
                                onClick={() => setActiveDropdown(activeDropdown === ticket.id ? null : ticket.id)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-600" />
                              </button>
                              {activeDropdown === ticket.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                  <div className="py-1">
                                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b">Status</div>
                                    <button onClick={() => handleStatusUpdate(ticket.id, 0)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">Pending</button>
                                    <button onClick={() => handleStatusUpdate(ticket.id, 1)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">Answered</button>
                                    <button onClick={() => handleStatusUpdate(ticket.id, 2)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">In Progress</button>
                                    <button onClick={() => handleStatusUpdate(ticket.id, 3)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">Closed</button>
                                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-t border-b mt-1">Priority</div>
                                    <button onClick={() => handlePriorityUpdate(ticket.id, 1)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">Low</button>
                                    <button onClick={() => handlePriorityUpdate(ticket.id, 2)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">Medium</button>
                                    <button onClick={() => handlePriorityUpdate(ticket.id, 3)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">High</button>
                                    <div className="border-t mt-1"></div>
                                    <button onClick={() => handleDelete(ticket.id)} className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2">
                                      <Trash2 className="w-4 h-4" />
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Ticket Details Modal */}
        {showTicketModal && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Ticket #{selectedTicket.id}</h2>
                  <p className="text-sm text-gray-500">{selectedTicket.subject}</p>
                </div>
                <button onClick={() => { setShowTicketModal(false); setSelectedTicket(null); setReplyMessage(""); setIsInternal(false) }} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Ticket Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Status</span>
                    <div className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedTicket.status).class}`}>
                        {getStatusBadge(selectedTicket.status).text}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Priority</span>
                    <div className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadge(selectedTicket.priority || 1).class}`}>
                        {getPriorityBadge(selectedTicket.priority || 1).text}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">User</span>
                    <p className="mt-1 font-medium text-sm">{selectedTicket.user?.first_name} {selectedTicket.user?.last_name}</p>
                    <p className="text-xs text-gray-500">{selectedTicket.user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Category</span>
                    <p className="mt-1 font-medium">{selectedTicket.category_id}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Request Type</span>
                    <p className="mt-1 font-medium">{selectedTicket.request_type}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Created</span>
                    <p className="mt-1 text-sm">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Last Updated</span>
                    <p className="mt-1 text-sm">{new Date(selectedTicket.updated_at).toLocaleString()}</p>
                  </div>
                </div>

                {selectedTicket.order_ids && (
                  <div>
                    <span className="text-xs text-gray-500">Order IDs</span>
                    <p className="mt-1 font-mono text-sm">{selectedTicket.order_ids}</p>
                  </div>
                )}

                {/* Original Message */}
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-400">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedTicket.user?.first_name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="font-medium">{selectedTicket.user?.first_name} {selectedTicket.user?.last_name}</p>
                      <p className="text-xs text-gray-500">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.message || 'No message provided'}</p>
                </div>

                {/* Replies */}
                {(selectedTicket.replies || []).length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Replies ({selectedTicket.replies.filter(r => !r.is_internal).length} public, {selectedTicket.replies.filter(r => r.is_internal).length} internal)</h3>
                    {selectedTicket.replies.map((reply) => (
                      <div key={reply.id} className={`rounded-lg p-4 border-l-4 ${reply.is_internal ? 'bg-yellow-50 border-yellow-400' : reply.admin_id ? 'bg-green-50 border-green-600' : 'bg-gray-50 border-gray-400'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${reply.admin_id ? 'bg-green-600' : 'bg-gray-600'}`}>
                            {reply.admin_id ? 'A' : selectedTicket.user?.first_name?.[0] || 'U'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{reply.admin_id ? (reply.admin?.name || 'Support Team') : `${selectedTicket.user?.first_name} ${selectedTicket.user?.last_name}`}</p>
                              {reply.is_internal && (
                                <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded text-xs font-medium">Internal</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{new Date(reply.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Add Reply</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="isInternal"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="isInternal" className="text-sm text-gray-700">Internal note (only visible to admins)</label>
                  </div>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                    placeholder={isInternal ? "Add an internal note..." : "Type your reply here..."}
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyMessage.trim() || isReplying}
                    className="mt-4 w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isReplying ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {isInternal ? 'Add Internal Note' : 'Send Reply'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminTickets
