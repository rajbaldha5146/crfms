using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;

public class CreateProjectRequestDto
{
    [Required]
    [StringLength(150)]
    public string Name { get; set; }
        = string.Empty;

    [Required]
    [StringLength(1000)]
    public string Description { get; set; }
        = string.Empty;
}