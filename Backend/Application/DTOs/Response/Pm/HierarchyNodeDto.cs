namespace Application.DTOs;

public class HierarchyNodeDto
{
    public int UserId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;
    
    public int? ReportingPersonId { get; set; }

    public string? ReportingPersonName { get; set; }

    public List<HierarchyNodeDto> Children { get; set; } = new();
}