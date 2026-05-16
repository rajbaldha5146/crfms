using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Data.Configurations;

public class UserConfiguration
    : IEntityTypeConfiguration<User>
{
       public void Configure(
           EntityTypeBuilder<User> builder)
       {
              builder.ToTable("users");

              builder.HasKey(u => u.Id);

              // =========================================
              // Basic Fields
              // =========================================

              builder.Property(u => u.FullName)
                     .IsRequired()
                     .HasMaxLength(150);

              builder.Property(u => u.Email)
                     .IsRequired()
                     .HasMaxLength(255);

              builder.HasIndex(u => u.Email)
                     .IsUnique();

              builder.Property(u => u.Password)
                     .IsRequired();

              builder.Property(u => u.Experience)
                     .HasMaxLength(50);

              builder.Property(u => u.MobileNumber)
                     .HasMaxLength(20);

              // =========================================
              // Enums
              // =========================================

              builder.Property(u => u.Department)
                     .HasConversion<string>();

              builder.Property(u => u.Gender)
                     .HasConversion<string>();

              builder.Property(u => u.Status)
                     .HasConversion<string>()
                     .HasMaxLength(50)
                     .HasDefaultValue(
                          UserStatus.Active);

              // =========================================
              // First Login
              // =========================================

              builder.Property(u => u.IsFirstLogin)
                     .HasDefaultValue(true);

              // // =========================================
              // // Hierarchy Assignment
              // // =========================================

              // builder.Property(u => u.IsHierarchyAssigned)
              //        .HasDefaultValue(false);

              // =========================================
              // Role Relation
              // =========================================

              builder.HasOne(u => u.Role)
                     .WithMany(r => r.Users)
                     .HasForeignKey(u => u.RoleId)
                     .OnDelete(DeleteBehavior.Restrict);

              // =========================================
              // PM Ownership Relation
              // =========================================

              builder.HasOne(u => u.PmUser)
                     .WithMany(u => u.ManagedUsers)
                     .HasForeignKey(u => u.PmUserId)
                     .OnDelete(DeleteBehavior.Restrict);

              // =========================================
              // Audit Fields
              // =========================================

              builder.Property(u => u.CreatedAt)
                     .HasDefaultValueSql(
                          "CURRENT_TIMESTAMP");

              builder.HasOne(u => u.Creator)
                     .WithMany()
                     .HasForeignKey(u => u.CreatedBy)
                     .OnDelete(DeleteBehavior.NoAction);

              builder.HasOne(u => u.Modifier)
                     .WithMany()
                     .HasForeignKey(u => u.ModifiedBy)
                     .OnDelete(DeleteBehavior.NoAction);
       }
}