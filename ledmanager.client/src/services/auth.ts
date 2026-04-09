import api from "./index";

export interface LoginRequest {
  userName: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  userName: string;
  email: string;
  expiration: string;
}

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/api/auth/login", data);
  return response.data;
};