using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Exceptions;

namespace Application.Services;

public class FeedbackService : IFeedbackService
{
    private readonly IGenericRepository<Feedback>
        _feedbackRepository;

    private readonly IGenericRepository<FeedbackResolution>
        _feedbackResolutionRepository;

    private readonly IGenericRepository<Project>
        _projectRepository;

    private readonly IGenericRepository<User>
        _userRepository;

    private readonly IGenericRepository<ProjectAssignment>
        _projectAssignmentRepository;

    private readonly IGenericRepository<HierarchyMapping>
        _hierarchyRepository;

    private readonly IGenericRepository<Role>
        _roleRepository;

    private readonly INotificationService
        _notificationService;

    private readonly INotificationRepository
        _notificationRepository;

    public FeedbackService(
        IGenericRepository<Feedback> feedbackRepository,
        IGenericRepository<Project> projectRepository,
        IGenericRepository<User> userRepository,
        IGenericRepository<ProjectAssignment>
            projectAssignmentRepository,
        IGenericRepository<HierarchyMapping>
            hierarchyRepository,
            IGenericRepository<Role> roleRepository,
            IGenericRepository<FeedbackResolution> feedbackResolutionRepository,
            INotificationService notificationService,
            INotificationRepository notificationRepository)
    {
        _feedbackRepository = feedbackRepository;
        _projectRepository = projectRepository;
        _userRepository = userRepository;
        _projectAssignmentRepository =
            projectAssignmentRepository;
        _hierarchyRepository = hierarchyRepository;
        _roleRepository = roleRepository;
        _feedbackResolutionRepository = feedbackResolutionRepository;
        _notificationService = notificationService;
        _notificationRepository = notificationRepository;
    }

    private async Task<bool> IsUserUnderHierarchyAsync(
    int reviewerUserId,
    int revieweeUserId)
    {
        var mappings =
            await _hierarchyRepository.GetAllAsync();

        var hierarchyLookup = mappings
            .GroupBy(x => x.ParentUserId)
            .ToDictionary(
                x => x.Key,
                x => x.Select(y => y.ChildUserId).ToList());

        var visited = new HashSet<int>();

        return TraverseHierarchy(
            reviewerUserId,
            revieweeUserId,
            hierarchyLookup,
            visited);
    }

