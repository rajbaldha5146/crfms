using System.Text;
using API.Middlewares;
using Application.Hubs;
using Application.Interfaces;
using Application.Services;
using Data.Context;
using Infrastructure.Data;
using Infrastructure.ExternalServices;
using Infrastructure.Repositories;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. Core Services (Controllers, Swagger, SignalR)
// ==========================================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

// ==========================================
// 2. Dependency Injection (Business Logic & Data)
// ==========================================
builder.Services.AddScoped<UserSeeder>();
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<IAdminLookupService, AdminLookupService>();
builder.Services.AddScoped<IAdminUserService, AdminUserService>();
builder.Services.AddScoped<IFeedbackService, FeedbackService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IPmHierarchyService, PmHierarchyService>();
builder.Services.AddScoped<IPmProjectService, PmProjectService>();

builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<ILoginRepository, LoginRepository>();
builder.Services.AddScoped<ICommonRepository, CommonRepository>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IRefreshTokenService, RefreshTokenService>();

// ==========================================
// 3. Database Context
// ==========================================
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// ==========================================
// 4. CORS Policy
// ==========================================
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins!)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Required for SignalR with Cookies/Auth
    });
});

// ==========================================
// 5. Custom Validation Response
// ==========================================
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(x => x.Value?.Errors.Count > 0)
            .ToDictionary(
                kvp => kvp.Key,
                kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray()
            );

        return new BadRequestObjectResult(new { success = false, message = "Validation Failed", errors });
    };
});

// ==========================================
// 6. Authentication & JWT Configuration
// ==========================================
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["jwtSettings:Issuer"],
            ValidAudience = builder.Configuration["jwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["jwtSettings:SecretKey"]!)),
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                // Read token from cookie instead of Authorization Header
                context.Token = context.Request.Cookies["accessToken"];
                return Task.CompletedTask;
            },
            OnChallenge = async context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = 401;
                await context.Response.WriteAsJsonAsync(new { success = false, statusCode = 401, message = "Unauthorized", timestamp = DateTime.UtcNow });
            },
            OnForbidden = async context =>
            {
                context.Response.StatusCode = 403;
                await context.Response.WriteAsJsonAsync(new { success = false, statusCode = 403, message = "You are not allowed to access this resource.", timestamp = DateTime.UtcNow });
            }
        };
    });

// ==========================================
// 7. Authorization Policies
// ==========================================
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdmin", policy => policy.RequireRole("Admin"));
    options.AddPolicy("RequirePM", policy => policy.RequireRole("Pm"));
    options.AddPolicy("RequireTL", policy => policy.RequireRole("Tl"));
    options.AddPolicy("RequireSenior", policy => policy.RequireRole("SeniorDeveloper"));
    options.AddPolicy("RequireJunior", policy => policy.RequireRole("JuniorDeveloper"));
});

var app = builder.Build();

// ==========================================
// 8. MIDDLEWARE PIPELINE (Order is Critical)
// ==========================================

// 1. Global Exception Handling
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 2. Protocol Security
app.UseHttpsRedirection();

// 3. CORS (Must be before Auth and SignalR)
app.UseCors("AllowFrontend");

// 4. Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// 5. Endpoints (SignalR must follow Auth)
app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");

// using (var scope = app.Services.CreateScope())
// {
//     var services = scope.ServiceProvider;
//     try
//     {
//         var context = services.GetRequiredService<AppDbContext>();
//         var userSeeder = services.GetRequiredService<UserSeeder>();

//         Console.WriteLine("Seeding Users and Roles...");
//         await userSeeder.SeedAsync();
//         Console.WriteLine("Seeding completed successfully.");
//     }
//     catch (Exception ex)
//     {
//         var logger = services.GetRequiredService<ILogger<Program>>();
//         logger.LogError(ex, "An error occurred while seeding the database.");
//         // Optional: Output to console for quick debugging during development
//         Console.WriteLine($"Seeding Error: {ex.Message}");
//     }
// }

app.Run();

