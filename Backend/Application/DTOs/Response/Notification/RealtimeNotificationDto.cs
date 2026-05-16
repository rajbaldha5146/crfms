namespace Application.DTOs;

public class RealtimeNotificationDto
{
    public int Id { get; set; }

    public string Title { get; set; }
        = string.Empty;

    public string Message { get; set; }
        = string.Empty;

    public string Type { get; set; }
        = string.Empty;

    public bool IsRead { get; set; }

    public int? FeedbackId { get; set; }

    public string TriggeredByName { get; set; }
        = string.Empty;

    public DateTime CreatedAt { get; set; }
}