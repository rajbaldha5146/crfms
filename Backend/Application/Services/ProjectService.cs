using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Exceptions;

namespace Application.Services;

public class ProjectService : IProjectService
{
    private readonly IGenericRepository<ProjectAssignment>
        _projectAssignmentRepository;

    private readonly IGenericRepository<Role>
        _roleRepository;

    private readonly IGenericRepository<User>
        _userRepository;

    private readonly IGenericRepository<HierarchyMapping>
        _hierarchyRepository;

    private readonly IGenericRepository<FeedbackResolution>
        _feedbackResolutionRepository;

    private readonly IGenericRepository<Feedback>
    _feedbackRepository;

    private readonly IGenericRepository<Project>
        _projectRepository;

    public ProjectService(
        IGenericRepository<ProjectAssignment>
            projectAssignmentRepository,
        IGenericRepository<Role>
            roleRepository,
        IGenericRepository<Project>
            projectRepository,
        IGenericRepository<FeedbackResolution>
            feedbackResolutionRepository,
        IGenericRepository<Feedback>
                feedbackRepository,
        IGenericRepository<User>
            userRepository,
        IGenericRepository<HierarchyMapping>
            hierarchyRepository
        )
    {
        _projectAssignmentRepository =
            projectAssignmentRepository;

        _projectRepository =
            projectRepository;

        _feedbackRepository =
            feedbackRepository;

        _roleRepository =
            roleRepository;

        _userRepository =
            userRepository;

        _hierarchyRepository =
            hierarchyRepository;

        _feedbackResolutionRepository =
            feedbackResolutionRepository;
    }

    public async Task<
        IEnumerable<ProjectDropdownResponseDto>>
        GetMyProjectsAsync(int userId)
    {
        var assignments =
            await _projectAssignmentRepository
                .FindAsync(x => x.UserId == userId);

        var projectIds =
            assignments
                .Select(x => x.ProjectId)
                .Distinct()
                .ToList();

        var projects =
            await _projectRepository
                .FindAsync(x =>
                    projectIds.Contains(x.Id) &&
                    x.Status == ProjectStatus.Active);

        return projects
            .Select(x => new ProjectDropdownResponseDto
            {
                Id = x.Id,
                Name = x.Name
            })
            .OrderBy(x => x.Name);
    }

    public async Task<
    IEnumerable<ProjectCardDto>>
    GetMyProjectCardsAsync(
        int userId)
    {
        // Get Assignments

        var assignments =
            await _projectAssignmentRepository
                .FindAsync(x =>
                    x.UserId == userId);

        var projectIds =
            assignments
                .Select(x => x.ProjectId)
                .Distinct()
                .ToList();

        if (!projectIds.Any())
        {
            return Enumerable.Empty<
                ProjectCardDto>();
        }

        // Load Projects

        var projects =
            await _projectRepository
                .FindAsync(x =>
                    projectIds.Contains(x.Id)
                    &&
                    x.Status ==
                    ProjectStatus.Active);

        // Load All Assignments

        var allAssignments =
            await _projectAssignmentRepository
                .FindAsync(x =>
                    projectIds.Contains(
                        x.ProjectId));

        // Load Feedbacks

        var feedbacks =
            await _feedbackRepository
                .FindAsync(x =>
                    projectIds.Contains(
                        x.ProjectId)
                    &&
                    !x.IsDeleted);

        // Response

        return projects
            .Select(project =>
            {
                var projectMembers =
                    allAssignments
                        .Count(x =>
                            x.ProjectId ==
                            project.Id);

                var projectFeedbacks =
                    feedbacks
                        .Where(x =>
                            x.ProjectId ==
                            project.Id)
                        .ToList();

                var openCount =
                    projectFeedbacks
                        .Count(x =>
                            x.Status ==
                            FeedbackStatus.Open);

                var resolvedCount =
                    projectFeedbacks
                        .Count(x =>
                            x.Status ==
                            FeedbackStatus.Resolved);

                var lastFeedbackAt =
                    projectFeedbacks
                        .OrderByDescending(x =>
                            x.CreatedAt)
                        .FirstOrDefault()
                        ?.CreatedAt;

                return new ProjectCardDto
                {
                    Id = project.Id,

                    Name = project.Name,

                    Description =
                        project.Description,

                    Status =
                        project.Status
                            .ToString(),

                    TotalMembers =
                        projectMembers,

                    OpenFeedbackCount =
                        openCount,

                    ResolvedFeedbackCount =
                        resolvedCount,

                    LastFeedbackAt =
                        lastFeedbackAt
                };
            })
            .OrderByDescending(x =>
                x.LastFeedbackAt);
    }

