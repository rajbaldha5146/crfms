using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationController
    : ControllerBase
{
    private readonly
        INotificationService
        _notificationService;

    public NotificationController(
        INotificationService
            notificationService)
    {
        _notificationService =
            notificationService;
    }

    // =========================
    // Get Notifications
    // =========================

    [HttpGet]
    public async Task<IActionResult>
        GetNotifications()
    {
        // Current User

        var userId =
            int.Parse(
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier)!);

        // Load Notifications

        var result =
            await _notificationService
                .GetNotificationsAsync(
                    userId);

        // Response

        return Ok(
            ApiResponse<
                NotificationResponseDto>
            .SuccessResponse(
                result,
                "Notifications fetched successfully"));
    }

    // =========================
    // Mark As Read
    // =========================

    [HttpPost("{id}/read")]
    public async Task<IActionResult>
        MarkAsRead(
            int id)
    {
        // Current User

        var userId =
            int.Parse(
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier)!);

        // Update

        await _notificationService
            .MarkAsReadAsync(
                id,
                userId);

        // Response

        return Ok(
            ApiResponse<string>
            .SuccessResponse(
                "Notification marked as read"));
    }

    // =========================
    // Mark All As Read
    // =========================

    [HttpPost("read-all")]
    public async Task<IActionResult>
        MarkAllAsRead()
    {
        // Current User

        var userId =
            int.Parse(
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier)!);

        // Update

        await _notificationService
            .MarkAllAsReadAsync(
                userId);

        // Response

        return Ok(
            ApiResponse<string>
            .SuccessResponse(
                "All notifications marked as read"));
    }
}