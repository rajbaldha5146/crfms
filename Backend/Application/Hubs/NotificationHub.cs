using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Application.Hubs;

[Authorize]
public class NotificationHub
    : Hub
{
    // =========================
    // Connection
    // =========================

    public override async Task
        OnConnectedAsync()
    {
        // Current User

        var userId =
            Context.User?
                .FindFirst(
                    ClaimTypes.NameIdentifier)
                ?.Value;

        // Add Group

        if (!string.IsNullOrWhiteSpace(
            userId))
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                $"user-{userId}");
        }

        await base.OnConnectedAsync();

        Console.WriteLine("SignalR Connected");
        Console.WriteLine(Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value);
    }

    // =========================
    // Disconnect
    // =========================

    public override async Task
        OnDisconnectedAsync(
            Exception? exception)
    {
        // Current User

        var userId =
            Context.User?
                .FindFirst(
                    ClaimTypes.NameIdentifier)
                ?.Value;

        // Remove Group

        if (!string.IsNullOrWhiteSpace(
            userId))
        {
            await Groups.RemoveFromGroupAsync(
                Context.ConnectionId,
                $"user-{userId}");
        }

        await base.OnDisconnectedAsync(
            exception);
    }
}