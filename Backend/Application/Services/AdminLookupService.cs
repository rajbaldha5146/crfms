using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;

namespace Application.Services;

public class AdminLookupService : IAdminLookupService
{
    private readonly IGenericRepository<Role> _roleRepository;

    private readonly IGenericRepository<User> _userRepository;

    public AdminLookupService(
        IGenericRepository<Role>
            roleRepository,

        IGenericRepository<User>
            userRepository)
    {
        _roleRepository =
            roleRepository;

        _userRepository =
            userRepository;
    }

    public async Task<
    IEnumerable<DropdownDto>>
    GetRolesDropdownAsync()
    {
        var roles =
            await _roleRepository
                .FindAsync(x =>
                    x.RoleName !=
                    RoleName.Admin);

        return roles.Select(role =>
            new DropdownDto
            {
                Id = role.Id,

                Name =
                    role.RoleName
                        .ToString()
            });
    }

    public Task<IEnumerable<DropdownDto>> GetDepartmentsDropdownAsync()
    {
        var departments = Enum.GetValues(typeof(Department))
            .Cast<Department>()
            .Select((department, index) => new DropdownDto
            {
                Id = index + 1,
                Name = department.ToString()
            });

        return Task.FromResult(departments);
    }

    public Task<IEnumerable<DropdownDto>> GetGendersDropdownAsync()
    {
        var genders = Enum.GetValues(typeof(Gender))
            .Cast<Gender>()
            .Select((gender, index) => new DropdownDto
            {
                Id = index + 1,
                Name = gender.ToString()
            });

        return Task.FromResult(genders);
    }

    public async Task<
IEnumerable<DropdownDto>>
GetPmUsersDropdownAsync(
    string? search,
    string? department,
    bool isAdmin)
    {
        // Admin Flow

        if (isAdmin)
        {
            var adminRole =
                await _roleRepository
                    .FirstOrDefaultAsync(x =>
                        x.RoleName ==
                        RoleName.Admin);

            if (adminRole == null)
            {
                return Enumerable.Empty<
                    DropdownDto>();
            }

            var admins =
                await _userRepository
                    .FindAsync(x =>

                        x.RoleId ==
                            adminRole.Id

                        &&

                        x.Status ==
                            UserStatus.Active

                        &&

                        (
                            string.IsNullOrWhiteSpace(
                                search)

                            ||

                            x.FullName
                                .ToLower()
                                .Contains(
                                    search.ToLower())
                        ));

            return admins
                .OrderBy(x => x.FullName)

                .Select(x =>
                    new DropdownDto
                    {
                        Id = x.Id,

                        Name = x.FullName
                    });
        }

        // PM Role

        var pmRole =
            await _roleRepository
                .FirstOrDefaultAsync(x =>
                    x.RoleName ==
                    RoleName.Pm);

        if (pmRole == null)
        {
            return Enumerable.Empty<
                DropdownDto>();
        }

        // Department Parse

        Department? parsedDepartment =
            null;

        if (!string.IsNullOrWhiteSpace(
            department))
        {
            parsedDepartment =
                Enum.Parse<Department>(
                    department,
                    true);
        }

        // PM Users

        var users =
            await _userRepository
                .FindAsync(x =>

                    x.RoleId ==
                        pmRole.Id

                    &&

                    x.Status ==
                        UserStatus.Active

                    &&

                    (
                        parsedDepartment ==
                        null

                        ||

                        x.Department ==
                        parsedDepartment
                    )

                    &&

                    (
                        string.IsNullOrWhiteSpace(
                            search)

                        ||

                        x.FullName
                            .ToLower()
                            .Contains(
                                search.ToLower())
                    ));

        return users
            .OrderBy(x => x.FullName)

            .Select(x =>
                new DropdownDto
                {
                    Id = x.Id,

                    Name = x.FullName
                });
    }
}