    private bool TraverseHierarchy(
    int currentUserId,
    int targetUserId,
    Dictionary<int, List<int>> hierarchyLookup,
    HashSet<int> visited)
    {
        // Prevent infinite loops
        if (visited.Contains(currentUserId))
        {
            return false;
        }

        visited.Add(currentUserId);

        // No children
        if (!hierarchyLookup.ContainsKey(currentUserId))
        {
            return false;
        }

        var children =
            hierarchyLookup[currentUserId];

        // Direct child found
        if (children.Contains(targetUserId))
        {
            return true;
        }

        // Recursive traversal
        foreach (var child in children)
        {
            if (TraverseHierarchy(
                child,
                targetUserId,
                hierarchyLookup,
                visited))
            {
                return true;
            }
        }

        return false;
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

    public async Task<CreateFeedbackResponseDto>
        CreateFeedbackAsync(
            CreateFeedbackRequestDto request,
            int reviewerUserId)
    {
        // Project Validation
        var project = await _projectRepository
            .FirstOrDefaultAsync(x =>
                x.Id == request.ProjectId &&
                x.Status == ProjectStatus.Active);

        if (project == null)
        {
            throw new NotFoundException(
                "Project not found");
        }

        // Reviewee Validation
        var reviewee = await _userRepository
            .FirstOrDefaultAsync(x =>
                x.Id == request.RevieweeUserId &&
                x.Status == UserStatus.Active);

        if (reviewee == null)
        {
            throw new NotFoundException(
                "Reviewee not found");
        }

        // Self Review Validation
        if (reviewerUserId == request.RevieweeUserId)
        {
            throw new BadRequestException(
                "You cannot submit feedback to yourself");
        }

        // Reviewer Assigned Validation
        var reviewerAssigned =
            await _projectAssignmentRepository
                .AnyAsync(x =>
                    x.ProjectId == request.ProjectId &&
                    x.UserId == reviewerUserId);

        if (!reviewerAssigned)
        {
            throw new ForbiddenException(
                "Reviewer is not assigned to this project");
        }

        // Reviewee Assigned Validation
        var revieweeAssigned =
            await _projectAssignmentRepository
                .AnyAsync(x =>
                    x.ProjectId == request.ProjectId &&
                    x.UserId == request.RevieweeUserId);

        if (!revieweeAssigned)
        {
            throw new ForbiddenException(
                "Reviewee is not assigned to this project");
        }

        // Hierarchy Validation
        var hierarchyExists = await IsUserUnderHierarchyAsync(
            reviewerUserId,
            request.RevieweeUserId);

        if (!hierarchyExists)
        {
            throw new ForbiddenException(
                "You can only review users under your hierarchy");
        }

        // Create Feedback
        var feedback = new Feedback
        {
            ProjectId = request.ProjectId,
            ReviewerUserId = reviewerUserId,
            RevieweeUserId = request.RevieweeUserId,
            Title = request.Title,
            Description = request.Description,
            Status = FeedbackStatus.Open,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = reviewerUserId
        };

        await _feedbackRepository.AddAsync(feedback);

        await _feedbackRepository.SaveChangesAsync();

        // =========================
        // Notification Logic
        // =========================

        // Reviewer Details

        var reviewer =
            await _userRepository
                .GetByIdAsync(
                    reviewerUserId);

        // Load Hierarchy

        var mappings =
            await _hierarchyRepository
                .GetAllAsync();

        // Notify Users

        var notifyUserIds =
            new HashSet<int>();

        // Add Reviewee

        notifyUserIds.Add(
            request.RevieweeUserId);

        // Traverse Parent Hierarchy

        var currentUserId =
            request.RevieweeUserId;

        while (true)
        {
            var parent =
                mappings
                    .FirstOrDefault(x =>
                        x.ChildUserId ==
                        currentUserId);

            if (parent == null)
            {
                break;
            }

            // Exclude Creator

            if (parent.ParentUserId !=
                reviewerUserId)
            {
                notifyUserIds.Add(
                    parent.ParentUserId);
            }

            currentUserId =
                parent.ParentUserId;
        }

        // Create Notifications

        foreach (var notifyUserId
            in notifyUserIds)
        {
            // Notification Entity

            var notification =
                new Notification
                {
                    UserId =
                        notifyUserId,

                    TriggeredByUserId =
                        reviewerUserId,

                    Title =
                        "New Feedback Assigned",

                    Message =
                        $"{reviewer?.FullName} assigned feedback to {reviewee.FullName}",

                    Type =
                        NotificationType
                            .FeedbackReceived,

                    FeedbackId =
                        feedback.Id,

                    IsRead = false,

                    CreatedAt =
                        DateTime.UtcNow
                };

            // Save Notification

            await _notificationRepository
                .AddAsync(
                    notification);

            await _notificationRepository
                .SaveChangesAsync();

            // SignalR Push

            await _notificationService
                .SendRealtimeNotificationAsync(
                    notifyUserId,
                    new RealtimeNotificationDto
                    {
                        Id =
                            notification.Id,

                        Title =
                            notification.Title,

                        Message =
                            notification.Message,

                        Type =
                            notification.Type
                                .ToString(),

                        IsRead =
                            notification.IsRead,

                        FeedbackId =
                            notification.FeedbackId,

                        TriggeredByName =
                            reviewer?.FullName
                            ?? string.Empty,

                        CreatedAt =
                            notification.CreatedAt
                    });
        }

        return new CreateFeedbackResponseDto
        {
            Id = feedback.Id,
            ProjectId = feedback.ProjectId,
            ReviewerUserId =
                feedback.ReviewerUserId,
            RevieweeUserId =
                feedback.RevieweeUserId,
            Title = feedback.Title,
            Description = feedback.Description,
            Status = feedback.Status.ToString(),
            CreatedAt = feedback.CreatedAt
        };
    }

    public async Task<
    IEnumerable<
        ReviewableUserResponseDto>>
    GetReviewableUsersAsync(
        int projectId,
        string? search,
        int reviewerUserId)
    {
        // Validate Project
        var project =
            await _projectRepository
                .FirstOrDefaultAsync(x =>
                    x.Id == projectId &&
                    x.Status == ProjectStatus.Active);

        if (project == null)
        {
            throw new NotFoundException(
                "Project not found");
        }

        // Validate Reviewer Assignment
        var reviewerAssigned =
            await _projectAssignmentRepository
                .AnyAsync(x =>
                    x.ProjectId == projectId &&
                    x.UserId == reviewerUserId);

        if (!reviewerAssigned)
        {
            throw new ForbiddenException(
                "You are not assigned to this project");
        }

        // Get All Hierarchy Mappings
        var mappings =
            await _hierarchyRepository
                .GetAllAsync();

        // Get All Descendants
        var descendantIds =
            GetAllDescendantUserIds(
                reviewerUserId,
                mappings);

        if (!descendantIds.Any())
        {
            return Enumerable.Empty<
                ReviewableUserResponseDto>();
        }

        // Get Assigned Users
        var projectAssignments =
            await _projectAssignmentRepository
                .FindAsync(x =>
                    x.ProjectId == projectId &&
                    descendantIds.Contains(x.UserId));

        var assignedUserIds =
            projectAssignments
                .Select(x => x.UserId)
                .Distinct()
                .ToList();

        // Get Users
        var users =
            await _userRepository
                .FindAsync(x =>
                    assignedUserIds.Contains(x.Id) &&
                    x.Status == UserStatus.Active);

        // Apply Search

        if (!string.IsNullOrWhiteSpace(search))
        {
            users =
                users.Where(x =>
                    x.FullName.Contains(
                        search,
                        StringComparison
                            .OrdinalIgnoreCase));
        }

        // Get Roles
        var roles =
            await _roleRepository.GetAllAsync();

        return users
            .OrderBy(x =>
                x.FullName)
            .Select(x =>
                new ReviewableUserResponseDto
                {
                    Id = x.Id,

                    FullName =
                        x.FullName,

                    RoleName =
                        x.RoleId switch
                        {
                            1 => "Admin",
                            2 => "Pm",
                            3 => "Tl",
                            4 => "SeniorDeveloper",
                            5 => "JuniorDeveloper",
                            _ => "Unknown"
                        }
                });
    }

    public async Task<ReceivedFeedbackResponseDto> GetMyReceivedFeedbacksAsync(
        int userId,
        ReceivedFeedbackFilterDto filter)
    {
        // 1. Fetch ALL feedbacks for this reviewee in one query (no status filter in DB)
        var feedbacks = (await _feedbackRepository.FindAsync(x =>
            x.RevieweeUserId == userId &&
            !x.IsDeleted
        )).ToList();

        if (!feedbacks.Any())
        {
            return new ReceivedFeedbackResponseDto { CurrentPage = filter.Page };
        }

        // 2. Load related data up front (needed for dropdowns AND mapping)
        var projectIds  = feedbacks.Select(x => x.ProjectId).Distinct().ToList();
        var reviewerIds = feedbacks.Select(x => x.ReviewerUserId).Distinct().ToList();
        var revieweeIds = feedbacks.Select(x => x.RevieweeUserId).Distinct().ToList();

        var projects  = (await _projectRepository.FindAsync(x => projectIds.Contains(x.Id))).ToList();
        var users     = (await _userRepository.FindAsync(x => reviewerIds.Contains(x.Id) || revieweeIds.Contains(x.Id))).ToList();
        var roles     = (await _roleRepository.GetAllAsync()).ToList();

        var projectDictionary = projects.ToDictionary(x => x.Id, x => x);
        var userDictionary    = users.ToDictionary(x => x.Id, x => x);
        var roleDictionary    = roles.ToDictionary(x => x.Id, x => x.RoleName.ToString());

        // 3. Apply in-memory filters

        // Project filter
        if (filter.ProjectId.HasValue)
            feedbacks = feedbacks.Where(x => x.ProjectId == filter.ProjectId.Value).ToList();

        // Reviewer filter
        if (filter.ReviewerId.HasValue)
            feedbacks = feedbacks.Where(x => x.ReviewerUserId == filter.ReviewerId.Value).ToList();

        // Date range filter
        if (filter.StartDate.HasValue)
            feedbacks = feedbacks.Where(x => x.CreatedAt >= filter.StartDate.Value).ToList();

        if (filter.EndDate.HasValue)
            feedbacks = feedbacks.Where(x => x.CreatedAt <= filter.EndDate.Value).ToList();

        // 4. Build dropdown options from the post-filter set (before status filter for full context)
        var projectDropdowns = feedbacks
            .Select(x => x.ProjectId)
            .Distinct()
            .Where(id => projectDictionary.ContainsKey(id))
            .Select(id => new DropdownDto { Id = id, Name = projectDictionary[id].Name })
            .OrderBy(x => x.Name)
            .ToList();

        var reviewerDropdowns = feedbacks
            .Select(x => x.ReviewerUserId)
            .Distinct()
            .Where(id => userDictionary.ContainsKey(id))
            .Select(id => new DropdownDto { Id = id, Name = userDictionary[id].FullName })
            .OrderBy(x => x.Name)
            .ToList();

        // 5. Compute stats BEFORE applying status filter
        var openCount     = feedbacks.Count(x => x.Status == FeedbackStatus.Open);
        var resolvedCount = feedbacks.Count(x => x.Status == FeedbackStatus.Resolved);
        var totalCount    = feedbacks.Count;

        // 6. Apply status filter for the items list
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var parsedStatus = Enum.Parse<FeedbackStatus>(filter.Status, true);
            feedbacks = feedbacks.Where(x => x.Status == parsedStatus).ToList();
        }

        // 7. Sort + Pagination
        var sorted = feedbacks.OrderByDescending(x => x.CreatedAt).ToList();
        var pagedFeedbacks = sorted
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToList();

        var totalPages = (int)Math.Ceiling(feedbacks.Count / (double)filter.PageSize);

        // 8. Load resolutions only for the paged set
        var pagedIds = pagedFeedbacks.Select(x => x.Id).ToList();
        var resolutions = await _feedbackResolutionRepository.FindAsync(x => pagedIds.Contains(x.FeedbackId));
        var resolutionDictionary = resolutions
            .GroupBy(x => x.FeedbackId)
            .ToDictionary(x => x.Key, x => x.OrderByDescending(r => r.CreatedAt).First());

        // 9. Map to DTOs
        var items = pagedFeedbacks.Select(x => new ReceivedFeedbackCardDto
        {
            Id              = x.Id,
            ProjectName     = projectDictionary.ContainsKey(x.ProjectId) ? projectDictionary[x.ProjectId].Name : string.Empty,
            ReviewerName    = userDictionary.ContainsKey(x.ReviewerUserId) ? userDictionary[x.ReviewerUserId].FullName : string.Empty,
            RevieweeName    = userDictionary.ContainsKey(x.RevieweeUserId) ? userDictionary[x.RevieweeUserId].FullName : string.Empty,
            ReviewerRole    = userDictionary.ContainsKey(x.ReviewerUserId) && roleDictionary.ContainsKey(userDictionary[x.ReviewerUserId].RoleId)
                                ? roleDictionary[userDictionary[x.ReviewerUserId].RoleId]
                                : string.Empty,
            Title           = x.Title,
            Status          = x.Status.ToString(),
            ResolutionMessage    = resolutionDictionary.ContainsKey(x.Id) ? resolutionDictionary[x.Id].Message    : null,
            ResolutionCreatedAt  = resolutionDictionary.ContainsKey(x.Id) ? resolutionDictionary[x.Id].CreatedAt  : null,
            CreatedAt       = x.CreatedAt
        }).ToList();

        return new ReceivedFeedbackResponseDto
        {
            Items         = items,
            OpenCount     = openCount,
            ResolvedCount = resolvedCount,
            TotalCount    = totalCount,
            Projects      = projectDropdowns,
            Reviewers     = reviewerDropdowns,
            CurrentPage   = filter.Page,
            TotalPages    = totalPages
        };
    }

