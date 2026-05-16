namespace Domain.Exceptions;

public sealed class ForbiddenException : BaseException
{
    public ForbiddenException(string message) 
        : base(
            message, 
            403, 
            "FORBIDDEN")
    {
    }
}