using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/admin/lookups")]
[Authorize(Policy = "RequireAdmin")]
public class AdminLookupController : ControllerBase
{
    private readonly IAdminLookupService _adminLookupService;

    public AdminLookupController(IAdminLookupService adminLookupService)
    {
        _adminLookupService = adminLookupService;
    }

    [HttpGet("roles")]
    public async Task<ActionResult<ApiResponse<IEnumerable<object>>>> GetRolesDropdown()
    {
        var result = await _adminLookupService.GetRolesDropdownAsync();

        return Ok(ApiResponse<IEnumerable<object>>.SuccessResponse(
            result,
            "Roles fetched successfully"));
    }

    [HttpGet("departments")]
    public async Task<ActionResult<ApiResponse<IEnumerable<object>>>> GetDepartmentsDropdown()
    {
        var result = await _adminLookupService.GetDepartmentsDropdownAsync();

        return Ok(ApiResponse<IEnumerable<object>>.SuccessResponse(
            result,
            "Departments fetched successfully"));
    }

    [HttpGet("genders")]
    public async Task<ActionResult<ApiResponse<IEnumerable<object>>>> GetGendersDropdown()
    {
        var result = await _adminLookupService.GetGendersDropdownAsync();

        return Ok(ApiResponse<IEnumerable<object>>.SuccessResponse(
            result,
            "Genders fetched successfully"));
    }

    [HttpGet("pm-users")]
    public async Task<
    ActionResult<
     ApiResponse<
         IEnumerable<DropdownDto>>>>
    GetPmUsersDropdown(
        [FromQuery]
        string? search,

        [FromQuery]
        string? department,

        [FromQuery]
        bool isAdmin = false)
        {
            var result =
                await _adminLookupService
                    .GetPmUsersDropdownAsync(
                        search,
                        department,
                        isAdmin);

            return Ok(
                ApiResponse<
                    IEnumerable<DropdownDto>>
                .SuccessResponse(
                    result,

                    result.Any()
                        ? "PM users fetched successfully"
                        : "No users found"));
        }
}