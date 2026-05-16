using Application.DTOs;
using Application.Hubs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;
using Microsoft.AspNetCore.SignalR;

namespace Application.Services;

public class NotificationService
    : INotificationService
{
    private readonly
        INotificationRepository
        _notificationRepository;

    private readonly
    IGenericRepository<User>
    _userRepository;

    private readonly
    IHubContext<NotificationHub>
    _hubContext;

    public NotificationService(
        INotificationRepository
            notificationRepository,
        IGenericRepository<User>
    userRepository,
    IHubContext<NotificationHub>
    hubContext)
    {
        _notificationRepository =
            notificationRepository;

        _userRepository =
            userRepository;

        _hubContext =
            hubContext;
    }

    // =========================
    // Get Notifications
    // =========================

    public async Task<
        NotificationResponseDto>
        GetNotificationsAsync(
            int userId)
    {
        // Load Notifications

        var notifications =
            await _notificationRepository
                .FindAsync(x =>
                    x.UserId == userId
                    &&
                    !x.IsRead);
        // Order Latest First

        notifications =
            notifications
                .OrderByDescending(x =>
                    x.CreatedAt)
                .Take(20)
                .ToList();

        // Unread Count

        var unreadCount =
            notifications.Count(x =>
                !x.IsRead);

        // Triggered Users

        var triggeredUserIds =
            notifications
                .Select(x =>
                    x.TriggeredByUserId)
                .Distinct()
                .ToList();

        // Load Users

        var users =
            await _userRepository
                .FindAsync(x =>
                    triggeredUserIds
                        .Contains(x.Id));

        // Dictionary

        var userDictionary =
            users.ToDictionary(
                x => x.Id,
                x => x.FullName);

        // Response

        return new
            NotificationResponseDto
        {
            UnreadCount =
                unreadCount,

            Notifications =
                notifications
                    .Select(x =>
                        new NotificationItemDto
                        {
                            Id = x.Id,

                            Title =
                                x.Title,

                            Message =
                                x.Message,

                            Type =
                                x.Type
                                    .ToString(),

                            IsRead =
                                x.IsRead,

                            FeedbackId =
                                x.FeedbackId,

                            TriggeredByName =
                                userDictionary
                                    .ContainsKey(
                                        x.TriggeredByUserId)
                                    ? userDictionary[
                                        x.TriggeredByUserId]
                                    : string.Empty,

                            CreatedAt =
                                x.CreatedAt
                        })
                    .ToList()
        };
    }

    // =========================
    // Mark As Read
    // =========================

    public async Task
        MarkAsReadAsync(
            int notificationId,
            int userId)
    {
        // Load Notification

        var notification =
            await _notificationRepository
                .FirstOrDefaultAsync(x =>
                    x.Id ==
                        notificationId
                    &&
                    x.UserId ==
                        userId);

        // Validate

        if (notification == null)
        {
            throw new NotFoundException(
                "Notification not found");
        }

        // Already Read

        if (notification.IsRead)
        {
            return;
        }

        // Update

        notification.IsRead = true;

        // Save

        _notificationRepository
            .Update(notification);

        await _notificationRepository
            .SaveChangesAsync();
    }

    // =========================
    // Realtime Notification
    // =========================

    public async Task
        SendRealtimeNotificationAsync(
            int userId,
            RealtimeNotificationDto dto)
    {
        await _hubContext
            .Clients
            .Group($"user-{userId}")
            .SendAsync(
                "ReceiveNotification",
                dto);
    }

    // =========================
    // Mark All As Read
    // =========================

    public async Task
        MarkAllAsReadAsync(
            int userId)
    {
        // Load Notifications

        var notifications =
            await _notificationRepository
                .FindAsync(x =>
                    x.UserId ==
                        userId
                    &&
                    !x.IsRead);

        // No Data

        if (!notifications.Any())
        {
            return;
        }

        // Update

        foreach (var notification
            in notifications)
        {
            notification.IsRead = true;
        }

        // Save

        await _notificationRepository
            .SaveChangesAsync();
    }
}