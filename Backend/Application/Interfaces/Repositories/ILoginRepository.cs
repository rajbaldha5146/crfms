using Domain.Entities;

namespace Application.Interfaces;

public interface ILoginRepository
{
    Task<User?> GetByEmailAsync(string email);
}
