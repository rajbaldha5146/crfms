namespace Application.DTOs;

public class UpdateUserResponseDto
{
    public int Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public DateTime ModifiedAt { get; set; }
}