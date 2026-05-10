using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities;

public class FeedbackResolution
{
    [Key]
    public int Id { get; set; }
    public int FeedbackId { get; set; }
    public int ResolverUserId { get; set; }
    public string Message { get; set; } = null!;
    public DateTime CreatedAt { get; set; }

    [ForeignKey("FeedbackId")]
    public virtual Feedback Feedback { get; set; } = null!;

    [ForeignKey("ResolverUserId")]
    public virtual User Resolver { get; set; } = null!;
}