    private ProjectHierarchyNodeDto
    BuildHierarchyNode(
        int userId,
        Dictionary<int, User>
            userDictionary,
        Dictionary<int, string>
            roleDictionary,
        List<HierarchyMapping>
            mappings,
        Dictionary<int, int>
            reportingDictionary,
        Dictionary<int, int>
            openCounts,
        Dictionary<int, int>
            resolvedCounts)
    {
        var user =
            userDictionary[userId];

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

            if (userDictionary
                .ContainsKey(
                    reportingPersonId
                        .Value))
            {
                reportingPersonName =
                    userDictionary[
                        reportingPersonId
                            .Value]
                        .FullName;
            }
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
                .Where(x =>
                    userDictionary
                        .ContainsKey(x))
                .Select(childId =>
                    BuildHierarchyNode(
                        childId,
                        userDictionary,
                        roleDictionary,
                        mappings,
                        reportingDictionary,
                        openCounts,
                        resolvedCounts))
                .ToList();

        // Response

        return new ProjectHierarchyNodeDto
        {
            UserId =
                user.Id,

            FullName =
                user.FullName,

            RoleName =
                roleDictionary[
                    user.RoleId],

            ReportingPersonId =
                reportingPersonId,

            ReportingPersonName =
                reportingPersonName,

            OpenFeedbackCount =
                openCounts
                    .ContainsKey(user.Id)
                    ? openCounts[user.Id]
                    : 0,

            ResolvedFeedbackCount =
                resolvedCounts
                    .ContainsKey(user.Id)
                    ? resolvedCounts[user.Id]
                    : 0,

            Children =
                children
        };
    }

