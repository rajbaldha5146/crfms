import axiosInstance from "../utils/axiosInstance";

export const getProjects =
  async () => {
    const response =
      await axiosInstance.get(
        "/projects/my-project-cards"
      );

    return response.data.data;
  };

export const createProject =
  async (payload: {
    name: string;
    description: string;
  }) => {
    const response =
      await axiosInstance.post(
        "/pm/projects",
        payload
      );

    return response.data.data;
  };

  export const assignMembers =
  async (
    projectId: number,
    userIds: number[]
  ) => {
    const response =
      await axiosInstance.post(
        `/pm/projects/${projectId}/members`,
        {
          userIds,
        }
      );

    return response.data;
  };

export const removeMember =
  async (
    projectId: number,
    userId: number
  ) => {
    await axiosInstance.delete(
      `/pm/projects/${projectId}/members/${userId}`
    );
  };