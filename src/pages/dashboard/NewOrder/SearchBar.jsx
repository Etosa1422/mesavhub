"use client"
import React from "react"
import { Search, Loader2 } from "lucide-react"
// Note: formatCurrency is passed as prop from parent component

const SearchResultsDropdown = ({ 
  showSearchResults, 
  searchQuery, 
  isSearching, 
  searchResults, 
  onSelectService,
  getPlatformIcon,
  convertToSelectedCurrency,
  formatCurrency,
  selectedCurrency
}) => {
  if (!showSearchResults || !searchQuery) return null

  if (isSearching) {
    return (
      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-[#0d1a10] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg">
        <div className="p-4 text-center">
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-brand-500" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Searching services...</p>
        </div>
      </div>
    )
  }

  if (searchResults.length === 0 && searchQuery.length > 0 && !isSearching) {
    return (
      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-[#0d1a10] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg">
        <div className="p-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">No services found for "{searchQuery}"</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try different keywords or check spelling</p>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto bg-white dark:bg-[#0d1a10] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg">
      <div className="p-2">
        <div className="px-3 py-2 border-b border-gray-100 dark:border-white/10">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Found {searchResults.length} service{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
          </p>
        </div>
        {searchResults.slice(0, 25).map((service) => (
          <div
            key={service.id}
            onMouseDown={() => onSelectService(service)}
            className="p-3 hover:bg-brand-50 dark:hover:bg-brand-950/30 rounded-lg cursor-pointer transition-all duration-200 border-b border-gray-100 dark:border-white/10 last:border-b-0 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1.5">
                  <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded truncate">
                    {service.category?.category_title || service.categoryName || 'Uncategorized'}
                  </span>
                </div>
                <h4 className="font-medium text-gray-800 dark:text-white text-sm sm:text-base mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 truncate flex items-center gap-2">
                  {getPlatformIcon(service.category?.category_title || service.categoryName, service.service_title)}
                  <span>{service.service_title}</span>
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {service.description || "No description available"}
                </p>
                <div className="flex items-center flex-wrap gap-x-3 sm:gap-x-4 gap-y-1.5 mt-2">
                  <span className="text-xs sm:text-sm text-green-600 font-medium">
                    {formatCurrency ? formatCurrency(convertToSelectedCurrency(service.price * 1000, "NGN"), selectedCurrency) : `₦${(service.price * 1000).toLocaleString()}`} per 1k
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500">
                    Min: {service.min_amount} | Max: {service.max_amount}
                  </span>
                </div>
              </div>
              <div className="text-xs text-green-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                Select →
              </div>
            </div>
          </div>
        ))}
        {searchResults.length > 25 && (
          <div className="px-3 py-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Showing first 25 of {searchResults.length} services
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const SearchBar = ({
  searchQuery,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  showSearchResults,
  isSearching,
  searchResults,
  onSelectService,
  getPlatformIcon,
  convertToSelectedCurrency,
  formatCurrency,
  selectedCurrency,
  isMobile = false
}) => {
  return (
    <div className="relative w-full">
      <Search className={`absolute ${isMobile ? 'left-3' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400 ${isMobile ? 'w-5 h-5' : 'w-5 h-5'} pointer-events-none`} />
      <input
        type="text"
        placeholder={isMobile ? "Search services..." : "Search services... (minimum 2 characters)"}
        value={searchQuery}
        onChange={onSearchChange}
        onFocus={onSearchFocus}
        onBlur={onSearchBlur}
        className={`w-full ${isMobile ? 'pl-10 pr-4 py-3.5 text-base' : 'pl-12 pr-4 py-4 text-lg'} border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors bg-gray-50 dark:bg-[#0a0a0f] text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 max-w-full`}
      />
      <SearchResultsDropdown
        showSearchResults={showSearchResults}
        searchQuery={searchQuery}
        isSearching={isSearching}
        searchResults={searchResults}
        onSelectService={onSelectService}
        getPlatformIcon={getPlatformIcon}
        convertToSelectedCurrency={convertToSelectedCurrency}
        formatCurrency={formatCurrency}
        selectedCurrency={selectedCurrency}
      />
    </div>
  )
}

export default SearchBar
