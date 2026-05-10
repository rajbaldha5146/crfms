using Application.Interfaces;
using Data.Context;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class UserSeeder
{
    private readonly AppDbContext _context;
    private readonly IPasswordService _passwordService;

    // Constants to avoid magic strings and bugs
    private const string AdminEmail = "tatvasoftadmin@yopmail.com";
    private const string DefaultPassword = "Admin@1234";

    public UserSeeder(AppDbContext context, IPasswordService passwordService)
    {
        _context = context;
        _passwordService = passwordService;
    }

    public async Task SeedAsync()
    {
        // Use a transaction to ensure all-or-nothing seeding
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 1. Ensure Roles exist
            await SeedRolesAsync();

            // 2. Fetch all roles into a dictionary for fast lookup (reduces DB queries)
            var rolesMap = await _context.Roles.ToDictionaryAsync(r => r.RoleName, r => r.Id);

            // 3. Seed Admin
            var adminId = await SeedAdminUserAsync(rolesMap);

            // 4. Seed PMs (1 per Department)
            await SeedProjectManagersAsync(adminId, rolesMap);

            // 5. Seed Remaining Staff
            await SeedStaffAsync(adminId, rolesMap);

            await transaction.CommitAsync();
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private async Task SeedRolesAsync()
    {
        if (!await _context.Roles.AnyAsync())
        {
            var roles = Enum.GetValues<RoleName>().Select(r => new Role
            {
                RoleName = r,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            await _context.Roles.AddRangeAsync(roles);
            await _context.SaveChangesAsync();
        }
    }

    private async Task<int> SeedAdminUserAsync(Dictionary<RoleName, int> rolesMap)
    {
        var admin = await _context.Users.FirstOrDefaultAsync(u => u.Email == AdminEmail);
        
        if (admin == null)
        {
            admin = new User
            {
                FullName = "System Admin",
                Email = AdminEmail,
                Password = _passwordService.GenerateHash(DefaultPassword), // Security fix
                Status = UserStatus.Active,
                Department = Department.Microsoft,
                Gender = Gender.Male,
                RoleId = rolesMap[RoleName.Admin], // Dictionary lookup
                CreatedAt = DateTime.UtcNow,
                Experience = "10 Years"
            };
            
            await _context.Users.AddAsync(admin);
            await _context.SaveChangesAsync();
        }
        
        return admin.Id;
    }

    private async Task SeedProjectManagersAsync(int creatorId, Dictionary<RoleName, int> rolesMap)
    {
        var departments = Enum.GetValues<Department>();
        var pmRoleId = rolesMap[RoleName.Pm];

        foreach (var dept in departments)
        {
            string email = $"pm.{dept.ToString().ToLower()}@company.com";
            
            if (!await _context.Users.AnyAsync(u => u.Email == email))
            {
                await _context.Users.AddAsync(new User
                {
                    FullName = $"{dept} Project Manager",
                    Email = email,
                    Password = _passwordService.GenerateHash(DefaultPassword),
                    Status = UserStatus.Active,
                    Department = dept,
                    Gender = Gender.Male,
                    RoleId = pmRoleId,
                    CreatedBy = creatorId,
                    CreatedAt = DateTime.UtcNow,
                    Experience = "8 Years"
                });
            }
        }
        await _context.SaveChangesAsync();
    }

    private async Task SeedStaffAsync(int creatorId, Dictionary<RoleName, int> rolesMap)
    {
        var departments = Enum.GetValues<Department>();
        var staffRequirements = new List<(RoleName Role, int Count)>
        {
            (RoleName.Tl, 2),
            (RoleName.SeniorDeveloper, 2),
            (RoleName.JuniorDeveloper, 2)
        };

        foreach (var req in staffRequirements)
        {
            var roleId = rolesMap[req.Role];
            
            for (int i = 1; i <= req.Count; i++)
            {
                string email = $"{req.Role.ToString().ToLower()}{i}@company.com";
                
                if (!await _context.Users.AnyAsync(u => u.Email == email))
                {
                    await _context.Users.AddAsync(new User
                    {
                        FullName = $"{req.Role} Employee {i}",
                        Email = email,
                        Password = _passwordService.GenerateHash(DefaultPassword),
                        Status = UserStatus.Active,
                        // Safe department assignment logic
                        Department = departments[i % departments.Length], 
                        Gender = i % 2 == 0 ? Gender.Female : Gender.Male,
                        RoleId = roleId,
                        CreatedBy = creatorId,
                        CreatedAt = DateTime.UtcNow,
                        Experience = "Various"
                    });
                }
            }
        }
        await _context.SaveChangesAsync();
    }
}