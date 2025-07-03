import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEquipments, getEquipmentById, createEquipment, updateEquipment, deleteEquipment } from '../services/equipmentService';
import { Equipment } from '../../../types';

export const useEquipments = () => {
  return useQuery({
    queryKey: ['equipments'],
    queryFn: getEquipments,
  });
};

export const useEquipment = (id: string) => {
  return useQuery({
    queryKey: ['equipment', id],
    queryFn: () => getEquipmentById(id),
    enabled: !!id,
  });
};

export const useCreateEquipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newEquipment: Omit<Equipment, 'id'>) => createEquipment(newEquipment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipments'] });
    },
  });
};

export const useUpdateEquipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updatedEquipment }: { id: string, updatedEquipment: Partial<Equipment> }) => updateEquipment(id, updatedEquipment),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['equipments'] });
      queryClient.setQueryData(['equipment', data.id], data);
    },
  });
};

export const useDeleteEquipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEquipment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipments'] });
    },
  });
}; 