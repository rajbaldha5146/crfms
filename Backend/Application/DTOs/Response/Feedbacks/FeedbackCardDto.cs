namespace Application.DTOs;

public class FeedbackCardDto
{
    public int Id { get; set; }

    public string ReviewerName { get; set; }
        = string.Empty;

    public string Title { get; set; }
        = string.Empty;

    public string Status { get; set; }
        = string.Empty;

    public DateTime CreatedAt { get; set; }

    public string? ResolutionMessage { get; set; }

    public DateTime?
        ResolutionCreatedAt
    { get; set; }
}