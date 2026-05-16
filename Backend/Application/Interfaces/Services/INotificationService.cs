using Application.DTOs;

namespace Application.Interfaces;

public interface INotificationService
{
    Task<NotificationResponseDto>
        GetNotificationsAsync(
            int userId);

    Task MarkAsReadAsync(
    int notificationId,
    int userId);

    Task SendRealtimeNotificationAsync(
    int userId,
    RealtimeNotificationDto dto);

    Task MarkAllAsReadAsync(
    int userId);
}