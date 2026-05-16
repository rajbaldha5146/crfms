import { create } from "zustand";

export interface RealtimeNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  feedbackId?: number;
  createdAt: string;
}

interface RealtimeNotificationState {
  notifications: RealtimeNotification[];
  addNotification: (notification: RealtimeNotification) => void;
  removeNotification: (id: number) => void;
}

export const useRealtimeNotificationStore = create<RealtimeNotificationState>(
  (set) => ({
    notifications: [],

    addNotification: (notification) =>
      set((state) => ({
        notifications: [notification, ...state.notifications].slice(0, 5),
      })),

    removeNotification: (id) =>
      set((state) => ({
        notifications: state.notifications.filter((x) => x.id !== id),
      })),
  })
);
