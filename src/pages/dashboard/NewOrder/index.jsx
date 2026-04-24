"use client"
import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import {
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Video,
  Music,
  Twitch,
  Send,
  Linkedin,
  Headphones,
  Camera,
  MessageSquare,
  MessageCircle,
  Heart,
  Phone,
  Globe,
  ShoppingCart,
} from "lucide-react"
import { CSS_COLORS } from "../../../components/constant/colors"
import { fetchUserData } from "../../../services/userService"
import {
  fetchSmmCategories,
  fetchSmmServices,
  createOrder,
  searchServicesFast,
} from "../../../services/services"
import { useOutletContext, useNavigate } from "react-router-dom"

// Import components
import SearchBar from "./SearchBar"
import OrderForm from "./OrderForm"
import ServiceDetails from "./ServiceDetails"
import PlatformGrid from "./PlatformGrid"
import OrderStatusAlert from "./OrderStatusAlert"
import BalanceWarning from "./BalanceWarning"

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const NewOrder = () => {
  // Get currency context from DashboardLayout
  const context = useOutletContext();
  const {
    selectedCurrency,
    convertToSelectedCurrency,
    formatCurrency: contextFormatCurrency,
    user: contextUser
  } = context || {};

  // Fallback formatCurrency if not provided in context
  const formatCurrency = contextFormatCurrency || ((amount, currency) => {
    if (!currency || amount === null || amount === undefined) return '0.00';
    const formattedAmount = parseFloat(amount).toFixed(2);
    return `${currency?.symbol || '₦'} ${formattedAmount}`;
  });

  const [user, setUser] = useState(contextUser || null)
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [allServices, setAllServices] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [quantity, setQuantity] = useState("")
  const [link, setLink] = useState("")
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingServices, setLoadingServices] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderStatus, setOrderStatus] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isLoadingAllServices, setIsLoadingAllServices] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const navigate = useNavigate()

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const formatDisplayAmount = (amount) => {
    if (amount === null || amount === undefined || amount === "") {
      return formatCurrency(0, selectedCurrency)
    }

    const convertedAmount = convertToSelectedCurrency(Number(amount), "NGN")
    return formatCurrency(convertedAmount, selectedCurrency)
  }

  // Calculate converted amounts
  const convertedBalance = user?.balance ? convertToSelectedCurrency(user.balance, "NGN") : 0;
  const formattedBalance = formatCurrency(convertedBalance, selectedCurrency);

  // Fixed total cost calculation
  const totalCost = selectedService && quantity ?
    convertToSelectedCurrency((quantity * selectedService.price) / 1, "NGN") : 0;
  const formattedTotalCost = formatCurrency(totalCost, selectedCurrency);

  // Get platform icon with modern styling
  const getPlatformIcon = (categoryTitle, serviceTitle = null) => {
    // Check service title first if provided (more specific)
    const titleToCheck = serviceTitle || categoryTitle || ""
    if (!titleToCheck) return <Globe className="w-5 h-5 text-gray-500 flex-shrink-0" />

    const cleanedTitle = titleToCheck.replace(/^[^a-zA-Z0-9]+/, "").toLowerCase()

    // TikTok - modern video icon
    if (cleanedTitle.includes("tiktok")) return <Video className="w-5 h-5 text-black dark:text-white flex-shrink-0" />

    // Facebook - modern blue icon
    if (cleanedTitle.includes("facebook")) return <Facebook className="w-5 h-5 text-green-600 flex-shrink-0" />

    // Instagram - gradient pink/purple icon
    if (cleanedTitle.includes("instagram")) return <Instagram className="w-5 h-5 text-pink-500 flex-shrink-0" />

    // YouTube - red icon
    if (cleanedTitle.includes("youtube")) return <Youtube className="w-5 h-5 text-red-600 flex-shrink-0" />

    // Twitter/X - modern blue icon
    if (cleanedTitle.includes("twitter") || cleanedTitle.includes("x"))
      return <Twitter className="w-5 h-5 text-green-400 flex-shrink-0" />

    // SoundCloud - orange icon
    if (cleanedTitle.includes("soundcloud")) return <Music className="w-5 h-5 text-orange-500 flex-shrink-0" />

    // Twitch - purple icon
    if (cleanedTitle.includes("twitch")) return <Twitch className="w-5 h-5 text-green-500 flex-shrink-0" />

    // Telegram - blue icon
    if (cleanedTitle.includes("telegram")) return <Send className="w-5 h-5 text-green-500 flex-shrink-0" />

    // LinkedIn - professional blue icon
    if (cleanedTitle.includes("linkedin")) return <Linkedin className="w-5 h-5 text-green-700 flex-shrink-0" />

    // Spotify - green icon
    if (cleanedTitle.includes("spotify")) return <Headphones className="w-5 h-5 text-green-500 flex-shrink-0" />

    // Snapchat - yellow icon
    if (cleanedTitle.includes("snapchat")) return <Camera className="w-5 h-5 text-yellow-400 flex-shrink-0" />

    // Discord - indigo icon
    if (cleanedTitle.includes("discord")) return <MessageSquare className="w-5 h-5 text-green-500 flex-shrink-0" />

    // Reddit - orange icon
    if (cleanedTitle.includes("reddit")) return <MessageCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />

    // Pinterest - red icon
    if (cleanedTitle.includes("pinterest")) return <Heart className="w-5 h-5 text-red-600 flex-shrink-0" />

    // WhatsApp - green icon
    if (cleanedTitle.includes("whatsapp")) return <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />

    return <Globe className="w-5 h-5 text-gray-500 flex-shrink-0" />
  }

  const handleServiceSelect = async (service) => {

    // Clear search UI immediately for better UX
    setSearchQuery("")
    setShowSearchResults(false)

    // Find the category - try multiple methods
    let serviceCategory = categories.find(cat => cat.id === service.category_id)

    // If not found, try finding by category object
    if (!serviceCategory && service.category) {
      serviceCategory = categories.find(cat => cat.id === service.category.id)
    }

    if (serviceCategory) {
      // Set the selected category first
      setSelectedCategory(serviceCategory)

      try {
        setLoadingServices(true)
        const response = await fetchSmmServices(serviceCategory.id.toString())
        const categoryServices = response.data.data
        setServices(categoryServices)

        // Find the exact service from the category services
        const exactService = categoryServices.find(s => s.id === service.id)

        if (exactService) {
          // Successfully found exact match
          setSelectedService(exactService)
          setQuantity(exactService.min_amount.toString())

          toast.success(`Selected: ${exactService.service_title}`)
        } else {
          // Fallback: try to find by title match
          const similarService = categoryServices.find(s =>
            s.service_title.toLowerCase() === service.service_title.toLowerCase()
          )

          if (similarService) {
            setSelectedService(similarService)
            setQuantity(similarService.min_amount.toString())
            toast.success(`Selected: ${similarService.service_title}`)
          } else {
            // Last fallback: use first service
            const firstService = categoryServices[0]
            if (firstService) {
              setSelectedService(firstService)
              setQuantity(firstService.min_amount.toString())
              toast.info(`Category selected. Please choose your specific service.`)
            }
          }
        }
      } catch (err) {
        console.error("Error fetching services for selected category:", err)
        toast.error("Failed to load services for selected category")
      } finally {
        setLoadingServices(false)
      }
    } else {
      console.warn("No category found for service:", service)
      toast.error("Could not find category for selected service. Please try again.")
    }

    // Clear search results
    setSearchResults([])
  }

  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.length > 0) {
      setShowSearchResults(true)
    } else {
      setShowSearchResults(false)
      setSearchResults([])
    }
  }

  const handleSearchFocus = () => {
    if (searchQuery.length > 0 && searchResults.length > 0) {
      setShowSearchResults(true)
    }
  }

  const handleSearchBlur = () => {
    // Delay hiding to allow for item selection
    setTimeout(() => {
      setShowSearchResults(false)
    }, 300)
  }

  // Enhanced search effect - more sensitive and comprehensive
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery && debouncedSearchQuery.length >= 2) {
        setIsSearching(true)
        try {
          const response = await searchServicesFast(debouncedSearchQuery, 50)

          // Ensure we have the proper service data structure
          const allResults = response.data.data || []

          // More sensitive search with better matching
          const sensitiveResults = allResults.filter(service => {
            const searchTerm = debouncedSearchQuery.toLowerCase()
            const serviceTitle = service.service_title?.toLowerCase() || ''
            const serviceDesc = service.description?.toLowerCase() || ''
            const categoryName = service.category?.category_title?.toLowerCase() || ''

            return (
              serviceTitle.includes(searchTerm) ||
              serviceDesc.includes(searchTerm) ||
              categoryName.includes(searchTerm) ||
              searchTerm.split(' ').some(word =>
                serviceTitle.includes(word) ||
                serviceDesc.includes(word) ||
                categoryName.includes(word)
              )
            )
          })

          // Ensure each service has the category_id properly set
          const resultsWithCategoryId = sensitiveResults.map(service => ({
            ...service,
            category_id: service.category_id || service.category?.id,
            // Ensure we have category info for later use
            category: service.category || { id: service.category_id }
          }))

          setSearchResults(resultsWithCategoryId)
        } catch (error) {
          console.error('Search API error:', error)
          // Fallback to client-side search if API fails
          performClientSideSearch()
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
        setIsSearching(false)
      }
    }

    const performClientSideSearch = () => {
      if (allServices.length > 0 && debouncedSearchQuery.length >= 2) {
        const searchTerm = debouncedSearchQuery.toLowerCase()
        const results = allServices.filter(service => {
          const serviceTitle = service.service_title?.toLowerCase() || ''
          const serviceDesc = service.description?.toLowerCase() || ''
          const categoryName = service.categoryName?.toLowerCase() || ''

          return (
            serviceTitle.includes(searchTerm) ||
            serviceDesc.includes(searchTerm) ||
            categoryName.includes(searchTerm) ||
            searchTerm.split(' ').some(word =>
              serviceTitle.includes(word) ||
              serviceDesc.includes(word) ||
              categoryName.includes(word)
            )
          )
        })
        setSearchResults(results.slice(0, 30))
      }
    }

    performSearch()
  }, [debouncedSearchQuery, allServices])

  const handleSubmitOrder = async () => {
    if (!selectedCategory || !selectedService || !quantity || !link) {
      toast.error("Please fill all required fields")
      return
    }

    if (quantity < selectedService.min_amount || quantity > selectedService.max_amount) {
      toast.error(`Quantity must be between ${selectedService.min_amount} and ${selectedService.max_amount}`)
      return
    }

    setIsSubmitting(true)
    setOrderStatus(null)

    try {
      const orderData = {
        category: selectedCategory.id,
        service: selectedService.id,
        link,
        quantity: Number.parseInt(quantity),
        check: true,
      }

      const response = await createOrder(orderData)

      const orderId = response.order_id || response.data?.order_id
      const newBalance = response.balance

      if (!orderId) {
        throw new Error("Order ID not received in response")
      }

      setOrderStatus({
        success: true,
        message: "Order submitted successfully!",
        orderId: orderId,
      })

      // Update user balance and order count in frontend state
      setUser(prevUser => ({
        ...prevUser,
        ...(newBalance !== undefined ? { balance: newBalance } : {}),
        total_orders: (prevUser?.total_orders || 0) + 1,
      }))

      toast.success("Order submitted successfully!")

      // Reset form
      setQuantity("")
      setLink("")
      setSelectedService(null)
    } catch (error) {
      console.error("Order submission error:", error)

      let errorMessage = "Failed to submit order"
      let showDetailedError = false
      let isInsufficientBalanceError = false

      // Enhanced error handling for different error types
      if (error.response?.data) {
        const serverError = error.response.data

        // Handle specific error messages from backend
        if (serverError.message) {
          errorMessage = serverError.message
          isInsufficientBalanceError = serverError.message.includes('Insufficient balance')

          if (isInsufficientBalanceError && serverError.shortfall) {
            showDetailedError = true
          }

          // Handle duplicate order error
          if (serverError.message.includes('active order with this link')) {
            errorMessage = "❌ " + serverError.message
          }

          // Handle service unavailable errors
          if (serverError.message.includes('Service not found') ||
            serverError.message.includes('currently unavailable')) {
            errorMessage = "⚠️ " + serverError.message
          }

          // Handle API provider errors
          if (serverError.message.includes('Service provider') ||
            serverError.message.includes('API connection')) {
            errorMessage = "🔧 " + serverError.message
          }
        }
      } else if (error.message) {
        // Handle frontend/network errors
        if (error.message.includes('Network Error') || error.isNetworkError) {
          errorMessage = "🌐 Network error. Please check your internet connection and try again."
        } else if (error.isTimeout) {
          errorMessage = "⏰ Request timeout. Please try again."
        } else {
          errorMessage = error.message
        }
      }

      if (!isInsufficientBalanceError) {
        setOrderStatus({
          success: false,
          message: errorMessage,
          details: showDetailedError ? {
            requiredAmount: error.response?.data?.required_amount,
            currentBalance: error.response?.data?.current_balance,
            shortfall: error.response?.data?.shortfall,
            requiredAmountText: formatDisplayAmount(error.response?.data?.required_amount),
            currentBalanceText: formatDisplayAmount(error.response?.data?.current_balance),
            shortfallText: formatDisplayAmount(error.response?.data?.shortfall)
          } : null
        })
      }

      // Show appropriate toast based on error type
      if (isInsufficientBalanceError) {
        return
      }

      if (errorMessage.includes('❌')) {
        toast.error(errorMessage.replace('❌ ', ''), {
          duration: 6000,
          icon: '⚠️'
        })
      } else if (errorMessage.includes('⚠️')) {
        toast.error(errorMessage.replace('⚠️ ', ''), {
          duration: 5000
        })
      } else if (errorMessage.includes('🔧')) {
        toast.error(errorMessage.replace('🔧 ', ''), {
          duration: 5000,
          icon: '🔧'
        })
      } else if (errorMessage.includes('🌐')) {
        toast.error(errorMessage, {
          duration: 4000,
          icon: '🌐'
        })
      } else if (errorMessage.includes('⏰')) {
        toast.error(errorMessage, {
          duration: 4000,
          icon: '⏰'
        })
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Keep local user in sync with the layout's context (which is refreshed from API on mount)
  useEffect(() => {
    if (contextUser) {
      setUser(contextUser);
    } else {
      const fetchUser = async () => {
        try {
          const response = await fetchUserData()
          setUser(response.data)
        } catch (err) {
          toast.error("Failed to fetch user info")
        }
      }
      fetchUser()
    }
  }, [contextUser])

  // Sort categories function - TikTok, Facebook, Instagram first
  const sortCategories = (categories) => {
    const priorityOrder = ['tiktok', 'facebook', 'instagram']
    const sorted = [...categories].sort((a, b) => {
      const titleA = a.category_title?.toLowerCase().replace(/^[^a-zA-Z0-9]+/, '') || ''
      const titleB = b.category_title?.toLowerCase().replace(/^[^a-zA-Z0-9]+/, '') || ''

      const indexA = priorityOrder.findIndex(p => titleA.includes(p))
      const indexB = priorityOrder.findIndex(p => titleB.includes(p))

      // If both are in priority list, sort by priority order
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB
      }
      // Priority items come first
      if (indexA !== -1) return -1
      if (indexB !== -1) return 1
      // Others sorted alphabetically
      return titleA.localeCompare(titleB)
    })
    return sorted
  }

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const response = await fetchSmmCategories()
        const catData = response.data.data
        const sortedCategories = sortCategories(catData)
        setCategories(sortedCategories)
        if (sortedCategories.length > 0) setSelectedCategory(sortedCategories[0])
      } catch (err) {
        toast.error("Failed to fetch categories")
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  // Fetch services for selected category
  useEffect(() => {
    const fetchServices = async () => {
      if (!selectedCategory) return

      try {
        setLoadingServices(true)
        const response = await fetchSmmServices(selectedCategory.id.toString())
        const srv = response.data.data
        setServices(srv)
        // Only set selected service if it's not already set or if it doesn't belong to current category
        if (!selectedService || selectedService.category !== selectedCategory.id) {
          setSelectedService(srv.length > 0 ? srv[0] : null)
        }
      } catch (err) {
        console.error("Error fetching services:", err)
        toast.error("Failed to fetch services")
        setServices([])
        setSelectedService(null)
      } finally {
        setLoadingServices(false)
      }
    }
    fetchServices()
  }, [selectedCategory])

  // Load essential services when categories are loaded
  useEffect(() => {
    const loadAllServices = async () => {
      if (categories.length > 0 && allServices.length === 0 && !isLoadingAllServices) {
        setIsLoadingAllServices(true)
        try {
          const essentialServices = []

          // Load services for first 5 categories for better search coverage
          const categoriesToLoad = categories.slice(0, 5)

          for (const category of categoriesToLoad) {
            try {
              const response = await fetchSmmServices(category.id.toString())
              const servicesData = response.data.data

              // Add category information to each service
              const servicesWithCategory = servicesData.map(service => ({
                ...service,
                categoryName: category.category_title,
                categoryId: category.id,
              }))

              essentialServices.push(...servicesWithCategory)
            } catch (err) {
              console.error(`Error fetching services for category ${category.id}:`, err)
            }
          }

          setAllServices(essentialServices)
        } catch (err) {
          console.error("Error loading essential services:", err)
        } finally {
          setIsLoadingAllServices(false)
        }
      }
    }

    loadAllServices()
  }, [categories])

  const getServiceMetrics = () => {
    if (!selectedService) return null

    const startTime = selectedService.start_time || "5-30 minutes"
    const speed = selectedService.speed || "100-1000/hour"
    const avgTime = selectedService.avg_time || selectedService.average_time || "7 hours 43 minutes"
    const guarantee = selectedService.guarantee || "30 days"

    return { startTime, speed, avgTime, guarantee }
  }

  const metrics = getServiceMetrics()

  return (
    <div className="w-full overflow-x-hidden">
      {/* Order Status Alert */}
      <OrderStatusAlert orderStatus={orderStatus} setOrderStatus={setOrderStatus} />

      {/* Balance Warning */}
      <BalanceWarning
        selectedService={selectedService}
        quantity={quantity}
        totalCost={totalCost}
        convertedBalance={convertedBalance}
        formattedTotalCost={formattedTotalCost}
        formattedBalance={formattedBalance}
        formatCurrency={formatCurrency}
        selectedCurrency={selectedCurrency}
      />

      {/* ═══════════════════════════════ MOBILE ═══════════════════════════════ */}
      <div className="lg:hidden space-y-3 p-3">

        {/* Mobile Hero */}
        <div className="relative rounded-2xl overflow-hidden p-5"
          style={{ background: 'linear-gradient(135deg, #14532d 0%, #16a34a 100%)' }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(ellipse at 90% -10%, rgba(134,239,172,0.25) 0%, transparent 55%)' }} />
          <div className="relative z-10">
            <p className="text-green-200/80 text-xs font-medium">Welcome back 👋</p>
            <h2 className="text-xl font-bold text-white mt-0.5">{user?.username || "..."}</h2>
            <div className="flex items-end justify-between mt-4 pt-4 border-t border-white/15">
              <div>
                <p className="text-green-300/70 text-[10px] uppercase tracking-widest font-semibold">Balance</p>
                <p className="text-2xl font-bold text-white mt-0.5">{formattedBalance}</p>
              </div>
              <div className="flex items-end gap-3">
                <div className="text-center">
                  <p className="text-xl font-bold text-white">{user?.total_orders || 0}</p>
                  <p className="text-green-200/70 text-[10px] uppercase tracking-wide">Orders</p>
                </div>
                <button
                  onClick={() => navigate('/dashboard/add-funds')}
                  className="bg-white text-green-800 text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm hover:bg-green-50 transition-colors"
                >
                  + Add Funds
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* VN Banner */}
        <div
          className="relative rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
          onClick={() => navigate('/dashboard/virtual-numbers')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-brand-500/20 blur-xl -translate-y-8 translate-x-8" />
          <div className="relative z-10 flex items-center justify-between p-4">
            <div className="flex-1 min-w-0">
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-brand-400 bg-brand-500/20 px-2 py-0.5 rounded-full mb-1.5">✦ New</span>
              <h3 className="text-white font-bold text-base">Virtual SMS Numbers</h3>
              <p className="text-gray-400 text-xs mt-0.5">150+ countries � Instant OTPs</p>
            </div>
            <div className="flex flex-col items-center gap-2 ml-4 flex-shrink-0">
              <span className="text-3xl">📱</span>
              <span className="bg-brand-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap">Get Numbers →</span>
            </div>
          </div>
        </div>

        {/* Platform Pills */}
        <div className="bg-white dark:bg-[#0f0f1a] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Platforms</p>
          <PlatformGrid isMobile={true} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:opacity-80"
            style={{ backgroundColor: CSS_COLORS.primary }}
          >
            <ShoppingCart className="w-4 h-4" /> New Order
          </button>
          <button
            onClick={() => navigate('/dashboard/mass-order')}
            className="py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f0f1a] text-gray-700 dark:text-gray-300 transition-all"
          >
            <ShoppingCart className="w-4 h-4" /> Mass Order
          </button>
        </div>

        {/* Order Form */}
        <OrderForm
          searchQuery={searchQuery}
          handleSearchChange={handleSearchChange}
          handleSearchFocus={handleSearchFocus}
          handleSearchBlur={handleSearchBlur}
          showSearchResults={showSearchResults}
          isSearching={isSearching}
          searchResults={searchResults}
          handleServiceSelect={handleServiceSelect}
          getPlatformIcon={getPlatformIcon}
          convertToSelectedCurrency={convertToSelectedCurrency}
          formatCurrency={formatCurrency}
          selectedCurrency={selectedCurrency}
          categories={categories}
          loadingCategories={loadingCategories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          services={services}
          loadingServices={loadingServices}
          selectedService={selectedService}
          setSelectedService={setSelectedService}
          setQuantity={setQuantity}
          quantity={quantity}
          setQuantityValue={setQuantity}
          link={link}
          setLink={setLink}
          isSubmitting={isSubmitting}
          handleSubmitOrder={handleSubmitOrder}
          formattedTotalCost={formattedTotalCost}
          isMobile={true}
        />

        {/* Service Details */}
        <ServiceDetails
          selectedService={selectedService}
          selectedCategory={selectedCategory}
          getPlatformIcon={getPlatformIcon}
          metrics={metrics}
          isMobile={true}
        />
      </div>

      {/* ═══════════════════════════════ DESKTOP ══════════════════════════════ */}
      <div className="hidden lg:block w-full">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-5 space-y-5">

          {/* ── Hero Banner ──────────────────────────────────────────────────── */}
          <div className="relative rounded-3xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 45%, #15803d 100%)' }}>
            {/* Background glows */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(ellipse at 80% -15%, rgba(134,239,172,0.18) 0%, transparent 55%), radial-gradient(ellipse at 5% 110%, rgba(20,83,45,0.6) 0%, transparent 50%)' }} />
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/[0.04] -translate-y-36 translate-x-36 pointer-events-none" />

            <div className="relative z-10 px-8 py-7">
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-green-300/75 text-sm font-medium">Good to see you again 👋</p>
                  <h1 className="text-3xl font-bold text-white mt-1 tracking-tight">{user?.username || "..."}</h1>
                  <p className="text-green-200/50 text-sm mt-1.5">Here's what's happening with your account today</p>
                </div>
                <div className="text-right">
                  <p className="text-green-300/70 text-[11px] uppercase tracking-widest font-semibold">Available Balance</p>
                  <p className="text-4xl font-bold text-white mt-1.5 tracking-tight">{formattedBalance}</p>
                  <button
                    onClick={() => navigate('/dashboard/add-funds')}
                    className="mt-3 bg-white hover:bg-green-50 text-green-900 text-sm font-bold px-5 py-2 rounded-xl transition-colors shadow-lg inline-block"
                  >
                    + Add Funds
                  </button>
                </div>
              </div>

              {/* Stats + Actions row */}
              <div className="grid grid-cols-4 gap-5 mt-6 pt-6 border-t border-white/15">
                <div>
                  <p className="text-green-300/65 text-[10px] uppercase tracking-widest font-semibold">Total Orders</p>
                  <p className="text-2xl font-bold text-white mt-1">{user?.total_orders || 0}</p>
                </div>
                <div>
                  <p className="text-green-300/65 text-[10px] uppercase tracking-widest font-semibold">Account Status</p>
                  <p className="text-2xl font-bold text-white mt-1 capitalize">{user?.status || "Active"}</p>
                </div>
                <div>
                  <p className="text-green-300/65 text-[10px] uppercase tracking-widest font-semibold">Member Since</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {user?.created_at ? new Date(user.created_at).getFullYear() : "—"}
                  </p>
                </div>
                <div className="flex items-end justify-end gap-2">
                  <button
                    onClick={() => navigate('/dashboard/orders')}
                    className="bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                  >
                    Order History
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/mass-order')}
                    className="bg-white/90 hover:bg-white text-green-900 text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
                  >
                    Mass Order
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Platform Pills ───────────────────────────────────────────────── */}
          <div className="bg-white dark:bg-[#0f0f1a] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm px-5 py-4">
            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">All Platforms</p>
            <PlatformGrid isMobile={false} />
          </div>

          {/* ── Main Content ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-5">

            {/* Order Form */}
            <div className="col-span-2">
              <OrderForm
                searchQuery={searchQuery}
                handleSearchChange={handleSearchChange}
                handleSearchFocus={handleSearchFocus}
                handleSearchBlur={handleSearchBlur}
                showSearchResults={showSearchResults}
                isSearching={isSearching}
                searchResults={searchResults}
                handleServiceSelect={handleServiceSelect}
                getPlatformIcon={getPlatformIcon}
                convertToSelectedCurrency={convertToSelectedCurrency}
                formatCurrency={formatCurrency}
                selectedCurrency={selectedCurrency}
                categories={categories}
                loadingCategories={loadingCategories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                services={services}
                loadingServices={loadingServices}
                selectedService={selectedService}
                setSelectedService={setSelectedService}
                setQuantity={setQuantity}
                quantity={quantity}
                setQuantityValue={setQuantity}
                link={link}
                setLink={setLink}
                isSubmitting={isSubmitting}
                handleSubmitOrder={handleSubmitOrder}
                formattedTotalCost={formattedTotalCost}
                isMobile={false}
              />
            </div>

            {/* Right Sidebar */}
            <div className="col-span-1 space-y-4">

              {/* VN Promo Card */}
              <div
                className="relative rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.015] transition-all duration-200 group"
                onClick={() => navigate('/dashboard/virtual-numbers')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-brand-500/20 blur-2xl" />
                <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-brand-700/20 blur-xl" />
                <div className="relative z-10 p-5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-brand-400 bg-brand-500/20 px-2.5 py-1 rounded-full">
                    ✦ New Service
                  </span>
                  <h3 className="text-white font-bold text-xl mt-3 leading-snug">Virtual SMS Numbers</h3>
                  <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                    Rent real phone numbers and receive SMS verification codes for any platform instantly.
                  </p>
                  <div className="mt-4 flex items-end justify-between">
                    <div className="space-y-1.5">
                      <p className="text-xs text-gray-400 flex items-center gap-1.5"><span>🌍</span> 150+ countries</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5"><span>⚡</span> Instant delivery</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5"><span>🔒</span> Private & secure</p>
                    </div>
                    <span className="text-5xl">📱</span>
                  </div>
                  <div className="mt-4 py-2.5 rounded-xl bg-brand-500 group-hover:bg-brand-600 transition-colors text-white text-sm font-bold text-center shadow-md">
                    Get Numbers →
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <ServiceDetails
                selectedService={selectedService}
                selectedCategory={selectedCategory}
                getPlatformIcon={getPlatformIcon}
                metrics={metrics}
                isMobile={false}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default NewOrder
