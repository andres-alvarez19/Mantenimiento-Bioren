import apiClient from '@/lib/api/client/apiClient';
import { AppNotification } from '@/types';

export const getNotifications = async (): Promise<AppNotification[]> => {
  const response = await apiClient.get('/notifications');
  return response.data;
}; 