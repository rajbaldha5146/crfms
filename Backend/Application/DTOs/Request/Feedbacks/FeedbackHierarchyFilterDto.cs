namespace Application.DTOs;

public class FeedbackHierarchyFilterDto
{
    public string? Status { get; set; }

    public int? ProjectId { get; set; }

    public int? ReviewerId { get; set; }

    public int? RevieweeId { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }
}
