using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Data.Configurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("roles");
        builder.HasKey(r => r.Id);

        builder.Property(r => r.RoleName)
               .HasConversion<string>()
               .HasMaxLength(50)
               .IsRequired();

        builder.Property(r => r.CreatedAt)
               .HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.HasOne(r => r.Creator)
               .WithMany()
               .HasForeignKey(r => r.CreatedBy)
               .OnDelete(DeleteBehavior.NoAction);  

        builder.HasOne(r => r.Modifier)
               .WithMany()
               .HasForeignKey(r => r.ModifiedBy)
               .OnDelete(DeleteBehavior.NoAction);
    }
}