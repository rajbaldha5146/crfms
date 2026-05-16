namespace Application.DTOs;

public class UserSummaryDto
{
    public int Id { get; set; }

    public string FullName { get; set; }
        = string.Empty;

    public string RoleName { get; set; }
        = string.Empty;

    public int OpenFeedbackCount { get; set; }

    public int ResolvedFeedbackCount { get; set; }
}