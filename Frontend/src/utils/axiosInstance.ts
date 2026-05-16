import axios from "axios";
import { env } from "../config/env";
import { handleError } from "./errorHandler";
import { useAuthStore } from "../store/useAuthStore";
import { useUIStore } from "../store/useUIStore";

// =========================
// Axios Instance
// =========================

const axiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// =========================
// Refresh Token Logic
// =========================

let isRefreshing = false;
let failedQueue: Array<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (value?: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject: (reason?: any) => void;
}> = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
  isRefreshing = false;
};

// =========================
// Response Interceptor
// =========================

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (Token Expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for ongoing refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { loading } = useUIStore.getState(); 

      try {
        loading(true);

        // Call refresh token endpoint
        await axios.post(
          `${env.apiBaseUrl}/Auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        // Re-initialize auth state
        await useAuthStore.getState().initialize();

        processQueue(null);

        loading(false); 

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);

        // Clear auth and redirect to login
        useAuthStore.getState().logout();
        loading(false);

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response?.status !== 401) {
      handleError(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;