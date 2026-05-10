import axios, { AxiosError } from "axios";
import { useUIStore } from "../store/useUIStore";

interface ApiErrorResponse {
  message?: string;
  errors?: string[] | Record<string, string[]>;
}

/**
 * Extracts a human-readable error message from any error object
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const data = axiosError.response?.data;

    // 1. Try to get the direct message
    if (data?.message) return data.message;

    // 2. Try to get validation errors
    if (data?.errors) {
      if (Array.isArray(data.errors)) return data.errors[0];
      if (typeof data.errors === "object") {
        const firstErrorKey = Object.keys(data.errors)[0];
        return data.errors[firstErrorKey][0];
      }
    }

    // 3. Fallback for common HTTP codes
    if (axiosError.response?.status === 401) return "Session expired. Please login again.";
    if (axiosError.response?.status === 403) return "You don't have permission to do this.";
    if (axiosError.response?.status === 404) return "Requested resource not found.";
  }

  if (error instanceof Error) return error.message;

  return "An unexpected error occurred. Please try again.";
};

/**
 * Automatically displays a toast notification for any error
 */
export const handleError = (error: unknown): void => {
  const message = getErrorMessage(error);
  
  // Directly access the Zustand store state to show the toast
  useUIStore.getState().showToast(message, "error");
  
  // Also log to console for development debugging
  console.error("[Global Error Handler]:", error);
};