using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Data.Configurations;

public class HierarchyMappingConfiguration : IEntityTypeConfiguration<HierarchyMapping>
{
    public void Configure(EntityTypeBuilder<HierarchyMapping> builder)
    {
        builder.ToTable("hierarchy_mappings");
        builder.HasKey(hm => hm.Id);

        builder.HasOne(hm => hm.ParentUser)
               .WithMany(u => u.ParentMappings)
               .HasForeignKey(hm => hm.ParentUserId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(hm => hm.ChildUser)
               .WithMany(u => u.ChildMappings)
               .HasForeignKey(hm => hm.ChildUserId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