    public async Task<FeedbackDetailDto>
    GetFeedbackDetailsAsync(
        int feedbackId,
        int loggedInUserId)
    {
        var feedback =
            await _feedbackRepository
                .FirstOrDefaultAsync(x =>
                    x.Id == feedbackId &&
                    !x.IsDeleted);

        if (feedback == null)
        {
            throw new NotFoundException(
                "Feedback not found");
        }

        // SECURITY CHECK

        // Direct Access

        bool hasAccess =
            feedback.ReviewerUserId ==
            loggedInUserId
            ||
            feedback.RevieweeUserId ==
            loggedInUserId;

        // Hierarchy Access

        if (!hasAccess)
        {
            var mappings =
                await _hierarchyRepository
                    .GetAllAsync();

            var descendantIds =
                GetAllDescendantUserIds(
                    loggedInUserId,
                    mappings);

            hasAccess =
                descendantIds.Contains(
                    feedback.RevieweeUserId);
        }

        if (!hasAccess)
        {
            throw new ForbiddenException(
                "You are not authorized to access this feedback");
        }

        // Load Project

        var project =
            await _projectRepository
                .GetByIdAsync(
                    feedback.ProjectId);

        // Load Reviewer

        var reviewer =
            await _userRepository
                .GetByIdAsync(
                    feedback.ReviewerUserId);

        // Load Reviewee

        var reviewee =
            await _userRepository
                .GetByIdAsync(
                    feedback.RevieweeUserId);

        // Load Resolution

        var resolution =
            await _feedbackResolutionRepository
                .FirstOrDefaultAsync(x =>
                    x.FeedbackId ==
                    feedback.Id);

        User? resolver = null;

        if (resolution != null)
        {
            resolver =
                await _userRepository
                    .GetByIdAsync(
                        resolution
                            .ResolverUserId);
        }

        // Load Roles

        var roles =
            await _roleRepository
                .GetAllAsync();

        var roleDictionary =
            roles.ToDictionary(
                x => x.Id,
                x => x.RoleName.ToString());

        return new FeedbackDetailDto
        {
            Id = feedback.Id,

            ProjectId =
                feedback.ProjectId,

            ProjectName =
                project?.Name ?? string.Empty,

            ReviewerUserId =
                reviewer!.Id,

            ReviewerName =
                reviewer.FullName,

            ReviewerRole =
                roleDictionary[
                    reviewer.RoleId],

            RevieweeUserId =
                reviewee!.Id,

            RevieweeName =
                reviewee.FullName,

            Title =
                feedback.Title,

            Description =
                feedback.Description,

            Status =
                feedback.Status.ToString(),

            CreatedAt =
                feedback.CreatedAt,

            ResolutionMessage =
                resolution?.Message,

            ResolutionCreatedAt =
                resolution?.CreatedAt,

            ResolverUserId =
                resolution?.ResolverUserId,

            ResolverName =
                resolver?.FullName
        };
    }

