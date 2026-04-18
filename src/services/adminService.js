import api from "./api";

export const adminLogin = async (email, password) => {
  const response = await api.post('/admin/login', {
    email: email.trim(),
    password,
  });
  return response.data;
};

export const adminLogout = async () => {
  await api.post('/admin/logout');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminData');
};

export const AdminDashboard = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};


export const fetchApiProviders = async () => {
  const response = await api.get('/admin/providers');
  return response.data.data;
};

export const fetchApiProviderDetails = async (id) => {
  const response = await api.get(`/admin/providers/${id}`);
  return response.data;
};

export const createApiProvider = async (providerData) => {
  const response = await api.post('/admin/providers/', providerData);
  return response.data;
};

export const updateApiProvider = async (id, providerData) => {
  const response = await api.put(`/admin/providers/${id}`, providerData);
  return response.data.data;
};

export const deleteApiProvider = async (id) => {
  const response = await api.delete(`/admin/providers/${id}`);
  return response.data;
};

export const toggleApiProviderStatus = async (id) => {
  const response = await api.patch(`/admin/providers/${id}/toggle-status`);
  return response.data;
};

export const syncApiProviderServices = async (id) => {
  const response = await api.post(`/admin/providers/${id}/sync-services`);
  return response.data;
};


export const sendEmailToUser = async (userId, subject, message) => {
  const response = await api.post(`/admin/users/${userId}/send-email`, {
    subject: subject.trim(),
    message: message.trim(),
  })
  return response.data
}





export const setCustomRateForUser = async (userId, service, rate, type) => {
  const response = await api.post(`/admin/users/${userId}/custom-rate`, {
    service,
    rate,
    type,
  });
  return response.data;
}



export const fetchUsers = async () => {
  const response = await api.get(`/admin/users`);
  return response.data;
};


export const getUserById = async (id) => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/admin/users/${id}`, userData);
  return response.data;
};

export const adjustUserBalance = async (userId, action, amount, notes = "") => {
  const response = await api.post(`/admin/users/${userId}/adjust-balance`, {
    action, // 'add' or 'subtract'
    amount: parseFloat(amount),
    notes,
  });
  return response.data;
};

export const adjustUserBalanceLegacy = async ({ user_id, amount, type, note = "" }) => {
  const response = await api.post("/admin/users/balance-adjust", {
    user_id,
    amount,
    type,
    note,
  });
  return response.data;
};



// Fetch user orders
export const fetchUserOrders = async (userId) => {
  const response = await api.get(`/admin/users/${userId}/orders`);
  return response.data;
};

// Fetch all categories for admin
export const fetchCategories = async () => {
  const response = await api.get(`/admin/categories`);
  return response.data;
};

// Fetch all categories (alias for admin panel usage)
export const fetchAdminCategories = async () => {
  const response = await api.get(`/admin/categories`);
  return response.data;
};

// Fetch all services
export const fetchServices = async () => {
  const response = await api.get(`/admin/users/services`);
  return response.data;
};
// Fetch user orders
export const fetchUserTransactions = async (userId) => {
  const response = await api.get(`/admin/users/${userId}/transactions`);
  return response.data;
};

// User management operations
export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

export const activateUser = async (id) => {
  const response = await api.post(`/admin/users/${id}/activate`);
  return response.data;
};

export const deactivateUser = async (id) => {
  const response = await api.post(`/admin/users/${id}/deactivate`);
  return response.data;
};

export const changeUserStatus = async (id, status) => {
  const response = await api.patch(`/admin/users/${id}/status`, { status });
  return response.data;
};

export const generateUserApiKey = async (id) => {
  const response = await api.post(`/admin/users/${id}/generate-api-key`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/admin/users', userData);
  return response.data;
};

export const createUserTransaction = async (userId, transactionData) => {
  const response = await api.post(`/admin/users/${userId}/transactions`, transactionData);
  return response.data;
};

export const createUserOrder = async (userId, orderData) => {
  const response = await api.post(`/admin/users/${userId}/orders`, orderData);
  return response.data;
};

export const updateUserOrder = async (userId, orderId, orderData) => {
  const response = await api.put(`/admin/users/${userId}/orders/${orderId}`, orderData);
  return response.data;
};

export const deleteUserOrder = async (userId, orderId) => {
  const response = await api.delete(`/admin/users/${userId}/orders/${orderId}`);
  return response.data;
};

export const updateUserTransaction = async (userId, transactionId, transactionData) => {
  const response = await api.put(`/admin/users/${userId}/transactions/${transactionId}`, transactionData);
  return response.data;
};

export const deleteUserTransaction = async (userId, transactionId) => {
  const response = await api.delete(`/admin/users/${userId}/transactions/${transactionId}`);
  return response.data;
};

// Login as user (impersonation)
export const loginAsUser = async (userId) => {
  const response = await api.post(`/admin/users/${userId}/login-as-user`);
  return response.data;
};


export const sendEmailToAllUsers = async (subject, message) => {
  const response = await api.post('/admin/send-email-all', {
    subject,
    message,
  });
  return response.data;
}


// Fetch all support tickets for admin
export const fetchAdminTickets = async (params = {}) => {
  try {
    const response = await api.get(`/admin/tickets`, { params });
    return response.data?.tickets || [];
  } catch (error) {
    console.error('Error fetching admin tickets:', error);
    return [];
  }
};

// Get single ticket details (admin)
export const fetchAdminTicketDetails = async (id) => {
  try {
    const response = await api.get(`/admin/tickets/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin ticket details:', error);
    throw error;
  }
};

