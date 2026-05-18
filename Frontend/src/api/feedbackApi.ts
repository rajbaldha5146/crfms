import type { SubmittedFeedbackCardDto } from "../types/feedback";
import axiosInstance from "../utils/axiosInstance";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Filter for submitted feedbacks
export interface SubmittedFeedbackFilter {
  status?: string;
  projectId?: number;
  revieweeId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

// Aggregated response for submitted feedbacks
export interface SubmittedFeedbackResponseDto {
  items: SubmittedFeedbackCardDto[];
  openCount: number;
  resolvedCount: number;
  totalCount: number;
  projects: DropdownOption[];
  reviewees: DropdownOption[];
  totalPages: number;
  currentPage: number;
}

export const getSubmittedFeedbacks = async (filter: SubmittedFeedbackFilter = {}) => {
  const response = await axiosInstance.get<
    ApiResponse<SubmittedFeedbackResponseDto>
  >("/feedback/submitted", {
    params: filter,
  });

  return response.data;
};

export const getReviewableUsers = async (
  projectId: number,
  search?: string
) => {
  const response = await axiosInstance.get("/feedback/reviewable-users", {
    params: {
      projectId,
      search,
    },
  });

  return response.data;
};

// DTOs
export interface CreateFeedbackRequestDto {
  projectId: number;

  revieweeUserId: number;

  title: string;

  description: string;
}

// Create Feedback
export const createFeedback = async (payload: CreateFeedbackRequestDto) => {
  const response = await axiosInstance.post<ApiResponse<null>>(
    "/feedback",
    payload
  );

  return response.data;
};

export interface FeedbackDetailDto {
  id: number;
  projectId: number;
  projectName: string;
  reviewerUserId: number;
  reviewerName: string;
  reviewerRole: string;
  revieweeUserId: number;
  revieweeName: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  resolutionMessage?: string;
  resolutionCreatedAt?: string;
  resolverUserId?: number;
  resolverName?: string;
}

export const getFeedbackDetails = async (feedbackId: number) => {
  const response = await axiosInstance.get<ApiResponse<FeedbackDetailDto>>(
    `/feedback/${feedbackId}`
  );

  return response.data;
};

export interface ReceivedFeedbackCardDto {
  id: number;
  projectName: string;
  reviewerName: string;
  revieweeName:string;
  reviewerRole: string;
  title: string;
  status: string;
  createdAt: string;
  resolutionMessage?: string | null;
  resolutionCreatedAt?: string | null;
}

// Filter for received feedbacks
export interface ReceivedFeedbackFilter {
  status?: string;
  projectId?: number;
  reviewerId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

// Dropdown option
export interface DropdownOption {
  id: number;
  name: string;
}

// Aggregated response
export interface ReceivedFeedbackResponseDto {
  items: ReceivedFeedbackCardDto[];
  openCount: number;
  resolvedCount: number;
  totalCount: number;
  projects: DropdownOption[];
  reviewers: DropdownOption[];
  totalPages: number;
  currentPage: number;
}

export const getReceivedFeedbacks = async (filter: ReceivedFeedbackFilter = {}) => {
  const response = await axiosInstance.get<
    ApiResponse<ReceivedFeedbackResponseDto>
  >("/feedback/received", {
    params: filter,
  });

  return response.data;
};

export interface ResolveFeedbackRequest {
  message: string;
}

export const resolveFeedback = async (
  feedbackId: number,
  data: ResolveFeedbackRequest
) => {
  const response = await axiosInstance.post(
    `/feedback/${feedbackId}/resolve`,
    data
  );

  return response.data;
};

// Hierarchy filters
export interface FeedbackHierarchyFilter {
  status?: string;
  projectId?: number;
  reviewerId?: number;
  revieweeId?: number;
  startDate?: string; // ISO string e.g. "2026-05-01"
  endDate?: string;
}

// Hierarchy response (stats + list in one call)
export interface FeedbackHierarchyResponseDto {
  feedbacks: ReceivedFeedbackCardDto[];
  openCount: number;
  resolvedCount: number;
  totalCount: number;
}

export const getHierarchy = async (filter: FeedbackHierarchyFilter = {}) => {
  const response = await axiosInstance.get<
    ApiResponse<FeedbackHierarchyResponseDto>
  >("/feedback/hierarchy", {
    params: filter,
  });

  return response.data;
};