    public async Task ResolveFeedbackAsync(
    int feedbackId,
    int loggedInUserId,
    ResolveFeedbackRequestDto request)
    {
        var feedback =
            await _feedbackRepository
                .FirstOrDefaultAsync(x =>
                    x.Id == feedbackId &&
                    !x.IsDeleted);

        if (feedback == null)
        {
            throw new NotFoundException(
                "Feedback not found");
        }

        // Only reviewee can resolve

        if (feedback.RevieweeUserId != loggedInUserId)
        {
            throw new ForbiddenException(
                "Only reviewee can resolve feedback");
        }

        // Validate status transition

        if (feedback.Status == FeedbackStatus.Resolved)
        {
            throw new BadRequestException(
                "Feedback already resolved");
        }

        // Create resolution

        var resolution =
            new FeedbackResolution
            {
                FeedbackId = feedback.Id,

                ResolverUserId = loggedInUserId,

                Message = request.Message,

                CreatedAt = DateTime.UtcNow
            };

        await _feedbackResolutionRepository
            .AddAsync(resolution);

        // Update feedback status

        feedback.Status =
            FeedbackStatus.Resolved;

        feedback.ModifiedAt =
            DateTime.UtcNow;

        feedback.ModifiedBy =
            loggedInUserId;

        _feedbackRepository.Update(feedback);

        await _feedbackRepository
            .SaveChangesAsync();

        // =========================
        // Notification Logic
        // =========================

        // Resolver Details

        var resolver =
            await _userRepository
                .GetByIdAsync(
                    loggedInUserId);

        // Notification

        var notification =
            new Notification
            {
                UserId =
                    feedback.ReviewerUserId,

                TriggeredByUserId =
                    loggedInUserId,

                Title =
                    "Feedback Resolved",

                Message =
                    $"{resolver?.FullName} resolved your feedback",

                Type =
                    NotificationType
                        .FeedbackResolved,

                FeedbackId =
                    feedback.Id,

                IsRead = false,

                CreatedAt =
                    DateTime.UtcNow
            };

        // Save

        await _notificationRepository
            .AddAsync(
                notification);

        await _notificationRepository
            .SaveChangesAsync();

        // SignalR Push

        await _notificationService
            .SendRealtimeNotificationAsync(
                feedback.ReviewerUserId,
                new RealtimeNotificationDto
                {
                    Id =
                        notification.Id,

                    Title =
                        notification.Title,

                    Message =
                        notification.Message,

                    Type =
                        notification.Type
                            .ToString(),

                    IsRead =
                        notification.IsRead,

                    FeedbackId =
                        notification.FeedbackId,

                    TriggeredByName =
                        resolver?.FullName
                        ?? string.Empty,

                    CreatedAt =
                        notification.CreatedAt
                });
    }

