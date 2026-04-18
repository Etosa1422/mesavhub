"use client"

import { useState, useEffect } from "react"
import { 
  Search, 
  Star, 
  Clock, 
  Users, 
  MessageCircle, 
  Share2, 
  Play, 
  Zap, 
  TrendingUp 
} from "lucide-react"
import { 
  fetchSmmCategories, 
  fetchNewServices, 
  fetchRecommendedServices 
} from "../../services/userService"

const Services = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [categories, setCategories] = useState([])
  const [newServices, setNewServices] = useState([])
  const [recommendedServices, setRecommendedServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch all data in parallel
        const [categoriesRes, newServicesRes, recommendedRes] = await Promise.all([
          fetchSmmCategories(),
          fetchNewServices(),
          fetchRecommendedServices()
        ])
        
        // Handle categories response - can be array or object with data
        const categoriesData = Array.isArray(categoriesRes?.data) 
          ? categoriesRes.data 
          : (Array.isArray(categoriesRes) ? categoriesRes : [])
        setCategories(categoriesData || [])
        
        // Handle services responses - extract data from response
        const newServicesData = Array.isArray(newServicesRes?.data) 
          ? newServicesRes.data 
          : (Array.isArray(newServicesRes) ? newServicesRes : [])
        setNewServices(newServicesData || [])
        
        const recommendedData = Array.isArray(recommendedRes?.data) 
          ? recommendedRes.data 
          : (Array.isArray(recommendedRes) ? recommendedRes : [])
        setRecommendedServices(recommendedData || [])
        
      } catch (error) {
        console.error("Error fetching data:", error)
        setError(error.response?.data?.message || error.message || 'Failed to fetch data')
        // Set empty arrays on error to prevent crashes
        setCategories([])
        setNewServices([])
        setRecommendedServices([])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const getPlatformIcon = (platform) => {
    if (!platform) return <Star className="w-4 h-4 text-gray-500" />
    
    const platformLower = platform.toLowerCase()
    const icons = {
      instagram: <MessageCircle className="w-4 h-4 text-pink-500" />,
      tiktok: <Play className="w-4 h-4 text-black" />,
      facebook: <Users className="w-4 h-4 text-green-600" />,
      twitter: <Share2 className="w-4 h-4 text-sky-500" />,
      youtube: <Play className="w-4 h-4 text-red-500" />,
      telegram: <MessageCircle className="w-4 h-4 text-green-500" />,
    }
    
    // Try to match by slug or category title
    for (const [key, icon] of Object.entries(icons)) {
      if (platformLower.includes(key)) {
        return icon
      }
    }
    
    return <Star className="w-4 h-4 text-gray-500" />
  }

  const filteredServices = [...newServices, ...recommendedServices].filter((service) => {
    const matchesSearch = service.service_title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false
    let matchesCategory = true
    
    if (selectedCategory !== "all") {
      const serviceCategorySlug = service.category?.slug || 
                                   service.category?.category_title?.toLowerCase().replace(/\s+/g, '-') ||
                                   ''
      matchesCategory = serviceCategorySlug === selectedCategory || 
                       service.category?.category_title?.toLowerCase().includes(selectedCategory.replace(/-/g, ' '))
    }
    
    return matchesSearch && matchesCategory
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Error Loading Data</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Social Media Services</h1>
          <p className="text-gray-600">Boost your social media presence with our premium services</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 h-11 px-4 py-2 border-2 border-gray-200 focus:border-green-500 rounded-md"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-48 h-11 px-4 py-2 border-2 border-gray-200 focus:border-green-500 rounded-md"
              >
                <option value="all">🌟 All Services</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug || category.category_title?.toLowerCase().replace(/\s+/g, '-')}>
                    {category.icon || '📱'} {category.name || category.category_title}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-40 h-11 px-4 py-2 border-2 border-gray-200 focus:border-green-500 rounded-md"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                selectedCategory === "all"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-transparent border border-gray-300 text-gray-700 hover:bg-green-50"
              }`}
            >
              <span className="mr-1">🌟</span>
              All Services
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.slug)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  selectedCategory === category.slug
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-transparent border border-gray-300 text-gray-700 hover:bg-green-50"
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* New Services Section */}
        {newServices.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">🚀 NEW SERVICES</h2>
              <p className="text-green-100">Latest additions to our service catalog</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-green-50">
                    <th className="py-3 px-4 font-semibold text-gray-700 w-16">ID</th>
                    <th className="py-3 px-4 font-semibold text-gray-700 min-w-96">Service</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Price</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Min</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Max</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Delivery</th>
                    <th className="py-3 px-4 font-semibold text-gray-700 w-24">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {newServices.map((service) => (
                    <tr key={service.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium text-green-600">{service.id}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(service.category?.slug || service.category?.category_title || service.category?.name)}
                            <span className="font-medium text-gray-900 line-clamp-2">
                              {service.service_title}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {service.description && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs line-clamp-1">
                                {service.description.length > 50 ? `${service.description.substring(0, 50)}...` : service.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-green-600">₦{service.price?.toFixed(2)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600">{service.min_amount?.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600">{service.max_amount?.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          {service.average_time || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button className="w-full px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recommended Services Section */}
        {recommendedServices.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                ⚡ Recommended Instant Services of the Day
              </h2>
              <p className="text-amber-100">Hand-picked services with the best performance and value</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-amber-50">
                    <th className="py-3 px-4 font-semibold text-gray-700 w-16">ID</th>
                    <th className="py-3 px-4 font-semibold text-gray-700 min-w-96">Service</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Price</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Min</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Max</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Delivery</th>
                    <th className="py-3 px-4 font-semibold text-gray-700 w-24">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendedServices.map((service) => (
                    <tr key={service.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium text-green-600">{service.id}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(service.category?.slug || service.category?.category_title || service.category?.name)}
                            <span className="font-medium text-gray-900 line-clamp-2">
                              {service.service_title}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {service.description && (
                              <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs line-clamp-1">
                                {service.description.length > 50 ? `${service.description.substring(0, 50)}...` : service.description}
                              </span>
                            )}
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              RECOMMENDED
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-green-600">₦{service.price?.toFixed(2)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600">{service.min_amount?.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600">{service.max_amount?.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          {service.average_time || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button className="w-full px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {newServices.length + recommendedServices.length}
              </div>
              <div className="text-sm text-gray-600">Total Services</div>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{newServices.length}</div>
              <div className="text-sm text-gray-600">New Services</div>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{recommendedServices.length}</div>
              <div className="text-sm text-gray-600">Recommended</div>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
              <div className="text-sm text-gray-600">Platforms</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Services