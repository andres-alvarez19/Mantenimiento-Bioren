import apiClient from '@/lib/api/client/apiClient';
import { Equipment } from '@/types';

// Tipo para la respuesta del backend (DTO)
export interface EquipmentResponse {
  id: number;
  institutionalId: string;
  name: string;
  brand: string;
  model: string;
  locationBuilding: string;
  locationUnit: string;
  lastCalibrationDate?: string;
  lastMaintenanceDate?: string;
  encargado?: {
    id: number;
    name: string;
    email: string;
    role: string;
    unit?: string;
  };
  maintenanceFrequency?: {
    value: number;
    unit: string;
  };
  maintenanceRecords: any[];
  customMaintenanceInstructions?: string;
  criticality?: string;
  status?: string;
  nextMaintenanceDate?: string;
  purchasedByGovernment?: boolean;
}

export const getEquipments = async (): Promise<EquipmentResponse[]> => {
  const response = await apiClient.get('/equipment');
  return response.data;
};

export const getEquipmentById = async (id: string): Promise<EquipmentResponse> => {
  const response = await apiClient.get(`/equipment/${id}`);
  return response.data;
};

export const createEquipment = async (equipment: Omit<Equipment, 'id'>): Promise<EquipmentResponse> => {
  const response = await apiClient.post('/equipment', equipment);
  return response.data;
};

export const updateEquipment = async (id: string, equipment: Partial<Equipment>): Promise<EquipmentResponse> => {
  const response = await apiClient.put(`/equipment/${id}`, equipment);
  return response.data;
};

export const deleteEquipment = async (id: string): Promise<void> => {
  await apiClient.delete(`/equipment/${id}`);
};

export const checkInstitutionalIdExists = async (institutionalId: string): Promise<boolean> => {
  const response = await apiClient.get(`/equipment/exists/institutionalId/${institutionalId}`);
  return response.data;
};

export const createMaintenanceRecord = async (equipmentId: string, maintenanceData: FormData): Promise<void> => {
  await apiClient.post(`/equipment/${equipmentId}/maintenance`, maintenanceData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}; 