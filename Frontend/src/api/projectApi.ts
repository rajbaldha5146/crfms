import type { ProjectCardDto } from "../types/project";
import type { UserProjectFeedbacksDto } from "../types/projectFeedback";
import type { ProjectHierarchyNodeDto } from "../types/projectHierarchy";
import axiosInstance from "../utils/axiosInstance";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getMyProjectCards = async () => {
  const response = await axiosInstance.get<ApiResponse<ProjectCardDto[]>>(
    "/projects/my-project-cards"
  );

  return response.data;
};

export const getProjectHierarchy = async (projectId: number) => {
  const response = await axiosInstance.get<
    ApiResponse<ProjectHierarchyNodeDto[]>
  >(`/projects/${projectId}/hierarchy`);
  return response.data.data;
};

export const getUserProjectFeedbacks = async (
  projectId: number,
  userId: number,
  status?: string
) => {
  const response = await axiosInstance.get<
    ApiResponse<UserProjectFeedbacksDto>
  >(`/projects/${projectId}/users/${userId}/feedbacks`, {
    params: {
      status,
    },
  });

  return response.data;
};
