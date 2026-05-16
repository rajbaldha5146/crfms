namespace Application.DTOs;

public class ProjectHierarchyNodeDto
{
    public int UserId { get; set; }

    public string FullName { get; set; }
        = string.Empty;

    public string RoleName { get; set; }
        = string.Empty;

    public int OpenFeedbackCount { get; set; }

    public int ResolvedFeedbackCount { get; set; }

    public int? ReportingPersonId { get; set; }

    public string? ReportingPersonName { get; set; }

    public List<ProjectHierarchyNodeDto>
        Children
    { get; set; }
        = new();
}