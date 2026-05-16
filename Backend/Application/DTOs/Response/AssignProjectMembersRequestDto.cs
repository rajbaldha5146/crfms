using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;

public class AssignProjectMembersRequestDto
{
    [Required]
    public List<int> UserIds { get; set; }
        = new();
}