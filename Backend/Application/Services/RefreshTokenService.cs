using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Services;

public class RefreshTokenService : IRefreshTokenService
{
    private readonly ICommonRepository _repository;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _configuration;
    private readonly IGenericRepository<UserRefreshToken> _refreshTokenRepository;

    public RefreshTokenService(
        ICommonRepository repository,
        ITokenService tokenService,
        IConfiguration configuration,
        IGenericRepository<UserRefreshToken> refreshTokenRepository)
    {
        _repository = repository;
        _tokenService = tokenService;
        _configuration = configuration;
        _refreshTokenRepository = refreshTokenRepository;
    }

    public async Task<RefreshTokenResponseDto> RefreshTokenAsync(
        RefreshTokenRequestDto request)
    {
        var existingToken =
            await _repository.GetRefreshTokenAsync(
                request.RefreshToken);

        if (existingToken == null)
        {
            throw new UnauthorizedException(
                "Invalid refresh token");
        }

        if (existingToken.IsRevoked)
        {
            throw new UnauthorizedException(
                "Refresh token revoked");
        }

        if (existingToken.ExpiresAt < DateTime.UtcNow)
        {
            throw new UnauthorizedException(
                "Refresh token expired");
        }

        var user = existingToken.User;

        var accessTokenExpirationMinutes =
            double.Parse(
                _configuration["AccessTokenExpirationMinutes"]
                ?? "15");

        var role = user.Role.RoleName.ToString();

        var newAccessToken =
            _tokenService.CreateToken(
                user.Id,
                role,
                user.Email);

        var accessTokenExpiry =
            DateTime.UtcNow.AddMinutes(
                accessTokenExpirationMinutes);

        var newRefreshToken =
            _tokenService.GenerateRefreshToken();

        // existingToken.IsRevoked = true;
        // existingToken.RevokedAt = DateTime.UtcNow;
        existingToken.ReplacedByToken = newRefreshToken;

        await _repository.RevokeRefreshTokenAsync(existingToken);


        var refreshExpiryDays =
            double.Parse(
                _configuration["TokenSettings:RefreshTokenExpiryDays"]
                ?? "7");

        var newRefreshTokenEntity =
            new UserRefreshToken
            {
                UserId = user.Id,
                Token = newRefreshToken,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(refreshExpiryDays),
                IsRevoked = false
            };

        await _refreshTokenRepository.AddAsync(
            newRefreshTokenEntity);

        await _refreshTokenRepository.SaveChangesAsync();

        return new RefreshTokenResponseDto
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            AccessTokenExpiresAt = accessTokenExpiry
        };
    }

    public async Task LogoutAsync(
    LogoutRequestDto request)
    {
        var existingToken =
            await _repository.GetRefreshTokenAsync(
                request.RefreshToken);

        if (existingToken == null)
        {
            throw new UnauthorizedException(
                "Invalid refresh token");
        }

        if (existingToken.IsRevoked)
        {
            throw new UnauthorizedException(
                "Refresh token already revoked");
        }

        if (existingToken.ExpiresAt < DateTime.UtcNow)
        {
            throw new UnauthorizedException(
                "Refresh token expired");
        }

        await _repository
            .RevokeAllTokensForUserAsync(
                existingToken.UserId);
    }
}