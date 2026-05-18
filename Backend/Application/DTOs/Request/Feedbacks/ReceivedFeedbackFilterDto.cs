namespace Application.DTOs;

public class ReceivedFeedbackFilterDto
{
    public string? Status { get; set; }

    public int? ProjectId { get; set; }

    public int? ReviewerId { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public int Page { get; set; } = 1;

    public int PageSize { get; set; } = 10;
}
