import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  }
});

// Request interceptor for dual auth tokens
api.interceptors.request.use(config => {
  const isAdminRequest = config.url?.startsWith('/admin');
  
  // Skip auth header for login requests
  if (config.url?.endsWith('/login')) return config;

  const token = isAdminRequest
    ? localStorage.getItem('adminToken')
    : localStorage.getItem('authToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const isAdminRequest = error.config?.url?.startsWith('/admin');
      const currentPath = window.location.pathname;
      
      // Don't redirect if we're already on a login page or if the error was from a non-critical request
      const isOnLoginPage = currentPath === '/admin/login' || currentPath === '/';
      
      // Check if we're in admin area - only redirect admin requests to admin login
      const isInAdminArea = currentPath.startsWith('/admin/');
      
      if (!isOnLoginPage) {
        if (isAdminRequest || isInAdminArea) {
          // Admin request or in admin area - redirect to admin login
          // Only clear admin tokens if it was an admin request
          if (isAdminRequest) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminData');
            window.location.href = '/admin/login';
          }
          // If in admin area but request wasn't admin (e.g., categories endpoint), 
          // don't redirect - might be a public endpoint
        } else {
          // User request - redirect to home
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
