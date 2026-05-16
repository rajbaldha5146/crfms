using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;

public class ChangePasswordRequestDto
{
    [Required]
    public string
        CurrentPassword
    {
        get;
        set;
    } = string.Empty;

    [Required]
    [StringLength(
        15,
        MinimumLength = 8)]
    public string
        NewPassword
    {
        get;
        set;
    } = string.Empty;
}