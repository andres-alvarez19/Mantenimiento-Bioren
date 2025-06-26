// pages/EquipmentDetailPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Equipment, MaintenanceRecord, EquipmentCriticality, UserRole } from '../types';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { getStatusColor, getCriticalityColor } from '../components/equipment/EquipmentListItem';
import { calculateMaintenanceDetails } from '../utils/maintenance';
import { PaperClipIcon, ArrowLeftIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format, isValid } from 'date-fns'; // Importamos 'isValid' para verificar las fechas
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
    const [equipment, setEquipment] = useState<Equipment | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);

    useEffect(() => {
        if (!equipmentId) {
            setIsLoading(false);
            setError("No se ha proporcionado un ID de equipo.");
            return;
        }
        const fetchEquipment = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:4000/api/equipment/${equipmentId}`);
                if (!response.ok) throw new Error('El equipo solicitado no pudo ser encontrado.');
                const data: Equipment = await response.json();
                const processedData = calculateMaintenanceDetails(data);
                setEquipment(processedData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ocurrió un error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchEquipment();
    }, [equipmentId]);

    if (isLoading) return <div className="text-center py-10">Cargando datos del equipo...</div>;

    if (error || !equipment) {
        return (
            <div className="text-center py-10">
                <h1 className="text-xl font-semibold text-red-500">Equipo No Encontrado</h1>
                <p className="text-gray-600">{error || 'El equipo que intenta ver no existe.'}</p>
                <Button onClick={() => navigate('/equipment')} className="mt-4" leftIcon={<ArrowLeftIcon className="w-5 h-5"/>}>
                    Volver a la Lista de Equipos
                </Button>
            </div>
        );
    }

    const canEdit = currentUser?.role === UserRole.BIOREN_ADMIN || currentUser?.role === UserRole.UNIT_MANAGER;
    const canDelete = currentUser?.role === UserRole.BIOREN_ADMIN;
    const handleDelete = () => setIsConfirmDeleteModalOpen(true);
    const confirmDelete = () => {
        alert(`Simulando borrado del equipo ${equipment.id}`);
        setIsConfirmDeleteModalOpen(false);
        navigate('/equipment');
    };

    // --- LÓGICA DE FECHAS CORREGIDA ---
    // Función auxiliar para formatear fechas de forma segura
    const safeFormatDate = (dateString: string | undefined | null) => {
        if (!dateString) return 'N/D';
        const date = new Date(dateString + 'T00:00:00'); // Añadimos T00:00:00 para evitar errores de zona horaria
        return isValid(date) ? format(date, 'PPP', { locale: es }) : 'N/D';
    };

    // Usamos la nueva función segura
    const formattedLastMaintenance = safeFormatDate(equipment.lastMaintenanceDate);
    const formattedNextMaintenance = safeFormatDate(equipment.nextMaintenanceDate);
    const formattedLastCalibration = safeFormatDate(equipment.lastCalibrationDate);

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
                        <DetailItem label="Frecuencia de Mantenimiento" value={equipment.maintenanceFrequency?.value ? `${equipment.maintenanceFrequency.value} ${equipment.maintenanceFrequency.unit}` : 'N/D'} />
                        <DetailItem label="Último Mantenimiento" value={formattedLastMaintenance} />
                        <DetailItem label="Próximo Mantenimiento" value={formattedNextMaintenance} />
                        <DetailItem label="Última Calibración" value={formattedLastCalibration} />
                        <DetailItem label="Instrucciones Personalizadas" value={equipment.customMaintenanceInstructions ? <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 p-2 rounded">{equipment.customMaintenanceInstructions}</pre> : 'Ninguna'} />
                    </dl>
                </div>
            </div>
            <div className="bg-white shadow-xl rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Historial de Mantenimiento</h2>
                <p className="text-sm text-gray-500 italic">No se encontraron registros de mantenimiento para este equipo.</p>
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