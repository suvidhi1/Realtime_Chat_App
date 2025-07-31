import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    console.log('🔍 API Request Debug:', {
      url: `${config.baseURL}${config.url}`,
      method: config.method?.toUpperCase(),
      hasToken: !!token,
      tokenStart: token ? token.substring(0, 30) + '...' : 'NO TOKEN',
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Authorization header added');
    } else {
      console.log('❌ No token found in localStorage');
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.error || error.response?.data?.message,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
    });
    
    if (error.response?.status === 401) {
      console.log('🚨 Authentication failed - clearing token and redirecting');
      localStorage.removeItem('token');
      toast.error('Session expired. Please login again.');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      toast.error('Access denied. You don\'t have permission for this action.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
