using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Exceptions;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ILoginRepository _loginRepository;
    private readonly IPasswordService _passwordService;
    private readonly IConfiguration _configuration;
    private readonly ITokenService _tokenService;
    private readonly ICommonRepository _commonRepository;
    private readonly IGenericRepository<UserRefreshToken> _refreshTokenRepository;
    private readonly IGenericRepository<User> _userRepository;

    public AuthService(
        ILoginRepository loginRepository,
        IPasswordService passwordService,
        IConfiguration configuration,
        ICommonRepository commonRepository,
        ITokenService tokenService,
        IGenericRepository<UserRefreshToken> refreshTokenRepository,
        IGenericRepository<User> userRepository)
    {
        _loginRepository = loginRepository;
        _passwordService = passwordService;
        _configuration = configuration;
        _commonRepository = commonRepository;
        _tokenService = tokenService;
        _refreshTokenRepository = refreshTokenRepository;
        _userRepository = userRepository;
    }

    public async Task<LogInResponseDto> LoginAsync(LogInRequestDto request)
    {
        var user = await _loginRepository.GetByEmailAsync(request.Email);

        if (user == null)
        {
            throw new BadRequestException(
                "Invalid email or password",
                new List<string>
                {
                    "Email or password is Invalid"
                }
            );
        }

        bool isPasswordValid = _passwordService.VerifyPassword(
            request.Password,
            user.Password);

        if (!isPasswordValid)
        {
            throw new BadRequestException(
                "Invalid email or password",
                new List<string>
                {
                    "Email or password is incorrect"
                }
            );
        }

        var AccessTokenExpirationMinutes = double.Parse(_configuration["jwtSettings:ExpiryMinutes"] ?? "15");
        var role = await _commonRepository.GetRoleByIdAsync(user.RoleId);
        var accessToken = _tokenService.CreateToken(user.Id, role, user.Email);
        var accessTokenExpiry = DateTime.UtcNow.AddMinutes(AccessTokenExpirationMinutes);

        var refreshExpiryDays = double.Parse(_configuration["TokenSettings:RefreshTokenExpiryDays"] ?? "7");
        var refreshToken = _tokenService.GenerateRefreshToken();

        var refreshTokenEntity = new UserRefreshToken
        {
            UserId = user.Id,
            Token = refreshToken,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(refreshExpiryDays),
            IsRevoked = false
        };

        await _refreshTokenRepository.AddAsync(refreshTokenEntity);

        await _refreshTokenRepository.SaveChangesAsync();

        return new LogInResponseDto
        {
            Id = user.Id,
            Name = user.FullName,
            Email = user.Email,
            Role = role,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiresAt = accessTokenExpiry,
            IsFirstLogin = user.IsFirstLogin,
        };
    }

    public async Task<UserResponseDto> GetMeAsync(string email)
    {
        var user = await _loginRepository.GetByEmailAsync(email);

        if (user == null)
        {
            throw new NotFoundException("User not found");
        }

        var role = await _commonRepository.GetRoleByIdAsync(user.RoleId);

        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.FullName,
            Email = user.Email,
            Role = role,
            IsFirstLogin = user.IsFirstLogin,
        };
    }

    public async Task
    ChangePasswordAsync(
        int userId,
        ChangePasswordRequestDto request)
    {
        // User

        var user =
            await _userRepository
                .GetByIdAsync(
                    userId);

        if (!user.IsFirstLogin)
        {
            throw new BadRequestException(
                "User Pass Change Already."
            );
        }

        if (user == null)
        {
            throw new NotFoundException(
                "User not found");
        }

        // Validate current password

        var isPasswordValid =
            _passwordService
                .VerifyPassword(
                    request.CurrentPassword,
                    user.Password);

        if (!isPasswordValid)
        {
            throw new BadRequestException(
                "Current password is incorrect");
        }

        // Prevent same password

        var isSamePassword =
            _passwordService
                .VerifyPassword(
                    request.NewPassword,
                    user.Password);

        if (isSamePassword)
        {
            throw new BadRequestException(
                "New password cannot be same as current password");
        }

        // Update password

        user.Password =
            _passwordService
                .GenerateHash(
                    request.NewPassword);

        user.IsFirstLogin =
            false;

        user.ModifiedAt =
            DateTime.UtcNow;

        user.ModifiedBy =
            userId;

        // Save

        _userRepository
            .Update(user);

        await _userRepository
            .SaveChangesAsync();
    }
}