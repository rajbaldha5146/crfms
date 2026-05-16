import { create } from "zustand";

import type { NotificationItemDto } from "../types/notification";

interface NotificationState {
  unreadCount: number;
  notifications: NotificationItemDto[];
  setNotifications: (notifications: NotificationItemDto[]) => void;
  setUnreadCount: (count: number) => void;
  markAsRead: (id: number) => void;
  addNotification: (notification: NotificationItemDto) => void;
  clearNotifications: () => void;
  removeNotification: (id: number) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  notifications: [],
  setNotifications: (notifications) =>
    set({
      notifications,
    }),
  setUnreadCount: (count) =>
    set({
      unreadCount: count,
    }),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((x) =>
        x.id === id
          ? {
              ...x,
              isRead: true,
            }
          : x
      ),

      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],

      unreadCount: state.unreadCount + 1,
    })),
  clearNotifications: () =>
    set({
      notifications: [],

      unreadCount: 0,
    }),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((x) => x.id !== id),

      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
}));
