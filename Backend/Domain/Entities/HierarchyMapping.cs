using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities;

public class HierarchyMapping
{
    [Key]
    public int Id { get; set; }
    public int ParentUserId { get; set; }
    public int ChildUserId { get; set; }
    public DateTime CreatedAt { get; set; }

    [ForeignKey("ParentUserId")]
    public virtual User ParentUser { get; set; } = null!;

    [ForeignKey("ChildUserId")]
    public virtual User ChildUser { get; set; } = null!;
}
