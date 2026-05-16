using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Exceptions;
using Microsoft.Extensions.Configuration;

namespace Application.Services;

public class AdminUserService
    : IAdminUserService
{
    private readonly
        IGenericRepository<User>
        _userRepository;

    private readonly
        IGenericRepository<Role>
        _roleRepository;

    private readonly
        IPasswordService
        _passwordService;

    private readonly
        IEmailService
        _emailService;

    private readonly
        IConfiguration
        _configuration;

    private readonly
    IGenericRepository<
        HierarchyMapping>
    _hierarchyRepository;

    public AdminUserService(
    IGenericRepository<User>
        userRepository,

    IGenericRepository<Role>
        roleRepository,

    IPasswordService
        passwordService,

    IEmailService
        emailService,

    IConfiguration
        configuration,

    IGenericRepository<
        HierarchyMapping>
        hierarchyRepository)
    {
        _userRepository =
            userRepository;

        _roleRepository =
            roleRepository;

        _passwordService =
            passwordService;

        _emailService =
            emailService;

        _configuration =
            configuration;

        _hierarchyRepository =
            hierarchyRepository;
    }

    public async Task<
        CreateUserResponseDto>
        CreateUserAsync(
            CreateUserRequestDto request,
            int loggedInUserId)
    {
        // Email Validation

        var emailExists =
            await _userRepository
                .AnyAsync(x =>
                    x.Email.ToLower() ==
                    request.Email.ToLower());

        if (emailExists)
        {
            throw new ConflictException(
                "Email already exists");
        }

        // Role Validation

        var role =
            await _roleRepository
                .GetByIdAsync(
                    request.RoleId);

        if (role == null)
        {
            throw new NotFoundException(
                "Role not found");
        }

        // Prevent Admin Creation

        if (role.RoleName == RoleName.Admin)
        {
            throw new BadRequestException(
                "You cannot create new admin users");
        }

        // Temporary Password

        var tempPassword =
            _configuration[
                "EmailSettings:TempPass"]!;

        // Create User

        var user =
            new User
            {
                FullName =
                    request.FullName,

                Email =
                    request.Email,

                Password =
                    _passwordService
                        .GenerateHash(
                            tempPassword),

                Experience =
                    request.Experience,

                Department =
                    Enum.Parse<Department>(
                        request.Department,
                        true),

                Gender =
                    Enum.Parse<Gender>(
                        request.Gender,
                        true),

                MobileNumber =
                    request.MobileNumber,

                RoleId =
                    request.RoleId,

                PmUserId =
                    request.PmUserId,

                Status =
                    UserStatus.Active,

                IsFirstLogin =
                    true,

                // IsHierarchyAssigned =
                //     false,

                CreatedAt =
                    DateTime.UtcNow,

                CreatedBy =
                    loggedInUserId
            };

        await _userRepository
            .AddAsync(user);

        await _userRepository
            .SaveChangesAsync();

        // Create default PM hierarchy mapping

        if (request.PmUserId.HasValue)
        {
            var hierarchy =
                new HierarchyMapping
                {
                    ParentUserId =
                        request.PmUserId.Value,

                    ChildUserId =
                        user.Id,

                    CreatedAt =
                        DateTime.UtcNow
                };

            await _hierarchyRepository
                .AddAsync(hierarchy);

            await _hierarchyRepository
                .SaveChangesAsync();
        }

        // Email Template

        var templatePath =
            Path.Combine(
                AppDomain.CurrentDomain.BaseDirectory,
                "EmailTemplate",
                "WelcomeUser.html");

        var htmlTemplate =
            await File.ReadAllTextAsync(
                templatePath);

        htmlTemplate =
            htmlTemplate
                .Replace(
                    "{{FullName}}",
                    user.FullName)

                .Replace(
                    "{{Email}}",
                    user.Email)

                .Replace(
                    "{{Password}}",
                    tempPassword)

                .Replace(
                    "{{Role}}",
                    role.RoleName.ToString());

        // Send Email

        await _emailService
            .SendEmailAsync(
                user.Email,
                "Welcome to Code Review Feedback Management System",
                htmlTemplate);

        // Response

        return new CreateUserResponseDto
        {
            Id =
                user.Id,

            Email =
                user.Email,

            CreatedAt =
                user.CreatedAt
        };
    }
}