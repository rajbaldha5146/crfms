using Application.Interfaces;
using BC = BCrypt.Net.BCrypt;

namespace Infrastructure.ExternalServices;

public class PasswordService : IPasswordService
{
    private const int WorkFactor = 12;

    public string GenerateHash(string password)
    {
        return BC.HashPassword(password, WorkFactor);
    }

    public bool VerifyPassword(string inputPassword, string storedHash)
    {
        return BC.Verify(inputPassword, storedHash);
    }
}