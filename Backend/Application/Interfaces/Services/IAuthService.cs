using Application.DTOs;

namespace Application.Interfaces;

public interface IAuthService
{
    Task<LogInResponseDto> LoginAsync(LogInRequestDto request);
    Task<UserResponseDto> GetMeAsync(string email);
    Task ChangePasswordAsync(int userId,ChangePasswordRequestDto request);
}
