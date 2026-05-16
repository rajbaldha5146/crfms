using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Domain.Enums;

namespace Domain.Entities;

public class Notification
{
    [Key]
    public int Id { get; set; }

    public int UserId { get; set; }

    public int TriggeredByUserId { get; set; }

    public string Title { get; set; } = null!;

    public string Message { get; set; } = null!;

    public NotificationType Type { get; set; }

    public bool IsRead { get; set; }

    public int? FeedbackId { get; set; }

    public DateTime CreatedAt { get; set; }

    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;

    [ForeignKey("TriggeredByUserId")]
    public virtual User TriggeredByUser { get; set; } = null!;

    [ForeignKey("FeedbackId")]
    public virtual Feedback? Feedback { get; set; }
}