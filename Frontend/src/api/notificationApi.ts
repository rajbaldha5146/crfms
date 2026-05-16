import type { NotificationResponseDto } from "../types/notification";

import axiosInstance from "../utils/axiosInstance";

interface ApiResponse<T> {
  success: boolean;

  message: string;

  data: T;
}

// =========================
// Get Notifications
// =========================

export const getNotifications = async () => {
  const response = await axiosInstance.get<
    ApiResponse<NotificationResponseDto>
  >("/notifications");

  return response.data;
};

// =========================
// Mark As Read
// =========================

export const markNotificationAsRead = async (notificationId: number) => {
  const response = await axiosInstance.post(
    `/notifications/${notificationId}/read`
  );

  return response.data;
};

// =========================
// Mark All As Read
// =========================

export const markAllNotificationsAsRead =
  async () => {
    const response =
      await axiosInstance.post(
        "/notifications/read-all"
      );

    return response.data;
  };