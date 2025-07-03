import apiClient from '../client/apiClient';
import { Equipment } from '../../../types';

export const getEquipments = async (): Promise<Equipment[]> => {
  const response = await apiClient.get('/equipment');
  return response.data;
};

export const getEquipmentById = async (id: string): Promise<Equipment> => {
  const response = await apiClient.get(`/equipment/${id}`);
  return response.data;
};

export const createEquipment = async (equipment: Omit<Equipment, 'id'>): Promise<Equipment> => {
  const response = await apiClient.post('/equipment', equipment);
  return response.data;
};

export const updateEquipment = async (id: string, equipment: Partial<Equipment>): Promise<Equipment> => {
  const response = await apiClient.put(`/equipment/${id}`, equipment);
  return response.data;
};

export const deleteEquipment = async (id: string): Promise<void> => {
  await apiClient.delete(`/equipment/${id}`);
};

export const getEquipmentMaintenanceHistory = async (id: string): Promise<any[]> => {
  const response = await apiClient.get(`/equipment/${id}/maintenance`);
  return response.data;
}; 