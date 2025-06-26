
import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Equipment, MaintenanceRecord, EquipmentCriticality, UserRole } from '../types';
import { MOCK_EQUIPMENT } from '../constants';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { getStatusColor, getCriticalityColor } from '../components/equipment/EquipmentListItem';
import { calculateMaintenanceDetails } from '../utils/maintenance';
import { PaperClipIcon, ArrowLeftIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/ui/Modal'; 

const DetailItem: React.FC<{ label: string; value?: string | number | React.ReactNode; className?: string }> = ({ label, value, className }) => (
  <div className={`py-3 sm:grid sm:grid-cols-3 sm:gap-4 ${className}`}>
    <dt className="text-sm font-medium text-gray-600">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value || <span className="text-gray-400">N/D</span>}</dd>
  </div>
);

const EquipmentDetailPage: React.FC = () => {
  const { equipmentId } = useParams<{ equipmentId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);


  const rawEquipment = MOCK_EQUIPMENT.find(eq => eq.id === equipmentId);
  
  const equipment = useMemo(() => {
    if (!rawEquipment) return null;
    return calculateMaintenanceDetails(rawEquipment);
  }, [rawEquipment]);


  const handleDelete = () => {
    setIsConfirmDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (equipmentId) {
        const indexToDelete = MOCK_EQUIPMENT.findIndex(eq => eq.id === equipmentId);
        if (indexToDelete > -1) {
            MOCK_EQUIPMENT.splice(indexToDelete, 1);
        }
        alert(`Equipo ${equipmentId} eliminado exitosamente.`);
        navigate('/equipment');
    }
    setIsConfirmDeleteModalOpen(false);
  };

  if (!equipment) {
    return (
      <div className="text-center py-10">
        <h1 className="text-xl font-semibold text-red-500">Equipo No Encontrado</h1>
        <p className="text-gray-600">El equipo solicitado no pudo ser encontrado.</p>
        <Button onClick={() => navigate('/equipment')} className="mt-4" leftIcon={<ArrowLeftIcon className="w-5 h-5"/>}>
          Volver a la Lista de Equipos
        </Button>
      </div>
    );
  }

  const canEdit = currentUser?.role === UserRole.BIOREN_ADMIN || currentUser?.role === UserRole.UNIT_MANAGER;
  const canDelete = currentUser?.role === UserRole.BIOREN_ADMIN;

  const formattedLastMaintenance = equipment.lastMaintenanceDate ? format(new Date(equipment.lastMaintenanceDate), 'PPP', { locale: es }) : undefined;
  const formattedNextMaintenance = equipment.nextMaintenanceDate && equipment.nextMaintenanceDate !== 'N/D' ? format(new Date(equipment.nextMaintenanceDate), 'PPP', { locale: es }) : undefined;
  const formattedLastCalibration = equipment.lastCalibrationDate ? format(new Date(equipment.lastCalibrationDate), 'PPP', { locale: es }) : undefined;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-gray-800">
          Detalles del Equipo: <span className="text-bioren-blue">{equipment.name}</span>
        </h1>
        <Button onClick={() => navigate('/equipment')} variant="secondary" leftIcon={<ArrowLeftIcon className="w-5 h-5"/>}>
          Volver a la Lista
        </Button>
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="p-6 space-y-4">
            <div className="flex justify-end space-x-2">
                {canEdit && (
                    <Button onClick={() => navigate(`/equipment/${equipment.id}/edit`)} variant='primary' leftIcon={<PencilSquareIcon className="w-5 h-5"/>}>Editar</Button>
                )}
                {canDelete && (
                    <Button onClick={handleDelete} variant='danger' leftIcon={<TrashIcon className="w-5 h-5"/>}>Eliminar</Button>
                )}
            </div>
          <dl className="divide-y divide-gray-200">
            <DetailItem label="ID Institucional" value={<span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">{equipment.id}</span>} />
            <DetailItem label="Marca" value={equipment.brand} />
            <DetailItem label="Modelo" value={equipment.model} />
            <DetailItem label="Ubicación" value={`${equipment.locationBuilding} / ${equipment.locationUnit}`} />
            <DetailItem label="Estado" value={<Badge text={equipment.status || 'Desconocido'} color={getStatusColor(equipment.status)} size="md"/>} />
            <DetailItem label="Criticidad" value={<Badge text={equipment.criticality} color={getCriticalityColor(equipment.criticality as EquipmentCriticality)} size="md"/>} />
            <DetailItem label="Encargado" value={equipment.encargado} />
            <DetailItem label="Frecuencia de Mantenimiento" value={`${equipment.maintenanceFrequency.value} ${equipment.maintenanceFrequency.unit}`} />
            <DetailItem label="Último Mantenimiento" value={formattedLastMaintenance} />
            <DetailItem label="Próximo Mantenimiento" value={formattedNextMaintenance} />
            <DetailItem label="Última Calibración" value={formattedLastCalibration} />
            <DetailItem label="Instrucciones Personalizadas" value={equipment.customMaintenanceInstructions ? <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 p-2 rounded">{equipment.customMaintenanceInstructions}</pre> : 'Ninguna'} />
          </dl>
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Historial de Mantenimiento</h2>
        {equipment.maintenanceRecords && equipment.maintenanceRecords.length > 0 ? (
          <ul className="border border-gray-200 rounded-md divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {equipment.maintenanceRecords.map((record: MaintenanceRecord) => (
              <li key={record.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-md font-semibold text-bioren-blue">Fecha: {format(new Date(record.date), 'PPP', { locale: es })}</p>
                    <p className="text-sm text-gray-500">Por: {record.performedBy}</p>
                </div>
                <p className="text-sm text-gray-700 mb-2">{record.description}</p>
                {record.attachments && record.attachments.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-500 mb-1">Adjuntos:</p>
                    {record.attachments.map((att, idx) => (
                      <a key={idx} href={att.url} target="_blank" rel="noopener noreferrer" className="text-sm text-bioren-blue-light hover:underline flex items-center mr-2">
                        <PaperClipIcon className="w-4 h-4 mr-1 flex-shrink-0" /> {att.name}
                      </a>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 italic">No se encontraron registros de mantenimiento para este equipo.</p>
        )}
      </div>
       {isConfirmDeleteModalOpen && (
        <Modal
          isOpen={isConfirmDeleteModalOpen}
          onClose={() => setIsConfirmDeleteModalOpen(false)}
          title="Confirmar Eliminación"
          size="sm"
          footerActions={
            <>
              <Button variant="secondary" onClick={() => setIsConfirmDeleteModalOpen(false)}>Cancelar</Button>
              <Button variant="danger" onClick={confirmDelete} className="ml-3">Eliminar</Button>
            </>
          }
        >
          <p>¿Está seguro de que desea eliminar el equipo <strong className="font-mono">{equipment.id}</strong>? Esta acción no se puede deshacer.</p>
        </Modal>
      )}
    </div>
  );
};

export default EquipmentDetailPage;