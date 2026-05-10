import axios from "axios";
import { env } from "../config/env";
import { handleError } from "./errorHandler";
import { useAuthStore } from "../store/useAuthStore";

const axiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Handle Token Refresh (401 Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${env.apiBaseUrl}/Auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout and redirect
        useAuthStore.getState().logout();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // 2. Handle Other Errors Automatically (403, 404, 500, etc.)
    // We skip 401 here because it's handled above
    if (error.response?.status !== 401) {
      handleError(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;