import { create } from "zustand";
import type { ToastType } from "../components/common/Toast";

interface UIState {
  isLoading: boolean;
  toast: {
    msg: string;
    type: ToastType;
  } | null;
  loading: (state: boolean) => void;
  showToast: (msg: string, type?: ToastType) => void;
  clearToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  toast: null,

  loading: (state: boolean) => set({ isLoading: state }),

  showToast: (msg: string, type: ToastType = "info") =>
    set({
      toast: {
        msg,
        type,
      },
    }),

  clearToast: () => set({ toast: null }),
}));
