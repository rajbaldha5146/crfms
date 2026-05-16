using Application.DTOs;

namespace Application.Interfaces;

public interface IAdminUserService
{
    Task<CreateUserResponseDto> CreateUserAsync(CreateUserRequestDto request, int loggedInUserId);
}