using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;

public class CreateUserRequestDto
{
    [Required(ErrorMessage = "Full name is required")]
    [StringLength(
        100,
        MinimumLength = 3,
        ErrorMessage =
        "Full name must be between 3 and 100 characters")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required")]
    [RegularExpression(
        @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
        ErrorMessage = "Enter valid email")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Experience is required")]
    [StringLength(
        50,
        ErrorMessage =
        "Experience cannot exceed 50 characters")]
    public string Experience { get; set; } = string.Empty;

    [Required(ErrorMessage = "Department is required")]
    public string Department { get; set; } = string.Empty;

    [Required(ErrorMessage = "Gender is required")]
    public string Gender { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mobile number is required")]
    [RegularExpression(
        @"^[0-9]{10}$",
        ErrorMessage =
        "Mobile number must be exactly 10 digits")]
    public string MobileNumber { get; set; } = string.Empty;

    [Range(
        1,
        int.MaxValue,
        ErrorMessage = "Role is required")]
    public int RoleId { get; set; }

    // PM Ownership

    public int? PmUserId { get; set; }
}