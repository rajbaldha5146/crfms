export interface NotificationItemDto {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  feedbackId?: number | null;
  triggeredByName: string;
  createdAt: string;
}

export interface NotificationResponseDto {
  unreadCount: number;
  notifications: NotificationItemDto[];
}
