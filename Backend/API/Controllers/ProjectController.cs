using API.Helpers;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/projects")]
[Authorize]
public class ProjectController : ControllerBase
{
    private readonly IProjectService
        _projectService;

    public ProjectController(
        IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet("my-projects")]
    public async Task<IActionResult>
        GetMyProjects()
    {
        var userId =
            UserClaimsHelper.GetUserId(User);

        // var userId = 28;

        var result =
            await _projectService
                .GetMyProjectsAsync(userId);

        return Ok(
            ApiResponse<
                IEnumerable<ProjectDropdownResponseDto>>
            .SuccessResponse(
                result,
                "Projects fetched successfully"));
    }

    [HttpGet("my-project-cards")]
    public async Task<IActionResult>
    GetMyProjectCards()
    {
        var userId =
            UserClaimsHelper
                .GetUserId(User);

        // var userId = 27;

        var result =
            await _projectService
                .GetMyProjectCardsAsync(
                    userId);

        return Ok(
            ApiResponse<
                IEnumerable<ProjectCardDto>>
            .SuccessResponse(
                result,
                "Project cards fetched successfully"));
    }

    [HttpGet("{projectId}/hierarchy")]
    public async Task<IActionResult>
    GetProjectHierarchy(
        int projectId)
    {
        var userId =
            UserClaimsHelper
                .GetUserId(User);

        var result =
            await _projectService
                .GetProjectHierarchyAsync(
                    projectId,
                    userId);

        return Ok(
            ApiResponse<
                List<ProjectHierarchyNodeDto>>
            .SuccessResponse(
                result,
                "Project hierarchy fetched successfully"));
    }

    [HttpGet(
        "{projectId}/users/{userId}/feedbacks")]
    public async Task<IActionResult>
        GetUserProjectFeedbacks(
            int projectId,
            int userId,
            string? status)
    {
        var loggedInUserId =
            UserClaimsHelper
                .GetUserId(User);

        var result =
            await _projectService
                .GetUserProjectFeedbacksAsync(
                    projectId,
                    userId,
                    status,
                    loggedInUserId);

        return Ok(
            ApiResponse<
                UserProjectFeedbacksDto>
            .SuccessResponse(
                result,
                "User feedbacks fetched successfully"));
    }
}