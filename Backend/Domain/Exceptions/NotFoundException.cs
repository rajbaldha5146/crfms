namespace Domain.Exceptions;

public sealed class NotFoundException : BaseException
{
    public NotFoundException(string message)
        : base(
            message,
            404,
            "NOT_FOUND")
    {
    }
}