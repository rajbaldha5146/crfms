namespace API.Helpers;

public static class CookieHelper
{
    public static void SetTokenCookies(
        HttpResponse response,
        IConfiguration configuration,
        string accessToken,
        string refreshToken)
    {
        var accessTokenExpiryMinutes =
            double.Parse(
                configuration["TokenSettings:AccessTokenExpiryMinutes"]
                ?? "15");

        var refreshTokenExpiryDays =
            double.Parse(
                configuration["TokenSettings:RefreshTokenExpiryDays"]
                ?? "7");

        var accessTokenOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Lax,
            Expires = DateTime.UtcNow
                .AddMinutes(accessTokenExpiryMinutes)
        };

        var refreshTokenOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Lax,
            Expires = DateTime.UtcNow
                .AddDays(refreshTokenExpiryDays)
        };

        response.Cookies.Append(
            "accessToken",
            accessToken,
            accessTokenOptions);

        response.Cookies.Append(
            "refreshToken",
            refreshToken,
            refreshTokenOptions);
    }

    public static void ClearTokenCookies(
        HttpResponse response)
    {
        response.Cookies.Delete("accessToken");

        response.Cookies.Delete("refreshToken");
    }

    public static string? GetRefreshToken(
        HttpRequest request)
    {
        return request.Cookies["refreshToken"];
    }
}