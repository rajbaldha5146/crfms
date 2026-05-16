namespace Application.DTOs;

public class UpdateUserRequestDto
{
    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Experience { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public string Gender { get; set; } = string.Empty;

    public string MobileNumber { get; set; } = string.Empty;

    public int RoleId { get; set; }
}