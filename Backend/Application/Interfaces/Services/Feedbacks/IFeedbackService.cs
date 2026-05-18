using Application.DTOs;

namespace Application.Interfaces;

public interface IFeedbackService
{
    Task<CreateFeedbackResponseDto> CreateFeedbackAsync(CreateFeedbackRequestDto request, int reviewerUserId);

    Task<IEnumerable<ReviewableUserResponseDto>> GetReviewableUsersAsync(int projectId, string? search, int reviewerUserId);

    Task<ReceivedFeedbackResponseDto> GetMyReceivedFeedbacksAsync(int userId, ReceivedFeedbackFilterDto filter);

    Task<FeedbackDetailDto> GetFeedbackDetailsAsync(int feedbackId, int loggedInUserId);

    Task ResolveFeedbackAsync(int feedbackId, int loggedInUserId, ResolveFeedbackRequestDto request);

    Task<SubmittedFeedbackResponseDto> GetSubmittedFeedbacksAsync(int loggedInUserId, SubmittedFeedbackFilterDto filter);

    Task<FeedbackHierarchyResponseDto> GetHierarchyAsync(int loggedInUserId, FeedbackHierarchyFilterDto filter);
}
