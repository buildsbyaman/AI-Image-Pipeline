import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Session expired, clear storage and redirect
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Determine a clean, user-safe error message
    let message = 'Something went wrong. Please try again.';

    if (error.response) {
      const status = error.response.status;
      if (status >= 500) {
        message = 'An internal server error occurred. Please try again later.';
      } else if (error.response.data && (error.response.data.message || error.response.data.error)) {
        // Use backend-supplied client messages (e.g. Validation errors or authentication failures)
        message = error.response.data.message || error.response.data.error;
      }
    } else if (error.request) {
      // No response was received (Network down / offline)
      message = 'Network connection issue. Please check your internet connection and try again.';
    }

    // Log the raw details in development console only
    if (import.meta.env.DEV) {
      console.error('❌ Sanitized API Error:', error);
    }

    // Reject the promise with a sanitized error structure to shield the components from raw stacks
    const sanitizedError = {
      message,
      statusCode: error.response?.status || 500,
    };

    return Promise.reject(sanitizedError);
  }
);

export default api;
