namespace Application.DTOs;

public class CreateFeedbackResponseDto
{
    public int Id { get; set; }

    public int ProjectId { get; set; }

    public int ReviewerUserId { get; set; }

    public int RevieweeUserId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}
