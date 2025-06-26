
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Equipment, EquipmentCriticality, UserRole } from '../../types';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { PencilSquareIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

// Exported helper functions
export const getStatusColor = (status?: 'OK' | 'Advertencia' | 'Vencido'): 'green' | 'yellow' | 'red' | 'gray' => {
  if (status === 'OK') return 'green';
  if (status === 'Advertencia') return 'yellow';
  if (status === 'Vencido') return 'red';
  return 'gray';
};

export const getCriticalityColor = (criticality: EquipmentCriticality): 'green' | 'orange' | 'red' => {
  if (criticality === EquipmentCriticality.LOW) return 'green';
  if (criticality === EquipmentCriticality.MEDIUM) return 'orange';
  if (criticality === EquipmentCriticality.HIGH) return 'red';
  return 'green'; // Default, should not happen if criticality is always valid
};

interface EquipmentListItemProps {
  equipment: Equipment & { status?: 'OK' | 'Advertencia' | 'Vencido', nextMaintenanceDate?: string };
  onDelete: (equipmentId: string) => void;
}

const EquipmentListItem: React.FC<EquipmentListItemProps> = ({ equipment, onDelete }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const canEdit = currentUser?.role === UserRole.BIOREN_ADMIN || currentUser?.role === UserRole.UNIT_MANAGER;
  const canDelete = currentUser?.role === UserRole.BIOREN_ADMIN;

  const handleView = () => {
    navigate(`/equipment/${equipment.id}`);
  };

  const handleEdit = () => {
    navigate(`/equipment/${equipment.id}/edit`);
  };

  return (
    <tr className="bg-white hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{equipment.id}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{equipment.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{equipment.locationBuilding} / {equipment.locationUnit}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {equipment.nextMaintenanceDate ? new Date(equipment.nextMaintenanceDate).toLocaleDateString() : 'N/D'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <Badge text={equipment.status || 'Desconocido'} color={getStatusColor(equipment.status)} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <Badge text={equipment.criticality} color={getCriticalityColor(equipment.criticality)} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
        <Button variant="ghost" size="sm" onClick={handleView} title="Ver Detalles">
          <EyeIcon className="w-5 h-5 text-blue-600" />
        </Button>
        {canEdit && (
          <Button variant="ghost" size="sm" onClick={handleEdit} title="Editar Equipo">
            <PencilSquareIcon className="w-5 h-5 text-yellow-600" />
          </Button>
        )}
        {canDelete && (
          <Button variant="ghost" size="sm" onClick={() => onDelete(equipment.id)} title="Eliminar Equipo">
            <TrashIcon className="w-5 h-5 text-red-600" />
          </Button>
        )}
      </td>
    </tr>
  );
};

export default EquipmentListItem;