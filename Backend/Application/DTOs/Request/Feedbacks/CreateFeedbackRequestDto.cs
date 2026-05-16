using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;

public class CreateFeedbackRequestDto
{
    [Range(1, int.MaxValue,
        ErrorMessage = "Project is required")]
    public int ProjectId { get; set; }

    [Range(1, int.MaxValue,
        ErrorMessage = "Reviewee is required")]
    public int RevieweeUserId { get; set; }

    [Required(ErrorMessage = "Title is required")]
    [StringLength(
        150,
        MinimumLength = 3,
        ErrorMessage =
        "Title must be between 3 and 150 characters")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Description is required")]
    [StringLength(
        2000,
        MinimumLength = 10,
        ErrorMessage =
        "Description must be between 10 and 2000 characters")]
    public string Description { get; set; } = string.Empty;
}