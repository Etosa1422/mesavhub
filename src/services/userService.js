import api from "./api";
export const fetchUserData = async () => {
     const response = await api.get('/user');
     return response;
}

export const fetchActiveAnnouncements = async () => {
  try {
    const response = await api.get('/announcements/active');
    return response.data?.data || [];
  } catch {
    return [];
  }
};


export const fetchAllUpdates = async () => {
    try {
        const response = await api.get("/updates");
        // Handle both wrapped and direct data responses
        return {
            data: response.data?.data || response.data || []
        };
    } catch (error) {
        console.error('Error fetching updates:', error);
        return {
            data: []
        };
    }
}

export const initiatePayment = async (paymentData) => {
  try {
    const response = await api.post('/payment/initiate', paymentData);
    return response.data;
  } catch (error) {
    throw error;
  }
}




export const verifyPayment = async (paymentData) => {
  try {
    const response = await api.post('/payment/verify', paymentData)
    return response.data
  } catch (error) {
    throw error
  }
}

export const paymentHistory = async () => {
    const response = await api.get("/payment/history");
     return response;
}

export const submitOPayScreenshot = async (formData) => {
  const response = await api.post('/payment/opay-manual', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}








export const fetchOrderHistory = async ({ status, search, page }) => {
  try {
    const params = {
      page,
      ...(status && { status }),
      ...(search && { search }),
    };

    const response = await api.get("/orders/history", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const fetchSmmCategories = async () => {
  try {
    const response = await api.get('/all-smm-categories');
    // Return data directly if it's an array, otherwise return response
    if (Array.isArray(response.data)) {
      return { data: response.data };
    }
    return response;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

export const fetchNewServices = async () => {
  try {
    const response = await api.get('/all-smm-services', {
      params: {
        is_new: true,
        sort: 'newest'
      }
    });
    // Handle response structure
    return response;
  } catch (error) {
    console.error('Error fetching new services:', error);
    // Return empty data structure on error
    return { data: [] };
  }
};

export const fetchRecommendedServices = async () => {
  try {
    const response = await api.get('/all-smm-services', {
      params: {
        is_recommended: true,
        sort: 'popular'
      }
    });
    // Handle response structure
    return response;
  } catch (error) {
    console.error('Error fetching recommended services:', error);
    // Return empty data structure on error
    return { data: [] };
  }
};


export const fetchAffiliateData = async () => {
  try {
    const response = await api.get('/affiliate');
    return response.data;
  } catch (error) {
    console.error('Affiliate fetch error:', error.response?.data || error.message);
    // Return empty data instead of throwing to prevent UI crashes
    return { has_program: false };
  }
};

export const generateAffiliateLink = async () => {
  try {
    const response = await api.post('/affiliate/generate-link');
    return response.data;
  } catch (error) {
    console.error('Affiliate link generation error:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchAffiliateStats = async () => {
  try {
    const response = await api.get('/affiliate/stats');
    return response.data;
  } catch (error) {
    console.error('Affiliate stats fetch error:', error.response?.data || error.message);
    // Return empty stats instead of throwing
    return {
      visits: 0,
      registrations: 0,
      referrals: 0,
      conversion_rate: 0,
      total_earnings: 0,
      available_earnings: 0
    };
  }
};

export const fetchAffiliatePayouts = async () => {
  try {
    const response = await api.get('/affiliate/payouts');
    const data = response.data;
    // Handle both array and object responses
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error('Affiliate payouts fetch error:', error.response?.data || error.message);
    // Return empty array instead of throwing
    return [];
  }
};

export const requestAffiliatePayout = async () => {
  try {
    const response = await api.post('/affiliate/request-payout');
    return response.data;
  } catch (error) {
    console.error('Affiliate payout request error:', error.response?.data || error.message);
    throw error;
  }
};

// services/adminService.js
export const fetchServiceUpdates = async () => {
  try {
    const response = await api.get('/user-service-updates'); // your endpoint
    return response.data; // returns { status, updates }
  } catch (error) {
    console.error(
      'Service updates fetch error:',
      error.response?.data || error.message
    );
    throw error;
  }
};





// export const fetchUserNotifications = async () => {
//   try {
//     const response = await api.get("/notifications");
//     console.log("📩 Notification API Response:", response.data);

//     if (response.data?.data && Array.isArray(response.data.data)) {
//       return response.data.data; // ✅ Correct path
//     } else if (Array.isArray(response.data)) {
//       return response.data;
//     } else if (Array.isArray(response.data.notifications)) {
//       return response.data.notifications;
//     } else {
//       return [];
//     }
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     return [];
//   }
// };


export const fetchUserNotifications = async () => {
  try {
    const response = await api.get("/notifications");
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { data: [], unread_count: 0 };
  }
};

export const markNotificationAsRead = async (id) => {
  try {
    await api.post(`/notifications/mark-read/${id}`);
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    await api.post(`/notifications/mark-all`);
  } catch (error) {
    console.error("Error marking all as read:", error);
  }
};

export const deleteNotification = async (id) => {
  try {
    await api.delete(`/notifications/delete/${id}`);
  } catch (error) {
    console.error("Error deleting notification:", error);
  }
};

export const clearAllNotifications = async () => {
  try {
    await api.delete(`/notifications/clear-all`);
  } catch (error) {
    console.error("Error clearing notifications:", error);
  }
};








