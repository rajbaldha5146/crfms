namespace Application.DTOs;

public class CreateUserResponseDto
{
    public int Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}
