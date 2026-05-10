import axiosInstance from "../utils/axiosInstance";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export const loginUser = async (
  payload: LoginRequest
): Promise<LoginResponse> => {
  const response = await axiosInstance.post(
    "/Auth/login",
    payload,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const logoutUser = async (): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.post("/Auth/logout");
  return response.data;
};

export const getMe = async (): Promise<LoginResponse> => {
  const response = await axiosInstance.get(
    "/Auth/me",
    {
      withCredentials: true,
    }
  );

  return response.data;
};