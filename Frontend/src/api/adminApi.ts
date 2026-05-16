import axiosInstance from "../utils/axiosInstance";

// =========================================
// DTOs
// =========================================

export interface DropdownItem {
  id: number;
  name: string;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  experience: string;
  department: string;
  gender: string;
  mobileNumber: string;
  roleId: number;
  pmUserId?: number;
}

// =========================================
// Create User
// =========================================

export const createUser = async (payload: CreateUserRequest) => {
  const response = await axiosInstance.post("/admin/users", payload);

  return response.data;
};

// =========================================
// Lookups
// =========================================

export const getRoles = async () => {
  const response = await axiosInstance.get("/admin/lookups/roles");

  return response.data.data;
};

export const getDepartments = async () => {
  const response = await axiosInstance.get("/admin/lookups/departments");

  return response.data.data;
};

export const getGenders = async () => {
  const response = await axiosInstance.get("/admin/lookups/genders");

  return response.data.data;
};

export const getPmUsers = async (department?: string, isAdmin = false) => {
  const response = await axiosInstance.get("/admin/lookups/pm-users", {
    params: {
      department,
      isAdmin,
    },
  });

  return response.data.data;
};