    public async Task<SubmittedFeedbackResponseDto> GetSubmittedFeedbacksAsync(
        int loggedInUserId,
        SubmittedFeedbackFilterDto filter)
    {
        // 1. Fetch ALL feedbacks where user is reviewer (no status filter in DB)
        var feedbacks = (await _feedbackRepository.FindAsync(x =>
            x.ReviewerUserId == loggedInUserId &&
            !x.IsDeleted
        )).ToList();

        if (!feedbacks.Any())
        {
            return new SubmittedFeedbackResponseDto { CurrentPage = filter.Page };
        }

        // 2. Load related data up front
        var projectIds  = feedbacks.Select(x => x.ProjectId).Distinct().ToList();
        var revieweeIds = feedbacks.Select(x => x.RevieweeUserId).Distinct().ToList();

        var projects  = (await _projectRepository.FindAsync(x => projectIds.Contains(x.Id))).ToList();
        var users     = (await _userRepository.FindAsync(x => revieweeIds.Contains(x.Id))).ToList();

        var projectDictionary = projects.ToDictionary(x => x.Id, x => x);
        var userDictionary    = users.ToDictionary(x => x.Id, x => x);

        // 3. Apply in-memory filters

        // Project filter
        if (filter.ProjectId.HasValue)
            feedbacks = feedbacks.Where(x => x.ProjectId == filter.ProjectId.Value).ToList();

        // Reviewee filter
        if (filter.RevieweeId.HasValue)
            feedbacks = feedbacks.Where(x => x.RevieweeUserId == filter.RevieweeId.Value).ToList();

        // Date range filter
        if (filter.StartDate.HasValue)
            feedbacks = feedbacks.Where(x => x.CreatedAt >= filter.StartDate.Value).ToList();

        if (filter.EndDate.HasValue)
            feedbacks = feedbacks.Where(x => x.CreatedAt <= filter.EndDate.Value).ToList();

        // 4. Build dropdown options from the post-filter set (before status filter for full context)
        var projectDropdowns = feedbacks
            .Select(x => x.ProjectId)
            .Distinct()
            .Where(id => projectDictionary.ContainsKey(id))
            .Select(id => new DropdownDto { Id = id, Name = projectDictionary[id].Name })
            .OrderBy(x => x.Name)
            .ToList();

        var revieweeDropdowns = feedbacks
            .Select(x => x.RevieweeUserId)
            .Distinct()
            .Where(id => userDictionary.ContainsKey(id))
            .Select(id => new DropdownDto { Id = id, Name = userDictionary[id].FullName })
            .OrderBy(x => x.Name)
            .ToList();

        // 5. Compute stats BEFORE applying status filter
        var openCount     = feedbacks.Count(x => x.Status == FeedbackStatus.Open);
        var resolvedCount = feedbacks.Count(x => x.Status == FeedbackStatus.Resolved);
        var totalCount    = feedbacks.Count;

        // 6. Apply status filter for the items list
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var parsedStatus = Enum.Parse<FeedbackStatus>(filter.Status, true);
            feedbacks = feedbacks.Where(x => x.Status == parsedStatus).ToList();
        }

