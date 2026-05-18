namespace Application.DTOs;

public class FeedbackHierarchyResponseDto
{
    public List<ReceivedFeedbackCardDto> Feedbacks { get; set; } = new();

    public int OpenCount { get; set; }

    public int ResolvedCount { get; set; }

    public int TotalCount { get; set; }
}
