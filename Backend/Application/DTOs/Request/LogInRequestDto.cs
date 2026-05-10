using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;

public class LogInRequestDto
{
    [Required(ErrorMessage = "Email is required")]
    [RegularExpression(
        @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
        ErrorMessage =
        "Enter Valid Email")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]

    [StringLength(15,
        MinimumLength = 8,
        ErrorMessage = "Password must be 8-15 characters long")]

    [RegularExpression(
        @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,15}$",
        ErrorMessage =
        "Password must contain 8–15 characters, including uppercase, lowercase, number and special character")]
    public string Password { get; set; } = string.Empty;
}
