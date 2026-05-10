namespace Domain.Exceptions;

public sealed class ConflictException : BaseException
{
    public ConflictException(string message)
        : base(
            message,
            409,
            "CONFLICT")
    {
    }
}