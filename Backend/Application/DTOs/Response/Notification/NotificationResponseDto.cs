namespace Application.DTOs;

public class NotificationResponseDto
{
    public int UnreadCount { get; set; }

    public List<NotificationItemDto>
        Notifications { get; set; }
        = [];
}