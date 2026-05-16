using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Exceptions;

namespace Application.Services;

public class PmHierarchyService : IPmHierarchyService
{
    private readonly IGenericRepository<User>
        _userRepository;

    private readonly IGenericRepository<Role>
        _roleRepository;

    private readonly IGenericRepository<ProjectAssignment>
        _projectAssignmentRepository;

    private readonly IGenericRepository<HierarchyMapping>
        _hierarchyRepository;

    public PmHierarchyService(
        IGenericRepository<User> userRepository,
        IGenericRepository<Role> roleRepository,
        IGenericRepository<HierarchyMapping> hierarchyRepository,
        IGenericRepository<ProjectAssignment> projectAssignmentRepository)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _hierarchyRepository = hierarchyRepository;
        _projectAssignmentRepository = projectAssignmentRepository;
    }

    public async Task<HierarchyNodeDto?>
    GetHierarchyAsync(
        int pmUserId)
    {
        var pm = await _userRepository
            .GetByIdAsync(pmUserId);

        if (pm == null)
        {
            throw new NotFoundException(
                "PM not found");
        }

        // Get PM Users

        var users = await _userRepository
            .FindAsync(x =>
                x.PmUserId == pmUserId
                ||
                x.Id == pmUserId
                ||
                x.Role.RoleName == RoleName.Admin);

        // Get Roles

        var roles = await _roleRepository
            .GetAllAsync();

        var roleDictionary = roles
            .ToDictionary(
                x => x.Id,
                x => x.RoleName.ToString());

        // Get User Ids

        var userIds =
            users
                .Select(x => x.Id)
                .ToList();

        // Get Hierarchy Mappings

        var mappings =
            await _hierarchyRepository
                .FindAsync(x =>
                    userIds.Contains(
                        x.ParentUserId)
                    ||
                    userIds.Contains(
                        x.ChildUserId));

        // Reporting Dictionary

        var reportingDictionary =
            mappings
                .ToDictionary(
                    x => x.ChildUserId,
                    x => x.ParentUserId);

        return BuildTree(
            pmUserId,
            users.ToList(),
            mappings.ToList(),
            reportingDictionary,
            roleDictionary);
    }

    private HierarchyNodeDto?
    BuildTree(
        int userId,
        List<User> users,
        List<HierarchyMapping> mappings,
        Dictionary<int, int>
            reportingDictionary,
        Dictionary<int, string>
            roleDictionary)
    {
        var user = users
            .FirstOrDefault(x =>
                x.Id == userId);

        if (user == null)
        {
            return null;
        }

        // Reporting Person

        int? reportingPersonId =
            null;

        string? reportingPersonName =
            null;

        if (reportingDictionary
            .ContainsKey(userId))
        {
            reportingPersonId =
                reportingDictionary[
                    userId];

            reportingPersonName =
                users
                    .FirstOrDefault(x =>
                        x.Id ==
                        reportingPersonId)
                    ?.FullName;
        }

        // Children

        var childIds =
            mappings
                .Where(x =>
                    x.ParentUserId ==
                    userId)
                .Select(x =>
                    x.ChildUserId)
                .ToList();

        var children =
            childIds
                .Select(x =>
                    BuildTree(
                        x,
                        users,
                        mappings,
                        reportingDictionary,
                        roleDictionary))
                .Where(x => x != null)
                .Cast<HierarchyNodeDto>()
                .ToList();

        // Response

        return new HierarchyNodeDto
        {
            UserId =
                user.Id,

            FullName =
                user.FullName,

            Role =
                roleDictionary[
                    user.RoleId],

            ReportingPersonId =
                reportingPersonId,

            ReportingPersonName =
                reportingPersonName,

            Children =
                children
        };
    }

    private List<int>
    GetDescendants(
        int parentUserId,
        List<HierarchyMapping> mappings)
    {
        var result =
            new List<int>();

        var children =
            mappings
                .Where(x =>
                    x.ParentUserId ==
                    parentUserId)
                .Select(x =>
                    x.ChildUserId)
                .ToList();

        foreach (var childId in children)
        {
            result.Add(childId);

            result.AddRange(
                GetDescendants(
                    childId,
                    mappings));
        }

        return result;
    }

    public async Task ChangeReportingPersonAsync(
    ChangeReportingPersonRequestDto request,
    int pmUserId)
    {
        if (request.ChildUserId ==
            request.NewParentUserId)
        {
            throw new BadRequestException(
                "User cannot report to themselves");
        }

        var childUser = await _userRepository
            .GetByIdAsync(
                request.ChildUserId);

        if (childUser == null)
        {
            throw new NotFoundException(
                "Child user not found");
        }

        var newParentUser =
            await _userRepository
                .GetByIdAsync(
                    request.NewParentUserId);

        if (newParentUser == null)
        {
            throw new NotFoundException(
                "New reporting person not found");
        }

        // PM ownership validation

        if (childUser.PmUserId != pmUserId)
        {
            if (newParentUser.Id != pmUserId)
            {
                throw new ForbiddenException(
                    "PM reporting person cannot be changed");
            }
            else
            {
                throw new ForbiddenException(
                    "You cannot manage this child user");

            }
        }

        if (
            newParentUser.Id != pmUserId
            &&
            newParentUser.PmUserId != pmUserId
        )
        {
            throw new ForbiddenException(
                "You cannot manage this reporting person");
        }

        // Existing mapping validation

        var existingMapping =
            await _hierarchyRepository
                .FirstOrDefaultAsync(x =>
                    x.ChildUserId ==
                        request.ChildUserId);

        if (existingMapping == null)
        {
            throw new NotFoundException(
                "Current reporting hierarchy not found");
        }

        // Same reporting person validation

        if (existingMapping.ParentUserId ==
            request.NewParentUserId)
        {
            throw new BadRequestException(
                "User already reports to this person");
        }

        // Circular Hierarchy Validation

        var mappings =
            await _hierarchyRepository
                .GetAllAsync();

        var descendants =
            GetDescendants(
                request.ChildUserId,
                mappings.ToList());

        if (
            descendants.Contains(
                request.NewParentUserId))
        {
            throw new BadRequestException(
                "Circular hierarchy is not allowed");
        }

        // Remove old mapping

        _hierarchyRepository
            .Remove(existingMapping);

        // Create new mapping

        var newMapping =
            new HierarchyMapping
            {
                ParentUserId =
                    request.NewParentUserId,

                ChildUserId =
                    request.ChildUserId,

                CreatedAt =
                    DateTime.UtcNow
            };

        await _hierarchyRepository
            .AddAsync(newMapping);

        await _hierarchyRepository
            .SaveChangesAsync();
    }

    public async Task<PmUserDetailsDto>
    GetUserDetailsAsync(
        int userId,
        int pmUserId)
    {
        // User

        var user =
            await _userRepository
                .FirstOrDefaultAsync(x =>
                    x.Id == userId
                    &&
                    x.Status ==
                        UserStatus.Active);

        if (user == null)
        {
            throw new NotFoundException(
                "User not found");
        }

        // PM Access Validation

        if (
            user.Id != pmUserId
            &&
            user.PmUserId != pmUserId
        )
        {
            throw new ForbiddenException(
                "You cannot access this user");
        }

        // Role

        var role =
            await _roleRepository
                .GetByIdAsync(
                    user.RoleId);

        // Reporting Mapping

        var mapping =
            await _hierarchyRepository
                .FirstOrDefaultAsync(x =>
                    x.ChildUserId ==
                    userId);

        string? reportingPersonName =
            null;

        if (mapping != null)
        {
            var reportingUser =
                await _userRepository
                    .GetByIdAsync(
                        mapping.ParentUserId);

            reportingPersonName =
                reportingUser?.FullName;
        }

        // Response

        return new PmUserDetailsDto
        {
            UserId =
                user.Id,

            FullName =
                user.FullName,

            Email =
                user.Email,

            Role =
                role?.RoleName.ToString()
                ?? string.Empty,

            Department =
                user.Department.ToString(),

            Experience =
                user.Experience,

            MobileNumber =
                user.MobileNumber,

            Status =
                user.Status.ToString(),

            ReportingPersonId =
                mapping?.ParentUserId,

            ReportingPersonName =
                reportingPersonName
        };
    }
}