        // 7. Sort + Pagination
        var sorted = feedbacks.OrderByDescending(x => x.CreatedAt).ToList();
        var pagedFeedbacks = sorted
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToList();

        var totalPages = (int)Math.Ceiling(feedbacks.Count / (double)filter.PageSize);

        // 8. Load resolutions only for the paged set
        var pagedIds = pagedFeedbacks.Select(x => x.Id).ToList();
        var resolutions = await _feedbackResolutionRepository.FindAsync(x => pagedIds.Contains(x.FeedbackId));
        var resolutionDictionary = resolutions
            .GroupBy(x => x.FeedbackId)
            .ToDictionary(x => x.Key, x => x.OrderByDescending(r => r.CreatedAt).First());

        // 9. Map to DTOs
        var items = pagedFeedbacks.Select(x => new SubmittedFeedbackCardDto
        {
            Id              = x.Id,
            ProjectName     = projectDictionary.ContainsKey(x.ProjectId) ? projectDictionary[x.ProjectId].Name : string.Empty,
            ReviewerName    = string.Empty, // Context is self, don't necessarily need this, but to be safe we can leave it empty or fetch self. The DTO expects it?
            RevieweeName    = userDictionary.ContainsKey(x.RevieweeUserId) ? userDictionary[x.RevieweeUserId].FullName : string.Empty,
            Title           = x.Title,
            Status          = x.Status.ToString(),
            ResolutionMessage    = resolutionDictionary.ContainsKey(x.Id) ? resolutionDictionary[x.Id].Message    : null,
            ResolutionCreatedAt  = resolutionDictionary.ContainsKey(x.Id) ? resolutionDictionary[x.Id].CreatedAt  : null,
            CreatedAt       = x.CreatedAt
        }).ToList();

