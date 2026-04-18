import api from "./api";

// Cache for categories and services
let categoriesCache = null;
let allServicesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const fetchSmmCategories = async () => {
  // Return cached data if available and not expired
  if (categoriesCache && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
    return { data: { data: categoriesCache } };
  }

  try {
    const response = await api.get('/categories');
    if (response.data.success) {
      categoriesCache = response.data.data;
      cacheTimestamp = Date.now();
    }
    return response;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

export const fetchSmmServices = async (categoryId) => {
  try {
    const response = await api.get(`/services?category_id=${categoryId}`);
    return response;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
}

// Fast search endpoint
export const searchServicesFast = async (searchQuery, limit = 20) => {
  if (!searchQuery || searchQuery.trim().length < 2) {
    return { data: { data: [] } };
  }

  try {
    const response = await api.get(`/services/search?q=${encodeURIComponent(searchQuery.trim())}&limit=${limit}`);
    return response;
  } catch (error) {
    console.error('Error searching services:', error);
    return { data: { data: [] } };
  }
}

// Debounced search function
let searchTimeout;
export const debouncedSearch = (searchQuery, callback, delay = 300) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    if (searchQuery && searchQuery.trim().length >= 2) {
      try {
        const response = await searchServicesFast(searchQuery);
        callback(response.data.data || []);
      } catch (error) {
        console.error('Search error:', error);
        callback([]);
      }
    } else {
      callback([]);
    }
  }, delay);
};

// Clear cache function
export const clearServicesCache = () => {
  categoriesCache = null;
  allServicesCache = null;
  cacheTimestamp = null;
  
  // Clear sessionStorage cache
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('services_')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    
    let errorMessage = 'Failed to create order. Please try again.';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout. Please check your connection and try again.';
    } else if (error.response) {
      const serverError = error.response.data;
      
      if (serverError.message) {
        errorMessage = serverError.message;
      }
      
      // Show debug info if available
      if (serverError.debug) {
        console.error('Debug Info:', serverError.debug);
        errorMessage += `\n\nDebug: ${serverError.debug.error} at ${serverError.debug.file}:${serverError.debug.line}`;
      }
      
      if (serverError.shortfall) {
        errorMessage += ` You need $${serverError.shortfall} more.`;
      }
    } else if (error.request) {
      errorMessage = 'Network error. Please check your internet connection.';
    }
    
    const enhancedError = new Error(errorMessage);
    enhancedError.originalError = error;
    enhancedError.responseData = error.response?.data;
    enhancedError.isNetworkError = !error.response;
    enhancedError.isTimeout = error.code === 'ECONNABORTED';
    
    throw enhancedError;
  }
}

// Mass Order - Create multiple orders at once
export const createMassOrder = async (ordersArray) => {
  try {
    // Try mass order endpoint first
    const response = await api.post('/orders/mass', { orders: ordersArray }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 60000 // Longer timeout for bulk operations
    });
    return response.data;
  } catch (error) {
    // If mass endpoint doesn't exist (404), fallback to individual orders
    if (error.response?.status === 404 || error.response?.status === 405) {
      console.log('Mass order endpoint not available, falling back to individual orders...');
      return await createOrdersIndividually(ordersArray);
    }
    
    console.error('Error creating mass order:', error);
    
    let errorMessage = 'Failed to create mass order. Please try again.';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout. The operation is taking longer than expected.';
    } else if (error.response) {
      const serverError = error.response.data;
      
      if (serverError.message) {
        errorMessage = serverError.message;
      }
      
      // Handle partial success scenarios
      if (serverError.failed_orders && serverError.failed_orders.length > 0) {
        errorMessage += ` ${serverError.failed_orders.length} order(s) failed.`;
      }
      
      if (serverError.shortfall) {
        errorMessage += ` Insufficient balance. You need $${serverError.shortfall} more.`;
      }
    } else if (error.request) {
      errorMessage = 'Network error. Please check your internet connection.';
    }
    
    const enhancedError = new Error(errorMessage);
    enhancedError.originalError = error;
    enhancedError.responseData = error.response?.data;
    enhancedError.isNetworkError = !error.response;
    enhancedError.isTimeout = error.code === 'ECONNABORTED';
    
    throw enhancedError;
  }
}

