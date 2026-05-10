using Application.Interfaces;
using Data.Context;
using Domain.Entities;
using Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class CommonRepository : ICommonRepository
{
    private readonly AppDbContext _context;

    public CommonRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<string> GetRoleByIdAsync(int id)
    {
        var roleName = await _context.Roles
            .Where(r => r.Id == id)
            .Select(r => r.RoleName.ToString())
            .FirstOrDefaultAsync();

        if (roleName == null)
        {
            throw new BadRequestException("Role not found");
        }

        return roleName;
    }

    public async Task<UserRefreshToken?> GetRefreshTokenAsync(string token)
    {
        return await _context.UserRefreshTokens
            .Include(x => x.User)
            .ThenInclude(u => u.Role)
            .FirstOrDefaultAsync(x => x.Token == token);
    }

    public async Task RevokeRefreshTokenAsync(UserRefreshToken refreshToken)
    {
        refreshToken.IsRevoked = true;
        refreshToken.RevokedAt = DateTime.UtcNow;

        _context.UserRefreshTokens.Update(refreshToken);

        await _context.SaveChangesAsync();
    }

    public async Task RevokeAllTokensForUserAsync(int id)
    {
        var tokens = await _context.UserRefreshTokens
            .Where(x =>
                x.UserId == id &&
                !x.IsRevoked)
            .ToListAsync();

        foreach (var token in tokens)
        {
            token.IsRevoked = true;
            token.RevokedAt = DateTime.UtcNow;
        }

        _context.UserRefreshTokens.UpdateRange(tokens);

        await _context.SaveChangesAsync();
    }
}
