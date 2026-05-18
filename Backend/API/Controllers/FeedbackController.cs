using API.Helpers;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/feedback")]
[Authorize]
public class FeedbackController : ControllerBase
{
    private readonly IFeedbackService _feedbackService;

    public FeedbackController(
        IFeedbackService feedbackService)
    {
        _feedbackService = feedbackService;
    }

    [HttpGet("hierarchy")]
    public async Task<IActionResult> GetHierarchy(
        [FromQuery] FeedbackHierarchyFilterDto filter)
    {
        var userId = UserClaimsHelper.GetUserId(User);

        var result = await _feedbackService.GetHierarchyAsync(userId, filter);

        return Ok(
            ApiResponse<FeedbackHierarchyResponseDto>
            .SuccessResponse(
                result,
                "Hierarchy feedbacks fetched successfully"));
    }

    [HttpPost]
    public async Task<IActionResult> CreateFeedback(
        CreateFeedbackRequestDto request)
    {
        var reviewerUserId = UserClaimsHelper.GetUserId(User);
        // var reviewerUserId = 29;

        var result = await _feedbackService
            .CreateFeedbackAsync(
                request,
                reviewerUserId);

        return StatusCode(
            201,
            ApiResponse<CreateFeedbackResponseDto>
                .SuccessResponse(
                    result,
                    "Feedback submitted successfully"));
    }

    [HttpGet("reviewable-users")]
    public async Task<IActionResult>
    GetReviewableUsers(
        [FromQuery] int projectId,
        [FromQuery] string? search)
    {
        var reviewerUserId =
            UserClaimsHelper
                .GetUserId(User);

        var result =
            await _feedbackService
                .GetReviewableUsersAsync(
                    projectId,
                    search,
                    reviewerUserId);

        return Ok(
            ApiResponse<
                IEnumerable<
                    ReviewableUserResponseDto>>
            .SuccessResponse(
                result,
                "Reviewable users fetched successfully"));
    }

    [HttpGet("received")]
    public async Task<IActionResult> GetMyReceivedFeedbacks(
        [FromQuery] ReceivedFeedbackFilterDto filter)
    {
        var userId = UserClaimsHelper.GetUserId(User);

        var result = await _feedbackService.GetMyReceivedFeedbacksAsync(userId, filter);

        return Ok(
            ApiResponse<ReceivedFeedbackResponseDto>
            .SuccessResponse(
                result,
                "Received feedbacks fetched successfully"));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult>
    GetFeedbackDetails(int id)
    {
        var userId =
            UserClaimsHelper.GetUserId(User);

        // var userId = 31;

        var result =
            await _feedbackService
                .GetFeedbackDetailsAsync(
                    id,
                    userId);

        return Ok(
            ApiResponse<
                FeedbackDetailDto>
            .SuccessResponse(
                result,
                "Feedback details fetched successfully"));
    }

    [HttpPost("{id:int}/resolve")]
    public async Task<IActionResult>
    ResolveFeedback(
        int id,
        ResolveFeedbackRequestDto request)
    {
        var userId =
            UserClaimsHelper.GetUserId(User);

        // var userId = 31;

        await _feedbackService
            .ResolveFeedbackAsync(
                id,
                userId,
                request);

        return Ok(
            ApiResponse<object>
            .SuccessResponse(
                "Feedback resolved successfully"));
    }

    [HttpGet("submitted")]
    public async Task<IActionResult> GetSubmittedFeedbacks(
        [FromQuery] SubmittedFeedbackFilterDto filter)
    {
        var userId = UserClaimsHelper.GetUserId(User);

        var result = await _feedbackService.GetSubmittedFeedbacksAsync(userId, filter);

        return Ok(
            ApiResponse<SubmittedFeedbackResponseDto>
            .SuccessResponse(
                result,
                "Submitted feedbacks fetched successfully"));
    }
}