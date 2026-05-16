using Application.DTOs;

namespace Application.Interfaces;

public interface IPmHierarchyService
{
    Task<HierarchyNodeDto?> GetHierarchyAsync(
        int pmUserId);

    Task ChangeReportingPersonAsync(
        ChangeReportingPersonRequestDto request,
        int pmUserId);

    Task<PmUserDetailsDto> GetUserDetailsAsync(
        int userId,
        int pmUserId);
}