// Update ticket status
export const updateTicketStatus = async (id, status) => {
  try {
    const response = await api.put(`/admin/tickets/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating ticket status:', error);
    throw error;
  }
};

// Update ticket priority
export const updateTicketPriority = async (id, priority) => {
  try {
    const response = await api.put(`/admin/tickets/${id}/priority`, { priority });
    return response.data;
  } catch (error) {
    console.error('Error updating ticket priority:', error);
    throw error;
  }
};

// Reply to ticket (admin)
export const replyToTicketAdmin = async (id, message, isInternal = false) => {
  try {
    const response = await api.post(`/admin/tickets/${id}/reply`, { 
      message,
      is_internal: isInternal 
    });
    return response.data;
  } catch (error) {
    console.error('Error replying to ticket:', error);
    throw error;
  }
};

// Delete ticket
export const deleteTicket = async (id) => {
  try {
    const response = await api.delete(`/admin/tickets/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting ticket:', error);
    throw error;
  }
};
export const fetchAllOrders = async (params = {}) => {
  try {
    const cleanedParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '' && params[key] !== null) {
        cleanedParams[key] = params[key];
      }
    });

    const response = await api.get('/admin/orders', { 
      params: cleanedParams,
      validateStatus: (status) => status < 500
    });
    
    return {
      data: response.data?.data || [],
      current_page: response.data?.current_page || 1,
      last_page: response.data?.last_page || 1,
      per_page: response.data?.per_page || 15,
      total: response.data?.total || 0,
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return {
      data: [],
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    };
  }
};

export const fetchOrderDetails = async (id) => {
  const response = await api.get(`/admin/orders/${id}`);
  return response.data;
};

export const updateOrder = async (id, orderData) => {
  const response = await api.put(`/admin/orders/${id}`, orderData);
  return response.data;
};

export const deleteOrder = async (id) => {
  const response = await api.delete(`/admin/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id, statusData) => {
  const response = await api.patch(`/admin/orders/${id}/status`, statusData);
  return response.data;
};




// Transactions
export const fetchTransactions = async (params = {}) => {
  try {
    // Clean up params
    const cleanedParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '' && params[key] !== null) {
        cleanedParams[key] = params[key];
      }
    });

    const response = await api.get('/admin/transactions', { 
      params: cleanedParams,
      validateStatus: (status) => status < 500
    });
    
    // Ensure consistent response structure
    return {
      data: response.data?.data || [],
      current_page: response.data?.current_page || 1,
      last_page: response.data?.last_page || 1,
      per_page: response.data?.per_page || 15,
      total: response.data?.total || 0
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return {
      data: [],
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0
    };
  }
};

export const fetchTransactionDetails = async (id) => {
  try {
    const response = await api.get(`/admin/transactions/${id}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    throw error;
  }
};

export const createTransaction = async (transactionData) => {
  const response = await api.post('/admin/transactions', transactionData);
  return response.data?.data || response.data;
};

export const updateTransaction = async (id, transactionData) => {
  try {
    const response = await api.put(`/admin/transactions/${id}`, transactionData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

export const deleteTransaction = async (id) => {
  try {
    const response = await api.delete(`/admin/transactions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

export const changeTransactionStatus = async (id, status) => {
  try {
    const response = await api.patch(`/admin/transactions/${id}/status`, { status });
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error changing transaction status:', error);
    throw error;
  }
};

export const fetchTransactionStats = async () => {
  const response = await api.get('/admin/transactions/stats');
  return response.data;
};


export const getAdminSettings = async () => {
  const response = await api.get('/admin/settings');
  return response.data;
};

export const updateAdminProfile = async (profileData) => {
  const response = await api.put('/admin/settings/profile', profileData);
  return response.data;
};

export const updateAdminSecurity = async (securityData) => {
  const response = await api.put('/admin/settings/security', securityData);
  return response.data;
};

export const getAdminActivityLogs = async () => {
  const response = await api.get('/admin/settings/activity');
  return response.data;
};


//service update
export const createServiceUpdate = async (updateData) => {
  const response = await api.post('/admin/service-updates', updateData)
  return response.data
}




export const ServiceUpdateHistory = async () => {
  try {
    const response = await api.get('/admin/service-update-history')
    // Handle both wrapped and direct data responses
    return {
      data: response.data?.data || response.data || []
    }
  } catch (error) {
    console.error('Error fetching service update history:', error);
    return {
      data: []
    }
  }
}



export const applyServiceMarkup = async (payload) => {
  try {
    const response = await api.post('/admin/services/apply-markup', payload)
    return response.data
  } catch (error) {
    console.error('Error applying markup:', error)
    throw error
  }
}

export const getSiteSettings = async () => {
  const response = await api.get('/site-settings')
  return response.data?.data || {}
}

export const updateSiteSettings = async (settings) => {
  const response = await api.put('/admin/site-settings', settings)
  return response.data
}

export const increaseServicePrices = applyServiceMarkup

export const getServicePriceStats = async (params = {}) => {
  try {
    const cleanedParams = {}
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '' && params[key] !== null) {
        cleanedParams[key] = params[key]
      }
    })
    const response = await api.get('/admin/services/price-stats', { params: cleanedParams })
    return response.data
  } catch (error) {
    console.error('Error fetching service price stats:', error)
    throw error
  }
}


