namespace Application.Interfaces;

public interface ITokenService
{
    string CreateToken(int id, string Role, string Email);
    string GenerateRefreshToken();
}