namespace Application.DTOs;

public class ReceivedFeedbackCardDto
{
    public int Id { get; set; }

    public string ProjectName { get; set; }
        = string.Empty;

    public string ReviewerName { get; set; }
        = string.Empty;

    public string ReviewerRole { get; set; }
        = string.Empty;

    public string RevieweeName { get; set; }
        = string.Empty;

    public string Title { get; set; }
        = string.Empty;

    public string Status { get; set; }
        = string.Empty;

    public string? ResolutionMessage { get; set; }

    public DateTime? ResolutionCreatedAt { get; set; }

    public DateTime CreatedAt { get; set; }
}