// Fallback: Create orders individually if mass endpoint is not available
const createOrdersIndividually = async (ordersArray) => {
  const results = {
    successful_orders: 0,
    failed_orders: [],
    order_ids: []
  };

  for (let i = 0; i < ordersArray.length; i++) {
    const order = ordersArray[i];
    try {
      // Format order to match single order API structure
      const orderData = {
        service: order.service,
        link: order.link,
        quantity: order.quantity,
        check: false // Don't check balance for each individual order in bulk
      };

      const response = await api.post('/orders', orderData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      results.successful_orders++;
      if (response.data?.order_id) {
        results.order_ids.push(response.data.order_id);
      }
    } catch (error) {
      results.failed_orders.push({
        lineNumber: order.lineNumber || i + 1,
        service: order.service,
        link: order.link,
        quantity: order.quantity,
        message: error.response?.data?.message || error.message || 'Failed to create order'
      });
    }

    // Small delay between requests to avoid overwhelming the server
    if (i < ordersArray.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return {
    status: results.failed_orders.length === 0 ? 'success' : 'partial',
    successful_orders: results.successful_orders,
    failed_orders: results.failed_orders,
    order_ids: results.order_ids,
    success_count: results.successful_orders,
    fail_count: results.failed_orders.length
  };
}

//user ticket 
export const createTicket = async (ticketData) => {
  try {
    const response = await api.post('/tickets', ticketData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
}

//user ticket history
export const fetchUserTickets = async () => {
  try {
    const response = await api.get('/tickets');
    return response.data?.tickets || [];
  } catch (error) {
    console.error('Error fetching tickets history:', error);
    return [];
  }
};

// Get single ticket details
export const fetchTicketDetails = async (id) => {
  try {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    throw error;
  }
};

// Reply to ticket (user)
export const replyToTicket = async (id, message) => {
  try {
    const response = await api.post(`/tickets/${id}/reply`, { message });
    return response.data;
  } catch (error) {
    console.error('Error replying to ticket:', error);
    throw error;
  }
};

export const fetchOrderHistory = async (params = {}) => {
  try {
    // Construct query parameters
    const queryParams = new URLSearchParams();
    
    // Add optional parameters if they exist
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    
    const response = await api.get(`/orders/history?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order history:', error);
    throw error;
  }
}

export const fetchAllSmmServices = async () => {
  try {
    const response = await api.get("/all-services");
    return response;
  } catch (error) {
    console.error('Error fetching all services:', error);
    throw error;
  }
}

export const fetchNewServices = async () => {
  try {
    const response = await api.get('/all-smm-services', {
      params: { is_new: true, per_page: 20 }
    });
    return response;
  } catch (error) {
    console.error('Error fetching new services:', error);
    throw error;
  }
};

export const fetchRecommendedServices = async () => {
  try {
    const response = await api.get('/all-smm-services', {
      params: { is_recommended: true, per_page: 20 }
    });
    return response;
  } catch (error) {
    console.error('Error fetching recommended services:', error);
    throw error;
  }
};

export const fetchApiProviders = async () => {
  try {
    return await api.get("/admin/providers");
  } catch (error) {
    console.error('Error fetching API providers:', error);
    throw error;
  }
}

export const fetchServicesFromProvider = async (provider) => {
  try {
    return await api.post("/admin/providers/services/all", {
      provider
    });
  } catch (error) {
    console.error('Error fetching services from provider:', error);
    throw error;
  }
}

export const importSelectedServices = (providerId, selectedServices) => {
  return api.post('/admin/providers/services/save', {
    api_provider_id: providerId,
    services: selectedServices,
  });
};

export const fetchCurrencies = async () => {
  try {
    return await api.get("/currencies");
  } catch (error) {
    console.error('Error fetching currencies:', error);
    throw error;
  }
};