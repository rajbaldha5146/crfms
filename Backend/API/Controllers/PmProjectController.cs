using API.Helpers;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/pm/projects")]
[Authorize(Policy = "RequirePm")]
public class PmProjectController : ControllerBase
{
    private readonly IPmProjectService
        _pmProjectService;

    public PmProjectController(
        IPmProjectService pmProjectService)
    {
        _pmProjectService =
            pmProjectService;
    }

    [HttpPost]
    public async Task<ActionResult<
        ApiResponse<
            CreateProjectResponseDto>>>
        CreateProject(
            CreateProjectRequestDto request)
    {
        var pmUserId =
            UserClaimsHelper
                .GetUserId(User);

        var result =
            await _pmProjectService
                .CreateProjectAsync(
                    request,
                    pmUserId);

        return StatusCode(
            201,
            ApiResponse<
                CreateProjectResponseDto>
                .SuccessResponse(
                    result,
                    "Project created successfully"));
    }

    [HttpPost("{projectId}/members")]
    public async Task<
ActionResult<
    ApiResponse<
        AssignProjectMembersResponseDto>>>
AssignProjectMembers(
    int projectId,
    AssignProjectMembersRequestDto request)
    {
        var pmUserId =
            UserClaimsHelper
                .GetUserId(User);

        var result =
            await _pmProjectService
                .AssignProjectMembersAsync(
                    projectId,
                    request,
                    pmUserId);

        return Ok(
            ApiResponse<
                AssignProjectMembersResponseDto>
            .SuccessResponse(
                result,
                "Project members assigned successfully"));
    }

    [HttpDelete("{projectId}/members/{userId}")]
    public async Task<IActionResult>
    RemoveMemberFromProject(
        int projectId,
        int userId)
    {
        var pmUserId =
            UserClaimsHelper
                .GetUserId(User);

        var result =
            await _pmProjectService
                .RemoveMemberFromProjectAsync(
                    projectId,
                    userId,
                    pmUserId);

        return Ok(
            ApiResponse<
                RemoveProjectMemberResponseDto>
                .SuccessResponse(
                    result,
                    "Member removed from project successfully"));
    }
}