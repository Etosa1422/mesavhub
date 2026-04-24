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
} from "lucide-react"
import { CSS_COLORS } from "../../components/constant/colors"
import { fetchUserData } from "../../services/userService"
import {
  fetchSmmCategories,
  fetchSmmServices,
  createOrder,
  searchServicesFast,
} from "../../services/services"
import { useOutletContext, useNavigate } from "react-router-dom"

import SearchBar from "./NewOrder/SearchBar"
import OrderForm from "./NewOrder/OrderForm"
import ServiceDetails from "./NewOrder/ServiceDetails"
import PlatformGrid from "./NewOrder/PlatformGrid"
import OrderStatusAlert from "./NewOrder/OrderStatusAlert"
import BalanceWarning from "./NewOrder/BalanceWarning"

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

const BoostFollowers = () => {
  const context = useOutletContext()
  const {
    selectedCurrency,
    convertToSelectedCurrency,
    formatCurrency: contextFormatCurrency,
    user: contextUser,
  } = context || {}

  const formatCurrency = contextFormatCurrency || ((amount, currency) => {
    if (!currency || amount === null || amount === undefined) return "0.00"
    const formattedAmount = parseFloat(amount).toFixed(2)
    return `${currency?.symbol || "₦"} ${formattedAmount}`
  })

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
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const convertedBalance = user?.balance ? convertToSelectedCurrency(user.balance, "NGN") : 0
  const formattedBalance = formatCurrency(convertedBalance, selectedCurrency)

  const totalCost = selectedService && quantity
    ? convertToSelectedCurrency((quantity * selectedService.price) / 1, "NGN")
    : 0
  const formattedTotalCost = formatCurrency(totalCost, selectedCurrency)

  const formatDisplayAmount = (amount) => {
    if (amount === null || amount === undefined || amount === "") {
      return formatCurrency(0, selectedCurrency)
    }

    const convertedAmount = convertToSelectedCurrency(Number(amount), "NGN")
    return formatCurrency(convertedAmount, selectedCurrency)
  }

  const getPlatformIcon = (categoryTitle, serviceTitle = null) => {
    const titleToCheck = serviceTitle || categoryTitle || ""
    if (!titleToCheck) return <Globe className="w-5 h-5 text-gray-500 flex-shrink-0" />
    const cleanedTitle = titleToCheck.replace(/^[^a-zA-Z0-9]+/, "").toLowerCase()
    if (cleanedTitle.includes("tiktok")) return <Video className="w-5 h-5 text-black dark:text-white flex-shrink-0" />
    if (cleanedTitle.includes("facebook")) return <Facebook className="w-5 h-5 text-green-600 flex-shrink-0" />
    if (cleanedTitle.includes("instagram")) return <Instagram className="w-5 h-5 text-pink-500 flex-shrink-0" />
    if (cleanedTitle.includes("youtube")) return <Youtube className="w-5 h-5 text-red-600 flex-shrink-0" />
    if (cleanedTitle.includes("twitter") || cleanedTitle.includes("x"))
      return <Twitter className="w-5 h-5 text-green-400 flex-shrink-0" />
    if (cleanedTitle.includes("soundcloud")) return <Music className="w-5 h-5 text-orange-500 flex-shrink-0" />
    if (cleanedTitle.includes("twitch")) return <Twitch className="w-5 h-5 text-green-500 flex-shrink-0" />
    if (cleanedTitle.includes("telegram")) return <Send className="w-5 h-5 text-green-500 flex-shrink-0" />
    if (cleanedTitle.includes("linkedin")) return <Linkedin className="w-5 h-5 text-green-700 flex-shrink-0" />
    if (cleanedTitle.includes("spotify")) return <Headphones className="w-5 h-5 text-green-500 flex-shrink-0" />
    if (cleanedTitle.includes("snapchat")) return <Camera className="w-5 h-5 text-yellow-400 flex-shrink-0" />
    if (cleanedTitle.includes("discord")) return <MessageSquare className="w-5 h-5 text-green-500 flex-shrink-0" />
    if (cleanedTitle.includes("reddit")) return <MessageCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
    if (cleanedTitle.includes("pinterest")) return <Heart className="w-5 h-5 text-red-600 flex-shrink-0" />
    if (cleanedTitle.includes("whatsapp")) return <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
    return <Globe className="w-5 h-5 text-gray-500 flex-shrink-0" />
  }

  const handleServiceSelect = async (service) => {
    setSearchQuery("")
    setShowSearchResults(false)
    let serviceCategory = categories.find(cat => cat.id === service.category_id)
    if (!serviceCategory && service.category) {
      serviceCategory = categories.find(cat => cat.id === service.category.id)
    }
    if (serviceCategory) {
      setSelectedCategory(serviceCategory)
      try {
        setLoadingServices(true)
        const response = await fetchSmmServices(serviceCategory.id.toString())
        const categoryServices = response.data.data
        setServices(categoryServices)
        const exactService = categoryServices.find(s => s.id === service.id)
        if (exactService) {
          setSelectedService(exactService)
          setQuantity(exactService.min_amount.toString())
          toast.success(`Selected: ${exactService.service_title}`)
        } else {
          const similarService = categoryServices.find(s =>
            s.service_title.toLowerCase() === service.service_title.toLowerCase()
          )
          if (similarService) {
            setSelectedService(similarService)
            setQuantity(similarService.min_amount.toString())
            toast.success(`Selected: ${similarService.service_title}`)
          } else {
            const firstService = categoryServices[0]
            if (firstService) {
              setSelectedService(firstService)
              setQuantity(firstService.min_amount.toString())
              toast.info("Category selected. Please choose your specific service.")
            }
          }
        }
      } catch (err) {
        toast.error("Failed to load services for selected category")
      } finally {
        setLoadingServices(false)
      }
    } else {
      toast.error("Could not find category for selected service. Please try again.")
    }
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
    if (searchQuery.length > 0 && searchResults.length > 0) setShowSearchResults(true)
  }

  const handleSearchBlur = () => {
    setTimeout(() => setShowSearchResults(false), 300)
  }

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery && debouncedSearchQuery.length >= 2) {
        setIsSearching(true)
        try {
          const response = await searchServicesFast(debouncedSearchQuery, 50)
          const allResults = response.data.data || []
          const sensitiveResults = allResults.filter(service => {
            const searchTerm = debouncedSearchQuery.toLowerCase()
            const serviceTitle = service.service_title?.toLowerCase() || ""
            const serviceDesc = service.description?.toLowerCase() || ""
            const categoryName = service.category?.category_title?.toLowerCase() || ""
            return (
              serviceTitle.includes(searchTerm) ||
              serviceDesc.includes(searchTerm) ||
              categoryName.includes(searchTerm) ||
              searchTerm.split(" ").some(word =>
                serviceTitle.includes(word) || serviceDesc.includes(word) || categoryName.includes(word)
              )
            )
          })
          const resultsWithCategoryId = sensitiveResults.map(service => ({
            ...service,
            category_id: service.category_id || service.category?.id,
            category: service.category || { id: service.category_id },
          }))
          setSearchResults(resultsWithCategoryId)
        } catch (error) {
          if (allServices.length > 0 && debouncedSearchQuery.length >= 2) {
            const searchTerm = debouncedSearchQuery.toLowerCase()
            const results = allServices.filter(service => {
              const serviceTitle = service.service_title?.toLowerCase() || ""
              const serviceDesc = service.description?.toLowerCase() || ""
              const categoryName = service.categoryName?.toLowerCase() || ""
              return (
                serviceTitle.includes(searchTerm) ||
                serviceDesc.includes(searchTerm) ||
                categoryName.includes(searchTerm) ||
                searchTerm.split(" ").some(word =>
                  serviceTitle.includes(word) || serviceDesc.includes(word) || categoryName.includes(word)
                )
              )
            })
            setSearchResults(results.slice(0, 30))
          }
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
        setIsSearching(false)
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
      if (!orderId) throw new Error("Order ID not received in response")
      setOrderStatus({ success: true, message: "Order submitted successfully!", orderId })
      if (newBalance !== undefined) {
        setUser(prevUser => ({ ...prevUser, balance: newBalance }))
      }
      toast.success("Order submitted successfully!")
      setQuantity("")
      setLink("")
      setSelectedService(null)
    } catch (error) {
      let errorMessage = "Failed to submit order"
      let showDetailedError = false
      let isInsufficientBalanceError = false

      if (error.response?.data) {
        const serverError = error.response.data
        if (serverError.message) {
          errorMessage = serverError.message
          isInsufficientBalanceError = serverError.message.includes('Insufficient balance')

          if (isInsufficientBalanceError && serverError.shortfall) {
            showDetailedError = true
          }

          if (serverError.message.includes("active order with this link")) errorMessage = "❌ " + serverError.message
          if (serverError.message.includes("Service not found") || serverError.message.includes("currently unavailable"))
            errorMessage = "⚠️ " + serverError.message
          if (serverError.message.includes("Service provider") || serverError.message.includes("API connection"))
            errorMessage = "🔧 " + serverError.message
        }
      } else if (error.message) {
        if (error.message.includes("Network Error") || error.isNetworkError)
          errorMessage = "🌐 Network error. Please check your internet connection and try again."
        else if (error.isTimeout) errorMessage = "⏰ Request timeout. Please try again."
        else errorMessage = error.message
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
            shortfallText: formatDisplayAmount(error.response?.data?.shortfall),
          } : null,
        })
      }

      if (isInsufficientBalanceError) return

      if (errorMessage.includes("❌")) toast.error(errorMessage.replace("❌ ", ""), { duration: 6000, icon: "⚠️" })
      else if (errorMessage.includes("⚠️")) toast.error(errorMessage.replace("⚠️ ", ""), { duration: 5000 })
      else if (errorMessage.includes("🔧")) toast.error(errorMessage.replace("🔧 ", ""), { duration: 5000, icon: "🔧" })
      else if (errorMessage.includes("🌐")) toast.error(errorMessage, { duration: 4000, icon: "🌐" })
      else if (errorMessage.includes("⏰")) toast.error(errorMessage, { duration: 4000, icon: "⏰" })
      else toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (contextUser) {
      setUser(contextUser);
    } else {
      fetchUserData()
        .then(response => setUser(response.data))
        .catch(() => toast.error("Failed to fetch user info"))
    }
  }, [contextUser])

  const sortCategories = (cats) => {
    const priorityOrder = ["tiktok", "facebook", "instagram"]
    return [...cats].sort((a, b) => {
      const titleA = a.category_title?.toLowerCase().replace(/^[^a-zA-Z0-9]+/, "") || ""
      const titleB = b.category_title?.toLowerCase().replace(/^[^a-zA-Z0-9]+/, "") || ""
      const indexA = priorityOrder.findIndex(p => titleA.includes(p))
      const indexB = priorityOrder.findIndex(p => titleB.includes(p))
      if (indexA !== -1 && indexB !== -1) return indexA - indexB
      if (indexA !== -1) return -1
      if (indexB !== -1) return 1
      return titleA.localeCompare(titleB)
    })
  }

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

  useEffect(() => {
    const fetchServices = async () => {
      if (!selectedCategory) return
      try {
        setLoadingServices(true)
        const response = await fetchSmmServices(selectedCategory.id.toString())
        const srv = response.data.data
        setServices(srv)
        if (!selectedService || selectedService.category !== selectedCategory.id) {
          setSelectedService(srv.length > 0 ? srv[0] : null)
        }
      } catch (err) {
        toast.error("Failed to fetch services")
        setServices([])
        setSelectedService(null)
      } finally {
        setLoadingServices(false)
      }
    }
    fetchServices()
  }, [selectedCategory])

  useEffect(() => {
    const loadAllServices = async () => {
      if (categories.length > 0 && allServices.length === 0 && !isLoadingAllServices) {
        setIsLoadingAllServices(true)
        try {
          const essentialServices = []
          const categoriesToLoad = categories.slice(0, 5)
          for (const category of categoriesToLoad) {
            try {
              const response = await fetchSmmServices(category.id.toString())
              const servicesData = response.data.data
              const servicesWithCategory = servicesData.map(service => ({
                ...service,
                categoryName: category.category_title,
                categoryId: category.id,
              }))
              essentialServices.push(...servicesWithCategory)
            } catch (err) {
              // skip failed category
            }
          }
          setAllServices(essentialServices)
        } catch (err) {
          // silent
        } finally {
          setIsLoadingAllServices(false)
        }
      }
    }
    loadAllServices()
  }, [categories])

  const getServiceMetrics = () => {
    if (!selectedService) return null
    return {
      startTime: selectedService.start_time || "5-30 minutes",
      speed: selectedService.speed || "100-1000/hour",
      avgTime: selectedService.avg_time || selectedService.average_time || "7 hours 43 minutes",
      guarantee: selectedService.guarantee || "30 days",
    }
  }
  const metrics = getServiceMetrics()

  return (
    <div className="w-full overflow-x-hidden">
      <OrderStatusAlert orderStatus={orderStatus} setOrderStatus={setOrderStatus} />
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

      {/* MOBILE */}
      <div className="lg:hidden space-y-3 p-3">

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

        {/* Compact balance bar */}
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl"
          style={{ background: "linear-gradient(135deg, #14532d 0%, #16a34a 100%)" }}>
          <div className="flex items-center gap-3">
            <span className="text-green-200/70 text-[10px] uppercase tracking-widest font-semibold">Balance</span>
            <span className="text-white font-bold text-sm">{formattedBalance}</span>
            <span className="text-white/30">·</span>
            <span className="text-green-200/70 text-[10px] uppercase tracking-widest font-semibold">Orders</span>
            <span className="text-white font-bold text-sm">{user?.total_orders || 0}</span>
          </div>
          <button
            onClick={() => navigate("/dashboard/add-funds")}
            className="bg-white text-green-800 text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
          >
            + Add Funds
          </button>
        </div>

        <ServiceDetails
          selectedService={selectedService}
          selectedCategory={selectedCategory}
          getPlatformIcon={getPlatformIcon}
          metrics={metrics}
          isMobile={true}
        />
      </div>

      {/* DESKTOP */}
      <div className="hidden lg:block w-full">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-5 space-y-5">

          {/* Compact balance bar */}
          <div className="flex items-center justify-between px-5 py-3 rounded-2xl"
            style={{ background: "linear-gradient(135deg, #14532d 0%, #166534 100%)" }}>
            <div className="flex items-center gap-4">
              <span className="text-white font-bold text-base">{user?.username || "..."}</span>
              <span className="text-white/30">|</span>
              <span className="text-green-300/70 text-xs uppercase tracking-widest">Balance</span>
              <span className="text-white font-bold">{formattedBalance}</span>
              <span className="text-white/30">·</span>
              <span className="text-green-300/70 text-xs uppercase tracking-widest">Orders</span>
              <span className="text-white font-bold">{user?.total_orders || 0}</span>
            </div>
            <button
              onClick={() => navigate("/dashboard/add-funds")}
              className="bg-white hover:bg-green-50 text-green-900 text-sm font-bold px-4 py-1.5 rounded-xl transition-colors shadow-sm"
            >
              + Add Funds
            </button>
          </div>

          <div className="grid grid-cols-3 gap-5">
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
            <div className="col-span-1 space-y-4">
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

export default BoostFollowers
