import apiClient from '@/lib/api/client/apiClient';
import { MaintenanceRecord } from '@/types';

export interface MaintenanceRecordRequest
  extends Omit<MaintenanceRecord, 'id' | 'attachments'> {
  equipment: { id: string | number };
  attachments?: { name: string; url: string }[];
}

export const getMaintenanceRecords = async (): Promise<MaintenanceRecord[]> => {
  const response = await apiClient.get('/maintenance');
  return response.data;
};

export const getMaintenanceRecordById = async (id: string): Promise<MaintenanceRecord> => {
  const response = await apiClient.get(`/maintenance/${id}`);
  return response.data;
};

export const createMaintenanceRecord = async (
  record: MaintenanceRecordRequest
): Promise<MaintenanceRecord> => {
  const response = await apiClient.post('/maintenance', record);
  return response.data;
};

export const updateMaintenanceRecord = async (
  id: string,
  record: Partial<MaintenanceRecordRequest>
): Promise<MaintenanceRecord> => {
  const response = await apiClient.put(`/maintenance/${id}`, record);
  return response.data;
};

export const deleteMaintenanceRecord = async (id: string): Promise<void> => {
  await apiClient.delete(`/maintenance/${id}`);
};

