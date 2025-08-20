import apiClient from '../client/apiClient';
import { User } from '../../../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
  return response.data;
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  await apiClient.post('/auth/forgot-password', { email });
};

export const resetPassword = async (token: string, password: string): Promise<void> => {
  await apiClient.post('/auth/reset-password', { token, password });
};
