namespace Domain.Exceptions;

public sealed class UnauthorizedException : BaseException
{
    public UnauthorizedException(string message)
        : base(
            message,
            401,
            "UNAUTHORIZED")
    {
    }
}