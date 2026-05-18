using Application.DTOs;

namespace Application.Interfaces;

public interface IPmProjectService
{
    Task<CreateProjectResponseDto>
        CreateProjectAsync(
            CreateProjectRequestDto request,
            int pmUserId);

    Task<AssignProjectMembersResponseDto> AssignProjectMembersAsync(
        int projectId,
        AssignProjectMembersRequestDto request,
        int pmUserId);

    Task<RemoveProjectMemberResponseDto> RemoveMemberFromProjectAsync(
        int projectId,
        int userId,
        int pmUserId);
}