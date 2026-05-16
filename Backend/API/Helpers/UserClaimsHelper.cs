using System.Security.Claims;
using Domain.Exceptions;

namespace API.Helpers;

public static class UserClaimsHelper
{
    public static int GetUserId(
        ClaimsPrincipal user)
    {
        var userIdClaim =
            user.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdClaim))
        {
            throw new UnauthorizedException(
                "Invalid or missing authentication token");
        }

        if (!int.TryParse(
            userIdClaim,
            out int userId))
        {
            throw new UnauthorizedException(
                "Invalid authentication token");
        }

        return userId;
    }

    public static string GetEmail(
        ClaimsPrincipal user)
    {
        var email =
            user.FindFirstValue(
                ClaimTypes.Email);

        if (string.IsNullOrWhiteSpace(email))
        {
            throw new UnauthorizedException(
                "Email claim not found");
        }

        return email;
    }

    public static string GetRole(
        ClaimsPrincipal user)
    {
        var role =
            user.FindFirstValue(
                ClaimTypes.Role);

        if (string.IsNullOrWhiteSpace(role))
        {
            throw new UnauthorizedException(
                "Role claim not found");
        }

        return role;
    }
}