namespace Application.DTOs;

public class LogInResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    [System.Text.Json.Serialization.JsonIgnore]
    public string AccessToken { get; set; } = string.Empty;
    [System.Text.Json.Serialization.JsonIgnore]
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime AccessTokenExpiresAt { get; set; }
    public bool IsFirstLogin { get; set; }
}
