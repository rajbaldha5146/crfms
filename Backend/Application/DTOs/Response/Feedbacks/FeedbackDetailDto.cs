namespace Application.DTOs;

public class FeedbackDetailDto
{
    public int Id { get; set; }

    public int ProjectId { get; set; }

    public string ProjectName { get; set; }
        = string.Empty;

    public int ReviewerUserId { get; set; }

    public string ReviewerName { get; set; }
        = string.Empty;

    public string ReviewerRole { get; set; }
        = string.Empty;

    public int RevieweeUserId { get; set; }

    public string RevieweeName { get; set; }
        = string.Empty;

    public string Title { get; set; }
        = string.Empty;

    public string Description { get; set; }
        = string.Empty;

    public string Status { get; set; }
        = string.Empty;

    public string? ResolutionMessage { get; set; }

    public DateTime? ResolutionCreatedAt { get; set; }

    public int? ResolverUserId { get; set; }

    public string? ResolverName { get; set; }

    public DateTime CreatedAt { get; set; }
}