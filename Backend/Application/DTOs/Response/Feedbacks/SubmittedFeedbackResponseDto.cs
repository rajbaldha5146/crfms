namespace Application.DTOs;

public class SubmittedFeedbackResponseDto
{
    public List<SubmittedFeedbackCardDto> Items { get; set; } = new();

    public int OpenCount { get; set; }

    public int ResolvedCount { get; set; }

    public int TotalCount { get; set; }

    public List<DropdownDto> Projects { get; set; } = new();

    public List<DropdownDto> Reviewees { get; set; } = new();

    public int TotalPages { get; set; }

    public int CurrentPage { get; set; }
}
