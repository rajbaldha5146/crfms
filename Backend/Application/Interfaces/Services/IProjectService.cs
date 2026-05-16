using Application.DTOs;

namespace Application.Interfaces;

public interface IProjectService
{
    Task<IEnumerable<ProjectDropdownResponseDto>> GetMyProjectsAsync(int userId);
    Task<IEnumerable<ProjectCardDto>> GetMyProjectCardsAsync(int userId);

    Task<List<ProjectHierarchyNodeDto>> GetProjectHierarchyAsync(int projectId, int loggedInUserId);

    Task<UserProjectFeedbacksDto> GetUserProjectFeedbacksAsync(
        int projectId,
        int userId,
        string? status,
        int loggedInUserId);
}