import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "http://localhost:8000/api";

export const authApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to attach bearer token
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh on 401
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 Unauthorized and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url === "/auth/refresh" || originalRequest.url === "/auth/login" || originalRequest.url === "/auth/signup") {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return authApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // No body needed — the server reads the httpOnly refresh token cookie automatically
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (response.data.success) {
          const { accessToken } = response.data.data;
          localStorage.setItem("accessToken", accessToken);

          authApi.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
          processQueue(null, accessToken);
          return authApi(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        window.dispatchEvent(new Event("auth-expired"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
