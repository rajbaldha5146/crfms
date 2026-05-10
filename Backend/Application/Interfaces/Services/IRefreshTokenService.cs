using Application.DTOs;

namespace Application.Interfaces;

public interface IRefreshTokenService
{
    Task<RefreshTokenResponseDto> RefreshTokenAsync(
        RefreshTokenRequestDto request);

    Task LogoutAsync(
        LogoutRequestDto request);
}