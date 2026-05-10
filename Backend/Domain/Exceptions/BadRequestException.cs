namespace Domain.Exceptions;

public sealed class BadRequestException : BaseException
{
    public BadRequestException(
        string message,
        List<string>? errors = null)
        : base(
            message,
            400,
            "BAD_REQUEST",
            errors)
    {
    }
}