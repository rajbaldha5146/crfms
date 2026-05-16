using Application.DTOs;

namespace Application.Interfaces;

public interface IAdminLookupService
{
    Task<IEnumerable<DropdownDto>> GetRolesDropdownAsync();

    Task<IEnumerable<DropdownDto>> GetDepartmentsDropdownAsync();

    Task<IEnumerable<DropdownDto>> GetGendersDropdownAsync();

    Task<IEnumerable<DropdownDto>> GetPmUsersDropdownAsync(string? search,string? department,bool isAdmin);
}