using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Data.Configurations;

public class ProjectAssignmentConfiguration : IEntityTypeConfiguration<ProjectAssignment>
{
    public void Configure(EntityTypeBuilder<ProjectAssignment> builder)
    {
        builder.ToTable("project_assignments");
        builder.HasKey(pa => pa.Id);

        builder.Property(pa => pa.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.HasOne(pa => pa.Project)
               .WithMany(p => p.ProjectAssignments)
               .HasForeignKey(pa => pa.ProjectId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pa => pa.User)
               .WithMany(u => u.ProjectAssignments)
               .HasForeignKey(pa => pa.UserId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}