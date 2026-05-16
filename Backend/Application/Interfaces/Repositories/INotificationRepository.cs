using Domain.Entities;

namespace Application.Interfaces;

public interface INotificationRepository
    : IGenericRepository<
        Notification>
{
}