using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Exceptions;

namespace Application.Services;

public class PmProjectService : IPmProjectService
{
    private readonly IGenericRepository<Project>
        _projectRepository;

    private readonly IGenericRepository<HierarchyMapping>
        _hierarchyRepository;

    private readonly IGenericRepository<
    ProjectAssignment>
    _projectAssignmentRepository;

    private readonly IGenericRepository<User>
        _userRepository;

    public PmProjectService(
    IGenericRepository<Project> projectRepository,
    IGenericRepository<ProjectAssignment>
        projectAssignmentRepository,
    IGenericRepository<User>
        userRepository,
        IGenericRepository<HierarchyMapping>
        hierarchyRepository)
    {
        _projectRepository =
            projectRepository;

        _projectAssignmentRepository =
            projectAssignmentRepository;

        _userRepository =
            userRepository;

        _hierarchyRepository =
            hierarchyRepository;
    }

    public async Task<
        CreateProjectResponseDto>
        CreateProjectAsync(
            CreateProjectRequestDto request,
            int pmUserId)
    {
        var normalizedInput = request.Name.Replace(" ", "").ToLower();

        var projectExists = await _projectRepository
            .AnyAsync(x => x.Name.Replace(" ", "").ToLower() == normalizedInput);

        if (projectExists)
        {
            throw new ConflictException("A project with a similar name already exists.");
        }

        var project =
            new Project
            {
                Name =
                    request.Name,

                Description =
                    request.Description,

                Status =
                    ProjectStatus.Active,

                CreatedAt =
                    DateTime.UtcNow,

                CreatedBy =
                    pmUserId
            };

        await _projectRepository
            .AddAsync(project);

        await _projectRepository
            .SaveChangesAsync();

        // Assign PM into project

        var pmAssignment =
            new ProjectAssignment
            {
                ProjectId = project.Id,

                UserId = pmUserId,

                CreatedAt =
                    DateTime.UtcNow
            };

        await _projectAssignmentRepository
            .AddAsync(pmAssignment);

        await _projectAssignmentRepository
            .SaveChangesAsync();

        return new CreateProjectResponseDto
        {
            Id = project.Id,

            Name = project.Name,

            Description =
                project.Description,

            Status =
                project.Status.ToString(),

            CreatedAt =
                project.CreatedAt
        };
    }

    public async Task<
    AssignProjectMembersResponseDto>
AssignProjectMembersAsync(
    int projectId,
    AssignProjectMembersRequestDto request,
    int pmUserId)
    {
        // Validate Project

        var project =
            await _projectRepository
                .GetByIdAsync(projectId);

        if (project == null)
        {
            throw new NotFoundException(
                "Project not found");
        }

        // PM ownership validation

        if (project.CreatedBy != pmUserId)
        {
            throw new ForbiddenException(
                "You cannot manage this project");
        }

        // Empty validation

        if (!request.UserIds.Any())
        {
            throw new BadRequestException(
                "Please select at least one member");
        }

        // Load users

        var users =
            await _userRepository
                .FindAsync(x =>
                    request.UserIds
                        .Contains(x.Id));

        var usersList =
            users.ToList();

        // Missing user validation

        if (usersList.Count !=
            request.UserIds.Count)
        {
            throw new BadRequestException(
                "Some users are invalid");
        }

        // Existing Assignments

        var existingAssignments =
            await _projectAssignmentRepository
                .FindAsync(x =>
                    x.ProjectId ==
                    projectId);

        var assignedUserIds =
            existingAssignments
                .Select(x => x.UserId)
                .ToHashSet();

        // Hierarchy Mappings

        var hierarchyMappings =
            await _hierarchyRepository
                .FindAsync(x =>
                    request.UserIds
                        .Contains(
                            x.ChildUserId));

        // Warning Messages

        var warnings =
            new List<string>();

        foreach (var user in usersList)
        {
            // PM ownership validation

            if (user.PmUserId != pmUserId)
            {
                throw new ForbiddenException(
                    $"You cannot assign {user.FullName}");
            }

            // Duplicate assignment validation

            if (assignedUserIds
                .Contains(user.Id))
            {
                continue;
            }

            // Reporting Person Validation

            var reportingMapping =
                hierarchyMappings
                    .FirstOrDefault(x =>
                        x.ChildUserId ==
                        user.Id);

            if (reportingMapping != null)
            {
                var parentAssigned =
                    assignedUserIds
                        .Contains(
                            reportingMapping
                                .ParentUserId);

                if (!parentAssigned)
                {
                    var parentUser =
                        await _userRepository
                            .GetByIdAsync(
                                reportingMapping
                                    .ParentUserId);

                    if (parentUser != null)
                    {
                        warnings.Add(
                            $"{user.FullName} reports to {parentUser.FullName} who is not assigned to this project");
                    }
                }
            }

            // Assignment

            var assignment =
                new ProjectAssignment
                {
                    ProjectId =
                        projectId,

                    UserId =
                        user.Id,

                    CreatedAt =
                        DateTime.UtcNow
                };

            await _projectAssignmentRepository
                .AddAsync(assignment);

            assignedUserIds
                .Add(user.Id);
        }

        await _projectAssignmentRepository
            .SaveChangesAsync();

        // Response

        return new AssignProjectMembersResponseDto
        {
            Warnings = warnings
        };
    }

    public async Task
    RemoveMemberFromProjectAsync(
        int projectId,
        int userId,
        int pmUserId)
    {
        // Validate Project

        var project =
            await _projectRepository
                .FirstOrDefaultAsync(x =>
                    x.Id == projectId
                    &&
                    x.Status ==
                        ProjectStatus.Active);

        if (project == null)
        {
            throw new NotFoundException(
                "Project not found");
        }

        // Validate User

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

        // Validate PM Access

        if (
            user.Id != pmUserId
            &&
            user.PmUserId != pmUserId
        )
        {
            throw new ForbiddenException(
                "You cannot remove this user");
        }

        // Find Assignment

        var assignment =
            await _projectAssignmentRepository
                .FirstOrDefaultAsync(x =>
                    x.ProjectId == projectId
                    &&
                    x.UserId == userId);

        if (assignment == null)
        {
            throw new NotFoundException(
                "User is not assigned to this project");
        }

        // Prevent PM Self Remove

        if (userId == pmUserId)
        {
            throw new BadRequestException(
                "PM cannot remove themselves from project");
        }

        // Remove Assignment

        _projectAssignmentRepository
            .Remove(assignment);

        await _projectAssignmentRepository
            .SaveChangesAsync();
    }
}