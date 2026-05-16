import type { SubmittedFeedbackCardDto } from "../types/feedback";
import axiosInstance from "../utils/axiosInstance";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getSubmittedFeedbacks = async (status?: string) => {
  const response = await axiosInstance.get<
    ApiResponse<SubmittedFeedbackCardDto[]>
  >("/feedback/submitted", {
    params: {
      status,
    },
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

export const getReceivedFeedbacks = async (status?: string) => {
  const response = await axiosInstance.get<
    ApiResponse<ReceivedFeedbackCardDto[]>
  >("/feedback/received", {
    params: {
      status,
    },
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

export const getHierarchyFeedbacks = async (status?: string, projectId?: number) => {
  const response = await axiosInstance.get<
    ApiResponse<ReceivedFeedbackCardDto[]>
  >("/feedback/hierarchy", {
    params: {
      status,
      projectId,
    },
  });

  return response.data;
};
