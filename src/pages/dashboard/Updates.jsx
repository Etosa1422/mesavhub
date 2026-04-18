"use client"

import React, { useState, useEffect } from "react"
import { Search, Info, ChevronLeft, ChevronRight } from "lucide-react"
import { fetchAllUpdates } from "../../services/userService"

// UI Components
const Card = ({ className = "", children }) => (
  <div className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}>
    {children}
  </div>
)

const Input = ({ type = "text", placeholder = "", value = "", onChange, className = "" }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base ${className}`}
  />
)

const Button = ({ onClick, className = "", children, disabled = false, variant = "default" }) => {
  const baseClasses = "font-medium rounded-xl transition-all text-sm md:text-base"
  const variantClasses =
    variant === "outline"
      ? "bg-transparent border border-green-500 text-green-500 hover:bg-green-50"
      : "text-white bg-green-500 hover:bg-green-600"

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

// New normal select dropdown
const SelectInput = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full md:w-48 border border-gray-200 rounded-xl px-4 py-3 text-sm md:text-base bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
)

// Helper: map category to color
const categoryColors = {
  TikTok: "bg-pink-100 text-pink-600",
  Twitter: "bg-green-100 text-green-600",
  YouTube: "bg-red-100 text-red-600",
  Instagram: "bg-green-100 text-green-600",
  Facebook: "bg-green-50 text-green-700",
  Spotify: "bg-green-100 text-green-700",
  all: "bg-gray-100 text-gray-700",
}

// Main Updates Component
function Updates() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const itemsPerPage = 5

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetchAllUpdates()
        
        // Handle different response formats
        const updatesData = Array.isArray(response?.data) 
          ? response.data 
          : (response?.data?.data || [])
        
        setUpdates(updatesData || [])
      } catch (err) {
        console.error('Error fetching updates:', err)
        setError(err?.response?.data?.message || err.message || "Failed to load updates")
        setUpdates([])
      } finally {
        setLoading(false)
      }
    }

    fetchUpdates()
  }, [])

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "TikTok", label: "TikTok" },
    { value: "Twitter", label: "Twitter" },
    { value: "YouTube", label: "YouTube" },
    { value: "Instagram", label: "Instagram" },
    { value: "Facebook", label: "Facebook" },
    { value: "Spotify", label: "Spotify" },
  ]

  const filteredUpdates = updates.filter((update) => {
    if (!update) return false
    
    const service = (update.service || '').toLowerCase()
    const details = (update.details || '').toLowerCase()
    const updateText = (update.update || '').toLowerCase()
    const category = (update.category || '').toLowerCase()
    
    const matchesSearch = searchTerm === '' || 
      service.includes(searchTerm.toLowerCase()) ||
      details.includes(searchTerm.toLowerCase()) ||
      updateText.includes(searchTerm.toLowerCase())
    
    const matchesFilter = selectedFilter === "all" || category === selectedFilter.toLowerCase()
    
    return matchesSearch && matchesFilter
  })

  const totalPages = Math.ceil(filteredUpdates.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentUpdates = filteredUpdates.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center p-4 bg-red-50 rounded-xl">
          <p>Error loading updates: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen p-4 lg:p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search and Filter Section */}
        <Card>
          <div className="p-4 lg:p-6">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Filter Dropdown */}
              <div className="w-full md:w-48">
                <SelectInput
                  value={selectedFilter}
                  onChange={(val) => {
                    setSelectedFilter(val)
                    setCurrentPage(1)
                  }}
                  options={filterOptions}
                />
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search updates..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-9 pr-4 py-2 md:py-3"
                />
              </div>

              {/* Search Button */}
              <Button
                onClick={() => setCurrentPage(1)}
                className="w-full md:w-auto py-2 md:py-3 px-6"
              >
                Search
              </Button>
            </div>
          </div>
        </Card>

        {/* Updates List */}
        <Card>
          <div className="p-4 lg:p-6">
            <div className="hidden md:grid grid-cols-3 gap-4 text-gray-600 font-semibold border-b border-gray-200 pb-3 mb-4">
              <div className="px-4">Service</div>
              <div className="px-4">Date</div>
              <div className="px-4">Update</div>
            </div>

            <div className="space-y-3">
              {currentUpdates.length > 0 ? (
                currentUpdates.map((update) => (
                  <div
                    key={update.id}
                    className="flex flex-col md:grid md:grid-cols-3 gap-3 p-4 rounded-xl bg-white hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base">{update.service || 'N/A'}</h3>
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                          categoryColors[update.category] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {update.category || 'Uncategorized'}
                      </span>
                      {update.details && (
                        <p className="text-xs md:text-sm text-gray-600 line-clamp-2">{update.details}</p>
                      )}
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 md:self-center">
                      {update.date ? new Date(update.date).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="text-sm md:text-base text-gray-900 font-medium md:self-center">
                      {update.update || 'N/A'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Info className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p>No updates found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              className="px-3 py-1 md:px-4 md:py-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="sr-only md:not-sr-only ml-1">Previous</span>
            </Button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page = i + 1
              if (totalPages > 5) {
                if (currentPage > 3 && currentPage < totalPages - 2) {
                  page = currentPage - 2 + i
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i
                }
              }

              return (
                <Button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 md:px-4 md:py-2 ${
                    currentPage === page ? "bg-green-600 text-white" : "bg-white text-gray-700"
                  }`}
                >
                  {page}
                </Button>
              )
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="px-1 text-gray-500">...</span>
                <Button
                  onClick={() => handlePageChange(totalPages)}
                  className="px-3 py-1 md:px-4 md:py-2 bg-white text-gray-700"
                >
                  {totalPages}
                </Button>
              </>
            )}

            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
              className="px-3 py-1 md:px-4 md:py-2"
            >
              <span className="sr-only md:not-sr-only mr-1">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Updates
