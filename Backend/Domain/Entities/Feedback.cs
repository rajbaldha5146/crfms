using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Domain.Enums;

namespace Domain.Entities;

public class Feedback
{
    [Key]
    public int Id { get; set; }

    public int ProjectId { get; set; }

    public int ReviewerUserId { get; set; }

    public int RevieweeUserId { get; set; }

    public string Title { get; set; } = null!;

    public string Description { get; set; } = null!;

    public FeedbackStatus Status { get; set; }
    
    public bool IsDeleted { get; set; }

    // =========================
    // Audit Fields
    // =========================

    public DateTime CreatedAt { get; set; }

    public int CreatedBy { get; set; }

    public DateTime? ModifiedAt { get; set; }

    public int? ModifiedBy { get; set; }

    // =========================
    // Navigation Properties
    // =========================

    [ForeignKey(nameof(ProjectId))]
    public virtual Project Project { get; set; } = null!;

    [ForeignKey(nameof(ReviewerUserId))]
    public virtual User Reviewer { get; set; } = null!;

    [ForeignKey(nameof(RevieweeUserId))]
    public virtual User Reviewee { get; set; } = null!;

    public virtual ICollection<FeedbackResolution>
        Resolutions { get; set; }
        = new List<FeedbackResolution>();
}