import type { HierarchyNodeDto } from "../types/hierarchy";
import axiosInstance from "../utils/axiosInstance";

export const getPmHierarchy = async () => {
  const response = await axiosInstance.get<{
    success: boolean;
    data: HierarchyNodeDto;
  }>("/pm/hierarchy");

  return response.data.data;
};

export const changeReportingPerson = async (
  childUserId: number,
  newParentUserId: number
) => {
  await axiosInstance.put(
    "/pm/hierarchy/change-reporting-person",
    {
      childUserId,
      newParentUserId,
    }
  );
};

export const getPmUserDetails = async (
  userId: number
) => {
  const response =
    await axiosInstance.get(
      `/pm/hierarchy/users/${userId}`
    );

  return response.data.data;
};