    public async Task<
List<ProjectHierarchyNodeDto>>
GetProjectHierarchyAsync(
    int projectId,
    int loggedInUserId)
    {
        // Validate Project

        var project =
            await _projectRepository
                .FirstOrDefaultAsync(x =>
                    x.Id == projectId &&
                    x.Status ==
                    ProjectStatus.Active);

        if (project == null)
        {
            throw new NotFoundException(
                "Project not found");
        }

        // Validate Access

        var hasAccess =
            await _projectAssignmentRepository
                .AnyAsync(x =>
                    x.ProjectId == projectId &&
                    x.UserId ==
                    loggedInUserId);

        if (!hasAccess)
        {
            throw new ForbiddenException(
                "You are not assigned to this project");
        }

        // Get Project Assignments

        var assignments =
            await _projectAssignmentRepository
                .FindAsync(x =>
                    x.ProjectId == projectId);

        var assignedUserIds =
            assignments
                .Select(x => x.UserId)
                .Distinct()
                .ToList();

        // Get Project Users

        var projectUsers =
            await _userRepository
                .FindAsync(x =>
                    assignedUserIds.Contains(
                        x.Id)
                    &&
                    x.Status ==
                        UserStatus.Active);

        // Get All Hierarchy Mappings

        var allMappings =
            await _hierarchyRepository
                .GetAllAsync();

        // Get Roles

        var roles =
            await _roleRepository
                .GetAllAsync();

        var roleDictionary =
            roles.ToDictionary(
                x => x.Id,
                x => x.RoleName.ToString());

        // Logged In User

        var loggedInUser =
            projectUsers
                .FirstOrDefault(x =>
                    x.Id ==
                    loggedInUserId);

        if (loggedInUser == null)
        {
            throw new NotFoundException(
                "User not found");
        }

        // PM Role Id

        var pmRoleId =
            roles
                .First(x =>
                    x.RoleName ==
                    RoleName.Pm)
                .Id;

        // Accessible User Ids

        List<int> accessibleUserIds;

        // PM sees full hierarchy

        if (loggedInUser.RoleId ==
            pmRoleId)
        {
            accessibleUserIds =
                assignedUserIds;
        }

        // Other users see subtree

        else
        {
            accessibleUserIds =
                new List<int>
                {
                    loggedInUserId
                };

            accessibleUserIds
                .AddRange(
                    GetAllDescendantUserIds(
                        loggedInUserId,
                        allMappings));

            accessibleUserIds =
                accessibleUserIds
                    .Distinct()
                    .Where(x =>
                        assignedUserIds
                            .Contains(x))
                    .ToList();
        }

        // Filter Users

        var filteredUsers =
            projectUsers
                .Where(x =>
                    accessibleUserIds
                        .Contains(x.Id))
                .ToList();

        // Reporting Parent Ids

        var reportingParentIds =
            allMappings
                .Where(x =>
                    accessibleUserIds
                        .Contains(
                            x.ChildUserId))
                .Select(x =>
                    x.ParentUserId)
                .Distinct()
                .ToList();

        // Reporting Users

        var reportingUsers =
            await _userRepository
                .FindAsync(x =>
                    reportingParentIds
                        .Contains(x.Id));

        // Merge Users

        var users =
            filteredUsers
                .Concat(reportingUsers)
                .DistinctBy(x => x.Id)
                .ToList();

        // User Dictionary

        var userDictionary =
            users.ToDictionary(
                x => x.Id);

        // Build Visible Hierarchy

        var mappings =
            new List<HierarchyMapping>();

        foreach (var childUserId in accessibleUserIds)
        {
            var currentChildId =
                childUserId;

            while (true)
            {
                var parentMapping =
                    allMappings
                        .FirstOrDefault(x =>
                            x.ChildUserId ==
                            currentChildId);

                if (parentMapping == null)
                {
                    break;
                }

                // Parent visible

                if (accessibleUserIds
                    .Contains(
                        parentMapping
                            .ParentUserId))
                {
                    mappings.Add(
                        new HierarchyMapping
                        {
                            ParentUserId =
                                parentMapping
                                    .ParentUserId,

                            ChildUserId =
                                childUserId
                        });

                    break;
                }

                // Move upward

                currentChildId =
                    parentMapping
                        .ParentUserId;
            }
        }

        // Feedbacks

        var feedbacks =
            await _feedbackRepository
                .FindAsync(x =>
                    x.ProjectId ==
                        projectId
                    &&
                    !x.IsDeleted
                    &&
                    accessibleUserIds
                        .Contains(
                            x.RevieweeUserId));

        // Feedback Statistics

        var openCounts =
            feedbacks
                .Where(x =>
                    x.Status ==
                    FeedbackStatus.Open)
                .GroupBy(x =>
                    x.RevieweeUserId)
                .ToDictionary(
                    x => x.Key,
                    x => x.Count());

        var resolvedCounts =
            feedbacks
                .Where(x =>
                    x.Status ==
                    FeedbackStatus.Resolved)
                .GroupBy(x =>
                    x.RevieweeUserId)
                .ToDictionary(
                    x => x.Key,
                    x => x.Count());

        // Reporting Dictionary

        var reportingDictionary =
            allMappings
                .Where(x =>
                    accessibleUserIds
                        .Contains(
                            x.ChildUserId))
                .ToDictionary(
                    x => x.ChildUserId,
                    x => x.ParentUserId);

        // Root Users

        List<int> rootUsers;

        // PM

        if (loggedInUser.RoleId ==
            pmRoleId)
        {
            var childUserIds =
                mappings
                    .Select(x =>
                        x.ChildUserId)
                    .ToHashSet();

            rootUsers =
                accessibleUserIds
                    .Where(x =>
                        !childUserIds
                            .Contains(x))
                    .ToList();
        }

        // Other Roles

        else
        {
            rootUsers =
                new List<int>
                {
                    loggedInUserId
                };
        }

        // Build Tree

        var result =
            rootUsers
                .Where(x =>
                    userDictionary
                        .ContainsKey(x))
                .Select(rootUserId =>
                    BuildHierarchyNode(
                        rootUserId,
                        userDictionary,
                        roleDictionary,
                        mappings,
                        reportingDictionary,
                        openCounts,
                        resolvedCounts))
                .ToList();

        return result;
    }

    private List<int> GetAllDescendantUserIds(
    int parentUserId,
    IEnumerable<HierarchyMapping> mappings)
    {
        var result = new List<int>();

        var directChildren = mappings
            .Where(x => x.ParentUserId == parentUserId)
            .Select(x => x.ChildUserId)
            .ToList();

        foreach (var childId in directChildren)
        {
            result.Add(childId);

            result.AddRange(
                GetAllDescendantUserIds(
                    childId,
                    mappings));
        }

        return result
            .Distinct()
            .ToList();
    }

