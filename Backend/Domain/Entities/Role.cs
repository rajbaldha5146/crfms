using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Domain.Enums;

namespace Domain.Entities;

public class Role
{
    [Key]
    public int Id { get; set; }
    public RoleName RoleName { get; set; }
    public DateTime CreatedAt { get; set; }
    public int? CreatedBy { get; set; }
    public DateTime? ModifiedAt { get; set; }
    public int? ModifiedBy { get; set; }

    [ForeignKey("CreatedBy")]
    public virtual User? Creator { get; set; }

    [ForeignKey("ModifiedBy")]
    public virtual User? Modifier { get; set; }

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}