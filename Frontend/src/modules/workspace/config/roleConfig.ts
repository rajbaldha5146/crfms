// This defines WHAT each role can do and HOW they navigate

export type UserRole = "PM" | "TL" | "SeniorDeveloper" | "JuniorDeveloper";

export interface RoleConfig {
  role: UserRole;
  label: string;

  // Routes
  baseRoute: string;
  projectRoute: (projectId: number) => string;
  userRoute: (projectId: number, userId: number) => string;
  createFeedbackRoute: (projectId: number, userId?: number) => string;
  feedbackDetailsRoute: (feedbackId: number) => string;

  // Permissions
  canCreateFeedback: boolean;
  canResolveFeedback: boolean;
  canViewHierarchy: boolean;
  canViewProjects: boolean;

  // UI Visibility
  showReviewerInCard: boolean;
  showRevieweeInCard: boolean;
  showResolutionPreview: boolean;
}

const roleConfigs: Record<UserRole, RoleConfig> = {
  //   PM: {
  //     role: "PM",
  //     label: "Project Manager",
  //     baseRoute: "/pm-projects",
  //     projectRoute: (projectId) => `/pm-projects/${projectId}`,
  //     userRoute: (projectId, userId) =>
  //       `/pm-projects/${projectId}/users/${userId}`,
  //     createFeedbackRoute: (projectId, userId) =>
  //       `/pm-projects/${projectId}/create-feedback${
  //         userId ? `?user=${userId}` : ""
  //       }`,
  //     feedbackDetailsRoute: (feedbackId) => `/feedbacks/${feedbackId}`,

  //     canCreateFeedback: true,
  //     canResolveFeedback: false,
  //     canViewHierarchy: true,
  //     canViewProjects: true,

  //     showReviewerInCard: true,
  //     showRevieweeInCard: true,
  //     showResolutionPreview: true,
  //   },

  PM: {
    role: "PM",
    label: "Project Manager",
    baseRoute: "/workspace",
    projectRoute: (projectId) => `/workspace/projects/${projectId}`,
    userRoute: (projectId, userId) =>
      `/workspace/projects/${projectId}/users/${userId}`,
    createFeedbackRoute: (projectId, userId) =>
        userId
          ? `/workspace/projects/${projectId}/users/${userId}/create-feedback`
          : `/workspace/projects/${projectId}/create-feedback`,
      feedbackDetailsRoute: (feedbackId) => `/feedbacks/${feedbackId}`,
  
      canCreateFeedback: true,
      canResolveFeedback: false,
      canViewHierarchy: true,
      canViewProjects: true,
  
      showReviewerInCard: true,
      showRevieweeInCard: true,
      showResolutionPreview: true,
  },

  //   TL: {
  //     role: "TL",
  //     label: "Team Lead",
  //     baseRoute: "/tl-projects",
  //     projectRoute: (projectId) => `/tl-projects/${projectId}`,
  //     userRoute: (projectId, userId) => `/tl-projects/${projectId}/users/${userId}`,
  //     createFeedbackRoute: (projectId, userId) =>
  //       `/tl-projects/${projectId}/create-feedback${userId ? `?user=${userId}` : ""}`,
  //     feedbackDetailsRoute: (feedbackId) => `/feedbacks/${feedbackId}`,

  //     canCreateFeedback: true,
  //     canResolveFeedback: false,
  //     canViewHierarchy: true,
  //     canViewProjects: true,

  //     showReviewerInCard: true,
  //     showRevieweeInCard: true,
  //     showResolutionPreview: true,
  //   },

  TL: {
    role: "TL",
    label: "Team Lead",
    baseRoute: "/workspace",
    projectRoute: (projectId) => `/workspace/projects/${projectId}`,
    userRoute: (projectId, userId) =>
      `/workspace/projects/${projectId}/users/${userId}`,
    createFeedbackRoute: (projectId, userId) =>
      userId
        ? `/workspace/projects/${projectId}/users/${userId}/create-feedback`
        : `/workspace/projects/${projectId}/create-feedback`,
    feedbackDetailsRoute: (feedbackId) => `/feedbacks/${feedbackId}`,

    canCreateFeedback: true,
    canResolveFeedback: false,
    canViewHierarchy: true,
    canViewProjects: true,

    showReviewerInCard: true,
    showRevieweeInCard: true,
    showResolutionPreview: true,
  },

  SeniorDeveloper: {
    role: "SeniorDeveloper",
    label: "Senior Developer",
    baseRoute: "/workspace",
    projectRoute: (projectId) => `/workspace/projects/${projectId}`,
    userRoute: (projectId, userId) =>
      `/workspace/projects/${projectId}/users/${userId}`,
    createFeedbackRoute: (projectId, userId) =>
      `/workspace/projects/${projectId}/create-feedback${
        userId ? `?user=${userId}` : ""
      }`,
    feedbackDetailsRoute: (feedbackId) => `/feedbacks/${feedbackId}`,

    canCreateFeedback: true,
    canResolveFeedback: true,
    canViewHierarchy: false,
    canViewProjects: true,

    showReviewerInCard: true,
    showRevieweeInCard: true,
    showResolutionPreview: true,
  },

  JuniorDeveloper : {
    role: "JuniorDeveloper",
    label: "Junior Developer",
    baseRoute: "/workspace",
    projectRoute: (projectId) => `/workspace/projects/${projectId}`,
    userRoute: (projectId, userId) =>
      `/workspace/projects/${projectId}/users/${userId}`,
    createFeedbackRoute: (projectId, userId) =>
      `/workspace/projects/${projectId}/create-feedback${
        userId ? `?user=${userId}` : ""
      }`,
    feedbackDetailsRoute: (feedbackId) => `/feedbacks/${feedbackId}`,

    canCreateFeedback: false,
    canResolveFeedback: true,
    canViewHierarchy: false,
    canViewProjects: true,

    showReviewerInCard: true,
    showRevieweeInCard: true,
    showResolutionPreview: false,
  },
};

export const getRoleConfig = (role: UserRole | undefined): RoleConfig => {
  if (!role) {
    return roleConfigs.SeniorDeveloper; 
  }
  return roleConfigs[role as UserRole] || roleConfigs.SeniorDeveloper;
};

export const getRoleLabel = (role: UserRole | undefined): string => {
  return getRoleConfig(role).label;
};

export default roleConfigs;
