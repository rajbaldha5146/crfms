using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Domain.Enums;

namespace Domain.Entities;

public class User
{
    [Key]
    public int Id { get; set; }

    public string FullName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string Experience { get; set; } = null!;

    public Department Department { get; set; }

    public Gender Gender { get; set; }

    public string MobileNumber { get; set; } = string.Empty;

    public UserStatus Status { get; set; }

    // =========================================
    // Role
    // =========================================

    public int RoleId { get; set; }

    // =========================================
    // PM Ownership
    // =========================================

    public int? PmUserId { get; set; }

    // =========================================
    // First Login Flow
    // =========================================

    public bool IsFirstLogin { get; set; }

    // =========================================
    // Audit
    // =========================================

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? ModifiedAt { get; set; }

    public int? ModifiedBy { get; set; }

    // =========================================
    // Navigation Properties
    // =========================================

    [ForeignKey("RoleId")]
    public virtual Role Role { get; set; } = null!;

    [ForeignKey("PmUserId")]
    public virtual User? PmUser { get; set; }

    [ForeignKey("CreatedBy")]
    public virtual User Creator { get; set; } = null!;

    [ForeignKey("ModifiedBy")]
    public virtual User Modifier { get; set; } = null!;

    public virtual ICollection<UserRefreshToken>
        RefreshTokens
    {
        get;
        set;
    } =
        new List<UserRefreshToken>();

    public virtual ICollection<ProjectAssignment>
        ProjectAssignments
    {
        get;
        set;
    } =
        new List<ProjectAssignment>();

    public virtual ICollection<HierarchyMapping>
        ParentMappings
    {
        get;
        set;
    } =
        new List<HierarchyMapping>();

    public virtual ICollection<HierarchyMapping>
        ChildMappings
    {
        get;
        set;
    } =
        new List<HierarchyMapping>();

    // Users managed by this PM

    public virtual ICollection<User>
        ManagedUsers
    {
        get;
        set;
    } =
        new List<User>();
}