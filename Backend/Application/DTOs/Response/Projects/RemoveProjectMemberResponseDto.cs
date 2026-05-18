namespace Application.DTOs;

public class RemoveProjectMemberResponseDto
{
    public List<string> Warnings { get; set; }
        = new();
}
