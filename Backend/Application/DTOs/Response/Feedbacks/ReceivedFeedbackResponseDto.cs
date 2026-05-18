namespace Application.DTOs;

public class ReceivedFeedbackResponseDto
{
    public List<ReceivedFeedbackCardDto> Items { get; set; } = new();

    public int OpenCount { get; set; }

    public int ResolvedCount { get; set; }

    public int TotalCount { get; set; }

    public List<DropdownDto> Projects { get; set; } = new();

    public List<DropdownDto> Reviewers { get; set; } = new();

    public int TotalPages { get; set; }

    public int CurrentPage { get; set; }
}
