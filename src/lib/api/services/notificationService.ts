import apiClient from '@/lib/api/client/apiClient';
import { AppNotification } from '@/types';

export const getNotifications = async (): Promise<AppNotification[]> => {
  const response = await apiClient.get('/notifications');
  return response.data;
};

export const markAsRead = async (id: string): Promise<AppNotification> => {
  const response = await apiClient.put(`/notifications/${id}/read`);
  return response.data;
};

export const deleteNotification = async (id: string): Promise<void> => {
  await apiClient.delete(`/notifications/${id}`);
};