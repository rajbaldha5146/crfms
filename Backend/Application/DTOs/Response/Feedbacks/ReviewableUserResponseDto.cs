namespace Application.DTOs;

public class ReviewableUserResponseDto
{
    public int Id { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string RoleName { get; set; } = string.Empty;
}