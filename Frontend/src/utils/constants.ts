export const API_BASE_URL = "http://localhost:5108/api";

export enum ROLES {
  ADMIN = "ADMIN",
  PM = "PM",
  TL = "TL",
  SENIOR = "SENIOR",
  JUNIOR = "JUNIOR",
}

export enum FEEDBACK_STATUS {}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
  }

  export interface ApiErrorResponse {
    success: boolean;
    statusCode: number;
    message: string;
    errorCode: string;
    errors: string[];
    timestamp: string;
  }
