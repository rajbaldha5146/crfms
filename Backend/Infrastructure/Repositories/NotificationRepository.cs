using Application.Interfaces;
using Data.Context;
using Domain.Entities;

namespace Infrastructure.Repositories;

public class NotificationRepository
    : GenericRepository<
        Notification>,
      INotificationRepository
{
    public NotificationRepository(
        AppDbContext
            context)
        : base(context)
    {
    }
}