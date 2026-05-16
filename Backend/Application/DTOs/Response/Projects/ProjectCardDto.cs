namespace Application.DTOs;

public class ProjectCardDto
{
    public int Id { get; set; }

    public string Name { get; set; }
        = string.Empty;

    public string Description { get; set; }
        = string.Empty;

    public string Status { get; set; }
        = string.Empty;

    public int TotalMembers { get; set; }

    public int OpenFeedbackCount { get; set; }

    public int ResolvedFeedbackCount { get; set; }

    public DateTime? LastFeedbackAt { get; set; }
}