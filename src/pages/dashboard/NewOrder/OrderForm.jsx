"use client"
import React from "react"
import { Globe, Loader2 } from "lucide-react"
import SearchBar from "./SearchBar"
import { CSS_COLORS } from "../../../components/constant/colors"

const OrderForm = ({
  // Search
  searchQuery,
  handleSearchChange,
  handleSearchFocus,
  handleSearchBlur,
  showSearchResults,
  isSearching,
  searchResults,
  handleServiceSelect,
          getPlatformIcon,
          convertToSelectedCurrency,
          formatCurrency,
          selectedCurrency,
  
  // Categories & Services
  categories,
  loadingCategories,
  selectedCategory,
  setSelectedCategory,
  services,
  loadingServices,
  selectedService,
  setSelectedService,
  setQuantity,
  
  // Form fields
  quantity,
  setQuantityValue,
  link,
  setLink,
  
  // Submission
  isSubmitting,
  handleSubmitOrder,
  
  // Totals
  formattedTotalCost,
  
  // Layout
  isMobile = false
}) => {
  return (
    <div className={`bg-white dark:bg-[#0f0f1a] ${isMobile ? 'rounded-xl p-4' : 'rounded-2xl p-6'} shadow-sm border border-gray-100 dark:border-white/5 w-full overflow-hidden`}>
      <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold text-gray-800 dark:text-white ${isMobile ? 'mb-4' : 'mb-6'}`}>
        Place Your Order
      </h2>
      
      <div className={`${isMobile ? 'space-y-4' : 'space-y-6'} w-full`}>
        {/* Search Bar */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onSearchFocus={handleSearchFocus}
          onSearchBlur={handleSearchBlur}
          showSearchResults={showSearchResults}
          isSearching={isSearching}
          searchResults={searchResults}
          onSelectService={handleServiceSelect}
          getPlatformIcon={getPlatformIcon}
          convertToSelectedCurrency={convertToSelectedCurrency}
          formatCurrency={formatCurrency}
          selectedCurrency={selectedCurrency}
          isMobile={isMobile}
        />

        {/* Category & Service - Always vertical on mobile */}
        <div className={`${isMobile ? 'space-y-4' : `grid grid-cols-1 md:grid-cols-2 gap-6`}`}>
          <div>
            <label className={`block ${isMobile ? 'text-base' : 'text-lg'} font-medium text-gray-700 dark:text-gray-200 ${isMobile ? 'mb-2.5' : 'mb-3'}`}>
              Category
            </label>
            {loadingCategories ? (
              <div className={`${isMobile ? 'p-3' : 'p-4'} border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-[#0a0a0f] animate-pulse`}>
                <div className="h-4 bg-gray-300 dark:bg-white/10 rounded"></div>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={selectedCategory?.id || ""}
                  onChange={(e) => {
                    const cat = categories.find((c) => c.id.toString() === e.target.value)
                    setSelectedCategory(cat)
                  }}
                  className={`w-full ${isMobile ? 'pl-10 pr-4 py-3 text-sm' : 'pl-12 pr-4 py-4 text-lg'} border border-gray-200 dark:border-white/10 rounded-xl appearance-none bg-gray-50 dark:bg-[#0a0a0f] text-gray-800 dark:text-white`}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id.toString()}>
                      {category.category_title}
                    </option>
                  ))}
                </select>
                <div className={`absolute ${isMobile ? 'left-3' : 'left-4'} top-1/2 transform -translate-y-1/2`}>
                  {selectedCategory ? (
                    getPlatformIcon(selectedCategory.category_title)
                  ) : (
                    <Globe className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-500`} />
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className={`block ${isMobile ? 'text-base' : 'text-lg'} font-medium text-gray-700 dark:text-gray-200 ${isMobile ? 'mb-2.5' : 'mb-3'}`}>
              Service
            </label>
            {loadingServices ? (
              <div className={`${isMobile ? 'p-3' : 'p-4'} border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-[#0a0a0f] animate-pulse`}>
                <div className="h-4 bg-gray-300 dark:bg-white/10 rounded"></div>
              </div>
            ) : (
              <>
                <div className="relative w-full">
                  <select
                    value={selectedService?.id || ""}
                    onChange={(e) => {
                      const srv = services.find((s) => s.id.toString() === e.target.value)
                      if (srv) {
                        setSelectedService(srv)
                        setQuantity(srv.min_amount.toString())
                      }
                    }}
                    className={`w-full ${isMobile ? 'pl-11 pr-4 py-3 text-base' : 'pl-12 pr-4 py-4 text-lg'} border border-gray-200 dark:border-white/10 rounded-xl appearance-none bg-gray-50 dark:bg-[#0a0a0f] text-gray-800 dark:text-white max-w-full`}
                    disabled={!selectedCategory || services.length === 0}
                  >
                    {services.length > 0 ? (
                      services.map((service) => (
                        <option key={service.id} value={service.id.toString()}>
                          {service.service_title} - {formatCurrency && typeof formatCurrency === 'function' ? formatCurrency(
                            convertToSelectedCurrency(service.price * 1000, "NGN"),
                            selectedCurrency
                          ) : `₦${(service.price * 1000).toLocaleString()}`} per 1k
                        </option>
                      ))
                    ) : (
                      <option value="">No services available</option>
                    )}
                  </select>
                  {/* Icon overlay for selected service */}
                  <div className={`absolute ${isMobile ? 'left-3' : 'left-4'} top-1/2 transform -translate-y-1/2 pointer-events-none`}>
                    {selectedService && getPlatformIcon(selectedCategory?.category_title, selectedService.service_title)}
                  </div>
                </div>
                {selectedService && (
                  <div className={`${isMobile ? 'mt-3' : 'mt-3'} flex items-center gap-2`}>
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(selectedCategory?.category_title, selectedService.service_title)}
                      <p className={`${isMobile ? 'text-sm sm:text-base' : 'text-sm'} text-gray-500 dark:text-gray-400`}>
                        Min: {selectedService.min_amount} - Max: {selectedService.max_amount}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Link & Quantity */}
        <div className={`${isMobile ? 'space-y-4' : `grid grid-cols-1 md:grid-cols-2 gap-6`}`}>
          <div className="w-full">
            <label className={`block ${isMobile ? 'text-base' : 'text-lg'} font-medium text-gray-700 dark:text-gray-200 ${isMobile ? 'mb-2.5' : 'mb-3'}`}>
              Link
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Enter your profile/post URL"
              className={`w-full px-4 ${isMobile ? 'py-3.5 text-base' : 'py-4 text-lg'} border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors bg-gray-50 dark:bg-[#0a0a0f] text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 max-w-full`}
              required
            />
          </div>

          <div className="w-full">
            <label className={`block ${isMobile ? 'text-base' : 'text-lg'} font-medium text-gray-700 dark:text-gray-200 ${isMobile ? 'mb-2.5' : 'mb-3'}`}>
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantityValue(e.target.value)}
              min={selectedService?.min_amount || 0}
              max={selectedService?.max_amount || 1000000}
              placeholder="Enter quantity"
              className={`w-full px-4 ${isMobile ? 'py-3.5 text-base' : 'py-4 text-lg'} border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors bg-gray-50 dark:bg-[#0a0a0f] text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 max-w-full`}
              required
            />
          </div>
        </div>

        {/* Cost Summary */}
        <div className={`bg-brand-50 dark:bg-brand-950/30 rounded-xl ${isMobile ? 'p-4' : 'p-6'} border border-brand-100 dark:border-brand-900/40`}>
          <div className="text-center">
            <p className={`${isMobile ? 'text-base' : 'text-xl'} text-gray-600 dark:text-gray-300 ${isMobile ? 'mb-2' : 'mb-3'}`}>
              Total Cost
            </p>
            <p className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-bold text-gray-800 dark:text-white ${isMobile ? 'mb-2' : 'mb-3'}`}>
              {formattedTotalCost}
            </p>
            <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-gray-500 dark:text-gray-400`}>
              {quantity} units × {selectedService ? (formatCurrency && typeof formatCurrency === 'function' ? formatCurrency(convertToSelectedCurrency(selectedService.price * 1000, "NGN"), selectedCurrency) : `₦${(selectedService.price * 1000).toLocaleString()}`) : '0'} per 1k
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmitOrder}
          disabled={isSubmitting}
          className={`w-full text-white font-semibold ${isMobile ? 'py-4 text-base' : 'py-5 text-xl'} rounded-xl shadow-lg flex items-center justify-center transition-all duration-200 active:opacity-90 disabled:opacity-70`}
          style={{ backgroundColor: CSS_COLORS.primary }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className={`${isMobile ? 'w-5 h-5 mr-2' : 'w-6 h-6 mr-3'} animate-spin`} />
              {isMobile ? 'Processing...' : 'Processing Order...'}
            </>
          ) : (
            "Submit Order"
          )}
        </button>
      </div>
    </div>
  )
}

export default OrderForm
