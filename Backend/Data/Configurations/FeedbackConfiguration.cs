using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Data.Configurations;

public class FeedbackConfiguration : IEntityTypeConfiguration<Feedback>
{
    public void Configure(EntityTypeBuilder<Feedback> builder)
    {
        builder.ToTable("feedbacks");
        builder.HasKey(f => f.Id);

        builder.Property(f => f.Title).IsRequired().HasMaxLength(255);
        builder.Property(f => f.Description).HasColumnType("text");
        builder.Property(f => f.Status).HasConversion<string>().HasDefaultValue(FeedbackStatus.Open);
        builder.Property(f => f.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.HasOne(f => f.Project)
               .WithMany(p => p.Feedbacks)
               .HasForeignKey(f => f.ProjectId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(f => f.Reviewer)
               .WithMany()
               .HasForeignKey(f => f.ReviewerUserId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(f => f.Reviewee)
               .WithMany()
               .HasForeignKey(f => f.RevieweeUserId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}