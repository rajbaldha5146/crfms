using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;

public class ChangeReportingPersonRequestDto
{
    [Range(1, int.MaxValue)]
    public int ChildUserId { get; set; }

    [Range(1, int.MaxValue)]
    public int NewParentUserId { get; set; }
}