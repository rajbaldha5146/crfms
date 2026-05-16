using Application.DTOs;

namespace Application.Interfaces;

public interface IFeedbackService
{
    Task<CreateFeedbackResponseDto> CreateFeedbackAsync(CreateFeedbackRequestDto request, int reviewerUserId);

    Task<IEnumerable<ReviewableUserResponseDto>> GetReviewableUsersAsync(int projectId, string? search, int reviewerUserId);

    Task<IEnumerable<ReceivedFeedbackCardDto>> GetMyReceivedFeedbacksAsync(int userId,string? status);

    Task<FeedbackDetailDto> GetFeedbackDetailsAsync(int feedbackId, int loggedInUserId);

    Task ResolveFeedbackAsync(int feedbackId, int loggedInUserId, ResolveFeedbackRequestDto request);

    Task<IEnumerable<SubmittedFeedbackCardDto>> GetSubmittedFeedbacksAsync(int loggedInUserId,string? status);

    Task<IEnumerable<ReceivedFeedbackCardDto>> GetHierarchyFeedbacksAsync(int loggedInUserId, string? status, int? projectId);
}
