namespace Application.DTOs;

public class PmUserDetailsDto
{
    public int UserId { get; set; }

    public string FullName { get; set; }
        = string.Empty;

    public string Email { get; set; }
        = string.Empty;

    public string Role { get; set; }
        = string.Empty;

    public string Department { get; set; }
        = string.Empty;

    public string Experience { get; set; }
        = string.Empty;

    public string MobileNumber { get; set; }
        = string.Empty;

    public string Status { get; set; }
        = string.Empty;

    public int? ReportingPersonId { get; set; }

    public string? ReportingPersonName { get; set; }
}