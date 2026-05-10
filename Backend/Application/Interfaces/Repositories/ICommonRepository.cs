using Domain.Entities;

namespace Application.Interfaces;

public interface ICommonRepository
{
    Task<string> GetRoleByIdAsync(int id);
    Task<UserRefreshToken?> GetRefreshTokenAsync(string token);
    Task RevokeRefreshTokenAsync(UserRefreshToken refreshToken);
    Task RevokeAllTokensForUserAsync(int id);
}