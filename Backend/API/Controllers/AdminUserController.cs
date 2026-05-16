using API.Helpers;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Policy = "RequireAdmin")]

public class AdminUserController : ControllerBase
{
    private readonly IAdminUserService _adminUserService;

    public AdminUserController(
        IAdminUserService adminUserService)
    {
        _adminUserService = adminUserService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser(
        CreateUserRequestDto request)
    {
        var loggedInUserId = UserClaimsHelper.GetUserId(User);

        // var loggedInUserId = 1;

        var result = await _adminUserService.CreateUserAsync(
            request,
            loggedInUserId);

        return StatusCode(201, ApiResponse<CreateUserResponseDto>
                .SuccessResponse(result, "User created successfully"));
    }
}