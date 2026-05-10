using System.Net;
using System.Text.Json;
using Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace API.Middlewares;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(
        RequestDelegate next,
        ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "An exception occurred: {Message}",
                exception.Message);

            await HandleExceptionAsync(context, exception);
        }
    }

    private static async Task HandleExceptionAsync(
        HttpContext context,
        Exception exception)
    {
        context.Response.ContentType = "application/json";

        int statusCode;
        string message;
        string errorCode;
        List<string> errors;

        switch (exception)
        {
            case BadRequestException badRequestException:
                statusCode = badRequestException.StatusCode;
                message = badRequestException.Message;
                errorCode = badRequestException.ErrorCode;
                errors = badRequestException.Errors ?? new List<string>();
                break;

            case UnauthorizedException unauthorizedException:
                statusCode = unauthorizedException.StatusCode;
                message = unauthorizedException.Message;
                errorCode = unauthorizedException.ErrorCode;
                errors = unauthorizedException.Errors ?? new List<string>();
                break;

            case NotFoundException notFoundException:
                statusCode = notFoundException.StatusCode;
                message = notFoundException.Message;
                errorCode = notFoundException.ErrorCode;
                errors = notFoundException.Errors ?? new List<string>();
                break;

            case ConflictException conflictException:
                statusCode = conflictException.StatusCode;
                message = conflictException.Message;
                errorCode = conflictException.ErrorCode;
                errors = conflictException.Errors ?? new List<string>();
                break;

            case DbUpdateException dbUpdateException:
                statusCode = (int)HttpStatusCode.InternalServerError;
                message = "Database update failed.";
                errorCode = "DATABASE_ERROR";
                errors = new List<string>
                {
                    dbUpdateException.InnerException?.Message
                    ?? dbUpdateException.Message
                };
                break;

            case BaseException baseException:
                statusCode = baseException.StatusCode;
                message = baseException.Message;
                errorCode = baseException.ErrorCode;
                errors = baseException.Errors ?? new List<string>();
                break;

            default:
                statusCode = (int)HttpStatusCode.InternalServerError;
                message = "Internal server error.";
                errorCode = "INTERNAL_SERVER_ERROR";
                errors = new List<string>
                {
                    "Something went wrong. Please try again later."
                };
                break;
        }

        context.Response.StatusCode = statusCode;

        var response = new
        {
            success = false,
            statusCode,
            message,
            errorCode,
            errors,
            timestamp = DateTime.UtcNow
        };

        var jsonResponse = JsonSerializer.Serialize(
            response,
            new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

        await context.Response.WriteAsync(jsonResponse);
    }
}