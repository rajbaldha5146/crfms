using API.Helpers;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/pm/hierarchy")]
[Authorize(Policy = "RequirePm")]
public class PmHierarchyController : ControllerBase
{
    private readonly IPmHierarchyService
        _pmHierarchyService;

    public PmHierarchyController(
        IPmHierarchyService pmHierarchyService)
    {
        _pmHierarchyService =
            pmHierarchyService;
    }

    [HttpGet]
    public async Task<ActionResult<
        ApiResponse<HierarchyNodeDto>>>
        GetHierarchy()
    {
        var pmUserId =
            UserClaimsHelper.GetUserId(User);

        var result =
            await _pmHierarchyService
                .GetHierarchyAsync(pmUserId);

        return Ok(
            ApiResponse<HierarchyNodeDto>
                .SuccessResponse(
                    result!,
                    "Hierarchy fetched successfully"));
    }

    [HttpPut("change-reporting-person")]
    public async Task<ActionResult<ApiResponse<object>>>
    ChangeReportingPerson(
        ChangeReportingPersonRequestDto request)
    {
        var pmUserId =
            UserClaimsHelper.GetUserId(User);

        await _pmHierarchyService
            .ChangeReportingPersonAsync(
                request,
                pmUserId);

        return Ok(
            ApiResponse<object>
                .SuccessResponse(
                    "Reporting person changed successfully"));
    }

    [HttpGet("users/{id}")]
    public async Task<ActionResult<
    ApiResponse<PmUserDetailsDto>>>
    GetUserDetails(int id)
    {
        var pmUserId =
            UserClaimsHelper
                .GetUserId(User);

        var result =
            await _pmHierarchyService
                .GetUserDetailsAsync(
                    id,
                    pmUserId);

        return Ok(
            ApiResponse<PmUserDetailsDto>
                .SuccessResponse(
                    result,
                    "User details fetched successfully"));
    }
}