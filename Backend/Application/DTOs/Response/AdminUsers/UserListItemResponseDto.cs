namespace Application.DTOs;

public class UserListItemResponseDto
{
    public int Id { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Experience { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public string Gender { get; set; } = string.Empty;

    public string MobileNumber { get; set; } = string.Empty;

    public string RoleName { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}