    public async Task<UserProjectFeedbacksDto>
    GetUserProjectFeedbacksAsync(
        int projectId,
        int userId,
        string? status,
        int loggedInUserId)
    {
        // Validate Project

        var project =
            await _projectRepository
                .FirstOrDefaultAsync(x =>
                    x.Id == projectId &&
                    x.Status ==
                    ProjectStatus.Active);

        if (project == null)
        {
            throw new NotFoundException(
                "Project not found");
        }

        // Validate Logged-In User Access

        var hasAccess =
            await _projectAssignmentRepository
                .AnyAsync(x =>
                    x.ProjectId == projectId &&
                    x.UserId ==
                    loggedInUserId);

        if (!hasAccess)
        {
            throw new ForbiddenException(
                "You are not assigned to this project");
        }

        // Validate Requested User

        var requestedUser =
            await _userRepository
                .FirstOrDefaultAsync(x =>
                    x.Id == userId &&
                    x.Status ==
                    UserStatus.Active);

        if (requestedUser == null)
        {
            throw new NotFoundException(
                "User not found");
        }

        // Validate User Assignment

        var userAssigned =
            await _projectAssignmentRepository
                .AnyAsync(x =>
                    x.ProjectId == projectId &&
                    x.UserId == userId);

        if (!userAssigned)
        {
            throw new BadRequestException(
                "User is not assigned to this project");
        }

        // Validate Hierarchy Access

        if (userId != loggedInUserId)
        {
            var mappings =
                await _hierarchyRepository
                    .GetAllAsync();

            var descendantIds =
                GetAllDescendantUserIds(
                    loggedInUserId,
                    mappings);

            var canAccess =
                descendantIds.Contains(
                    userId);

            if (!canAccess)
            {
                throw new ForbiddenException(
                    "You are not authorized to access this user workspace");
            }
        }

        // Load All Feedbacks

        var allFeedbacks =
            await _feedbackRepository
                .FindAsync(x =>
                    x.ProjectId == projectId
                    &&
                    x.RevieweeUserId ==
                    userId
                    &&
                    !x.IsDeleted);

        // Apply Filter

        var filteredFeedbacks =
            allFeedbacks.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            filteredFeedbacks =
                status.ToLower() switch
                {
                    "open" =>
                        filteredFeedbacks.Where(x =>
                            x.Status ==
                            FeedbackStatus.Open),

                    "resolved" =>
                        filteredFeedbacks.Where(x =>
                            x.Status ==
                            FeedbackStatus.Resolved),

                    _ => throw new BadRequestException(
                        "Invalid feedback status filter")
                };
        }

        // Reviewer IDs

        var reviewerIds =
            allFeedbacks
                .Select(x =>
                    x.ReviewerUserId)
                .Distinct()
                .ToList();

        // Users

        var users =
            await _userRepository
                .FindAsync(x =>
                    reviewerIds.Contains(
                        x.Id)
                    ||
                    x.Id == userId);

        var userDictionary =
            users.ToDictionary(
                x => x.Id);

        // Roles

        var roles =
            await _roleRepository
                .GetAllAsync();

        var roleDictionary =
            roles.ToDictionary(
                x => x.Id,
                x => x.RoleName.ToString());

        // Resolutions

        var feedbackIds =
            allFeedbacks
                .Select(x => x.Id)
                .ToList();

        var resolutions =
            await _feedbackResolutionRepository
                .FindAsync(x =>
                    feedbackIds.Contains(
                        x.FeedbackId));

        var latestResolutionDictionary =
            resolutions
                .GroupBy(x =>
                    x.FeedbackId)
                .ToDictionary(
                    x => x.Key,
                    x => x
                        .OrderByDescending(
                            y => y.CreatedAt)
                        .First());

        // User Summary

        var userSummary =
            new UserSummaryDto
            {
                Id = requestedUser.Id,

                FullName =
                    requestedUser.FullName,

                RoleName =
                    roleDictionary[
                        requestedUser.RoleId
                    ],

                OpenFeedbackCount =
                    allFeedbacks.Count(x =>
                        x.Status ==
                        FeedbackStatus.Open),

                ResolvedFeedbackCount =
                    allFeedbacks.Count(x =>
                        x.Status ==
                        FeedbackStatus.Resolved)
            };

        // Feedback Cards

        var feedbackCards =
            filteredFeedbacks
                .OrderByDescending(x =>
                    x.CreatedAt)
                .Select(x =>
                {
                    latestResolutionDictionary
                        .TryGetValue(
                            x.Id,
                            out var resolution);

                    return new FeedbackCardDto
                    {
                        Id = x.Id,

                        ReviewerName =
                            userDictionary[
                                x.ReviewerUserId]
                            .FullName,

                        Title = x.Title,

                        Status =
                            x.Status.ToString(),

                        CreatedAt =
                            x.CreatedAt,

                        ResolutionMessage =
                            resolution?.Message,

                        ResolutionCreatedAt =
                            resolution?.CreatedAt
                    };
                })
                .ToList();

        // Response

        return new UserProjectFeedbacksDto
        {
            User = userSummary,

            Feedbacks =
                feedbackCards
        };
    }
}