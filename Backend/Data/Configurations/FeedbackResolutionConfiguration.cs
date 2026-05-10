using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Data.Configurations;

public class FeedbackResolutionConfiguration : IEntityTypeConfiguration<FeedbackResolution>
{
    public void Configure(EntityTypeBuilder<FeedbackResolution> builder)
    {
        builder.ToTable("feedback_resolutions");
        builder.HasKey(fr => fr.Id);

        builder.Property(fr => fr.Message).IsRequired().HasColumnType("text");
        builder.Property(fr => fr.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

        builder.HasOne(fr => fr.Feedback)
               .WithMany(f => f.Resolutions)
               .HasForeignKey(fr => fr.FeedbackId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(fr => fr.Resolver)
               .WithMany()
               .HasForeignKey(fr => fr.ResolverUserId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}