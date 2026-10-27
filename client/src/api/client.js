import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true, // Send httpOnly JWT cookie automatically with all cross-site requests
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor for centralized error extraction
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorResponse = error.response?.data || {
      message: error.message || 'Network connection failed'
    };
    return Promise.reject(errorResponse);
  }
);

export default api;
