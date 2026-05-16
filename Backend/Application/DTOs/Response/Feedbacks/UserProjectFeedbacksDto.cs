namespace Application.DTOs;

public class UserProjectFeedbacksDto
{
    public UserSummaryDto User { get; set; }
        = null!;

    public List<FeedbackCardDto>
    Feedbacks { get; set; }
    = new();
}