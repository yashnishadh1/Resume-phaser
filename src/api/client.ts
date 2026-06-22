import axios from 'axios';

// Base API configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 Unauthorized errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('userFirstName');
      localStorage.removeItem('userLastName');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
