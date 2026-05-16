using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;

public class ResolveFeedbackRequestDto
{
    [Required(ErrorMessage =
        "Resolution message is required")]
    [StringLength(
        2000,
        MinimumLength = 5,
        ErrorMessage =
        "Message must be between 5 and 2000 characters")]
    public string Message { get; set; }
        = string.Empty;
}