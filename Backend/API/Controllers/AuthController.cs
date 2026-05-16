using API.Helpers;
using Application.DTOs;
using Application.Interfaces;
using Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IRefreshTokenService _refreshTokenService;
    private readonly IConfiguration _configuration;

    public AuthController(
        IAuthService authService,
        IRefreshTokenService refreshTokenService,
        IConfiguration configuration)
    {
        _authService = authService;
        _refreshTokenService = refreshTokenService;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LogInResponseDto>>> Login(
        [FromBody] LogInRequestDto request)
    {
        var result =
            await _authService.LoginAsync(request);

        CookieHelper.SetTokenCookies(
            Response,
            _configuration,
            result.AccessToken,
            result.RefreshToken);

        var response =
            ApiResponse<LogInResponseDto>
            .SuccessResponse(
                result,
                "Login successful");

        return Ok(response);
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult<
        ApiResponse<RefreshTokenResponseDto>>>
        RefreshToken()
    {
        var refreshToken =
            CookieHelper.GetRefreshToken(Request);

        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            throw new UnauthorizedException(
                "Refresh token missing");
        }

        var requestDto =
            new RefreshTokenRequestDto
            {
                RefreshToken = refreshToken
            };

        var result =
            await _refreshTokenService
                .RefreshTokenAsync(requestDto);

        CookieHelper.SetTokenCookies(
            Response,
            _configuration,
            result.AccessToken,
            result.RefreshToken);

        var response =
            ApiResponse<RefreshTokenResponseDto>
            .SuccessResponse(
                result,
                "Token refreshed successfully");

        return Ok(response);
    }

    [HttpPost("logout")]
    public async Task<ActionResult<ApiResponse<object>>> Logout()
    {
        var refreshToken = CookieHelper.GetRefreshToken(Request);

        if (!string.IsNullOrWhiteSpace(refreshToken))
        {
            var requestDto = new LogoutRequestDto { RefreshToken = refreshToken };
            await _refreshTokenService.LogoutAsync(requestDto);
        }

        CookieHelper.ClearTokenCookies(Response);
        return Ok(ApiResponse<object>.SuccessResponse("Logout successful"));

    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<UserResponseDto>>> GetMe()
    {
        // Extracts the user's email from the decrypted JWT token stored in the HttpOnly cookie
        var email = User.FindFirstValue(ClaimTypes.Email);

        if (string.IsNullOrEmpty(email))
        {
            throw new UnauthorizedException("User is not authenticated");
        }

        var result = await _authService.GetMeAsync(email);

        return Ok(ApiResponse<UserResponseDto>.SuccessResponse(result, "User retrieved successfully"));
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult>
    ChangePassword(
        ChangePasswordRequestDto request)
        {
            var userId =
                UserClaimsHelper
                    .GetUserId(User);

            await _authService
                .ChangePasswordAsync(
                    userId,
                    request);

            return Ok(
                ApiResponse<object>
                .SuccessResponse(
                    "Password changed successfully"));
        }

    [HttpGet("generate-hash")]
    public IActionResult GenerateHash()
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("Password@1234");

        return Ok(hash);
    }
}