        return new SubmittedFeedbackResponseDto
        {
            Items         = items,
            OpenCount     = openCount,
            ResolvedCount = resolvedCount,
            TotalCount    = totalCount,
            Projects      = projectDropdowns,
            Reviewees     = revieweeDropdowns,
            CurrentPage   = filter.Page,
            TotalPages    = totalPages
        };
    }

    public async Task<FeedbackHierarchyResponseDto> GetHierarchyAsync(int loggedInUserId, FeedbackHierarchyFilterDto filter)
    {
        // 1. Get all hierarchy mappings
        var allMappings = await _hierarchyRepository.GetAllAsync();

        // 2. Get all descendants of the logged-in user
        var descendantUserIds = GetAllDescendantUserIds(loggedInUserId, allMappings);

        if (!descendantUserIds.Any())
        {
            return new FeedbackHierarchyResponseDto();
        }

        // 3. Fetch ALL feedbacks for descendants in ONE DB query (no status filter here)
        var feedbacks = (await _feedbackRepository.FindAsync(x =>
            descendantUserIds.Contains(x.RevieweeUserId) &&
            !x.IsDeleted
        )).ToList();

        // 4. Apply in-memory filters

        // Project filter
        if (filter.ProjectId.HasValue)
        {
            feedbacks = feedbacks
                .Where(x => x.ProjectId == filter.ProjectId.Value)
                .ToList();
        }

        // Reviewer filter
        if (filter.ReviewerId.HasValue)
        {
            feedbacks = feedbacks
                .Where(x => x.ReviewerUserId == filter.ReviewerId.Value)
                .ToList();
        }

        // Reviewee filter
        if (filter.RevieweeId.HasValue)
        {
            feedbacks = feedbacks
                .Where(x => x.RevieweeUserId == filter.RevieweeId.Value)
                .ToList();
        }

        // Date range filter
        if (filter.StartDate.HasValue)
        {
            feedbacks = feedbacks
                .Where(x => x.CreatedAt >= filter.StartDate.Value)
                .ToList();
        }

        if (filter.EndDate.HasValue)
        {
            feedbacks = feedbacks
                .Where(x => x.CreatedAt <= filter.EndDate.Value)
                .ToList();
        }

        // 5. Compute stats BEFORE applying status filter (so counts reflect full scope)
        var openCount = feedbacks.Count(x => x.Status == FeedbackStatus.Open);
        var resolvedCount = feedbacks.Count(x => x.Status == FeedbackStatus.Resolved);
        var totalCount = feedbacks.Count;

        // 6. Now apply status filter for the displayed list
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var parsedStatus = Enum.Parse<FeedbackStatus>(filter.Status, true);
            feedbacks = feedbacks
                .Where(x => x.Status == parsedStatus)
                .ToList();
        }

        if (!feedbacks.Any())
        {
            return new FeedbackHierarchyResponseDto
            {
                OpenCount = openCount,
                ResolvedCount = resolvedCount,
                TotalCount = totalCount
            };
        }

        // 7. Load related data
        var feedbackIds = feedbacks.Select(x => x.Id).Distinct().ToList();
        var projectIds = feedbacks.Select(x => x.ProjectId).Distinct().ToList();
        var reviewerIds = feedbacks.Select(x => x.ReviewerUserId).Distinct().ToList();
        var revieweeIds = feedbacks.Select(x => x.RevieweeUserId).Distinct().ToList();

        var projects = await _projectRepository.FindAsync(x => projectIds.Contains(x.Id));
        var users = await _userRepository.FindAsync(x => reviewerIds.Contains(x.Id) || revieweeIds.Contains(x.Id));
        var roles = await _roleRepository.GetAllAsync();
        var resolutions = await _feedbackResolutionRepository.FindAsync(x => feedbackIds.Contains(x.FeedbackId));

        var projectDictionary = projects.ToDictionary(x => x.Id, x => x.Name);
        var userDictionary = users.ToDictionary(x => x.Id, x => x);
        var roleDictionary = roles.ToDictionary(x => x.Id, x => x.RoleName.ToString());
        var resolutionDictionary = resolutions
            .GroupBy(x => x.FeedbackId)
            .ToDictionary(x => x.Key, x => x.OrderByDescending(r => r.CreatedAt).First());

        // 8. Map to DTOs
        var feedbackDtos = feedbacks.OrderByDescending(x => x.CreatedAt).Select(x => new ReceivedFeedbackCardDto
        {
            Id = x.Id,
            ProjectName = projectDictionary[x.ProjectId],
            ReviewerName = userDictionary[x.ReviewerUserId].FullName,
            RevieweeName = userDictionary[x.RevieweeUserId].FullName,
            ReviewerRole = roleDictionary[userDictionary[x.ReviewerUserId].RoleId],
            Title = x.Title,
            Status = x.Status.ToString(),
            ResolutionMessage = resolutionDictionary.ContainsKey(x.Id) ? resolutionDictionary[x.Id].Message : null,
            ResolutionCreatedAt = resolutionDictionary.ContainsKey(x.Id) ? resolutionDictionary[x.Id].CreatedAt : null,
            CreatedAt = x.CreatedAt
        }).ToList();

        return new FeedbackHierarchyResponseDto
        {
            Feedbacks = feedbackDtos,
            OpenCount = openCount,
            ResolvedCount = resolvedCount,
            TotalCount = totalCount
        };
    }
}
