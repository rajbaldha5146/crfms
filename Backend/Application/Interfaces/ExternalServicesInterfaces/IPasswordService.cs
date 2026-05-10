namespace Application.Interfaces;

public interface IPasswordService
{
    string GenerateHash(string password);
    bool VerifyPassword(string inputPassword, string storedHash);
}
