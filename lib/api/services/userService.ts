import apiClient from '../client/apiClient';
import { User } from '../../../types';

export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get('/users');
  return response.data;
};

export const getUserById = async (id: string): Promise<User> => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
  const response = await apiClient.post('/users', user);
  return response.data;
};

export const updateUser = async (id: string, user: Partial<User>): Promise<User> => {
  const response = await apiClient.put(`/users/${id}`, user);
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await apiClient.delete(`/users/${id}`);
};

export async function resendInvitation(userId: string | number) {
  const res = await fetch(`/api/users/${userId}/resend-invitation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'No se pudo reenviar la invitación.');
  }
  return true;
} 