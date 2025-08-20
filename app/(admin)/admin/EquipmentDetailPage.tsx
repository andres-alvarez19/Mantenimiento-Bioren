// pages/EquipmentDetailPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Equipment, MaintenanceRecord, EquipmentCriticality, UserRole } from '../../../types';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { getStatusColor, getCriticalityColor } from '../../../features/admin/components/equipment/EquipmentListItem';
// Asegúrate de que ambas funciones se importen desde utils/maintenance
import { calculateMaintenanceDetails, transformApiDataToEquipment } from '../../../lib/utils/maintenance';
import { PaperClipIcon, ArrowLeftIcon, PencilSquareIcon, TrashIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { useAuth } from '../../../hooks/useAuth';
import Modal from '../../../components/ui/Modal';
import TextInput from '../../../components/ui/TextInput';
import DateInput from '../../../components/ui/DateInput';
import FileInput from '../../../components/ui/FileInput';
import { getEquipmentById, deleteEquipment, createMaintenanceRecord } from '../../../lib/api/services/equipmentService';

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
    const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [maintForm, setMaintForm] = useState({ description: '', performedBy: '', date: '' });
    const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

    const fetchAllData = async () => {
        if (!equipmentId) return;
        setIsLoading(true);
        try {
            const equipData = await getEquipmentById(equipmentId);
            const transformedData = transformApiDataToEquipment(equipData);
            const processedData = calculateMaintenanceDetails(transformedData);
            setEquipment(processedData);
            // Los registros de mantenimiento ya vienen en la respuesta del equipo
            setMaintenanceHistory(equipData.maintenanceRecords || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [equipmentId]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMaintForm({ ...maintForm, [e.target.name]: e.target.value });
    };

    const handleFileChange = (file: File | null) => {
        setAttachmentFile(file);
    };

    const handleMaintSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!equipmentId) return;

        const formData = new FormData();
        formData.append('description', maintForm.description);
        formData.append('performedBy', maintForm.performedBy);
        formData.append('date', maintForm.date);
        if (attachmentFile) {
            formData.append('attachment', attachmentFile);
        }

        try {
            await createMaintenanceRecord(equipmentId, formData);
            alert('Registro de mantenimiento guardado exitosamente.');
            setIsModalOpen(false);
            setMaintForm({ description: '', performedBy: '', date: '' });
            setAttachmentFile(null);
            fetchAllData();
        } catch (error) {
            alert(`Error: ${error instanceof Error ? error.message : "Ocurrió un error"}`);
        }
    };

    const handleDelete = () => setIsDeleteModalOpen(true);

    const confirmDelete = async () => {
        if (!equipmentId) return;
        try {
            await deleteEquipment(equipmentId);
            alert('¡Equipo eliminado exitosamente!');
            navigate('/equipment');
        } catch (error) {
            alert(`Error: ${error instanceof Error ? error.message : 'Ocurrió un error'}`);
        } finally {
            setIsDeleteModalOpen(false);
        }
    };

    if (isLoading) return <div className="text-center py-10">Cargando...</div>;
    if (error || !equipment) return <div className="text-center py-10 text-red-500">{error}</div>;

    const safeFormatDate = (dateString: string | undefined | null) => {
        if (!dateString || dateString === 'N/D') return 'N/D';
        const date = new Date(dateString);
        return isValid(date) ? format(date, 'dd/MM/yyyy') : 'N/D';
    };

    const canEdit = currentUser?.role === UserRole.BIOREN_ADMIN || currentUser?.role === UserRole.UNIT_MANAGER;
    const canDelete = currentUser?.role === UserRole.BIOREN_ADMIN;


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-semibold text-gray-800">Detalles del Equipo: <span className="text-bioren-blue">{equipment.name}</span></h1>
                <Button onClick={() => navigate('/equipment')} variant="secondary" leftIcon={<ArrowLeftIcon className="w-5 h-5"/>}>Volver a la Lista</Button>
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
                        <DetailItem label="Encargado" value={equipment.encargado?.name || 'N/D'} />
                        <DetailItem label="Frecuencia de Mantenimiento" value={equipment.maintenanceFrequency?.value ? `${equipment.maintenanceFrequency.value} ${equipment.maintenanceFrequency.unit}` : 'N/D'} />
                        <DetailItem label="Último Mantenimiento" value={safeFormatDate(equipment.lastMaintenanceDate)} />
                        <DetailItem label="Próximo Mantenimiento" value={safeFormatDate(equipment.nextMaintenanceDate)} />
                        <DetailItem label="Última Calibración" value={safeFormatDate(equipment.lastCalibrationDate)} />
                        <DetailItem label="Instrucciones Personalizadas" value={equipment.customMaintenanceInstructions ? <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 p-2 rounded">{equipment.customMaintenanceInstructions}</pre> : 'Ninguna'} />
                    </dl>
                </div>
            </div>

            {/* Historial de Mantenimiento */}
            <div className="bg-white shadow-xl rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-700">Historial de Mantenimiento</h2>
                    <Button onClick={() => setIsModalOpen(true)} leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>Añadir Registro</Button>
                </div>
                {maintenanceHistory.length > 0 ? (
                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200 max-h-96 overflow-y-auto">
                        {maintenanceHistory.map((record) => (
                            <li key={record.id} className="p-4 hover:bg-gray-50">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-md font-semibold text-bioren-blue">Fecha: {safeFormatDate(record.date)}</p>
                                    <p className="text-sm text-gray-500">Por: {record.performedBy}</p>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">{record.description}</p>

                                {/* --- INICIO DEL CAMBIO --- */}
                                {record.attachments && record.attachments.length > 0 && (
                                    <div className="mt-2">
                                        {record.attachments.map((attachment, index) => (
                                            <a
                                                key={index}
                                                href={attachment.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-bioren-blue-light hover:underline flex items-center"
                                            >
                                                <PaperClipIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                                                {attachment.name}
                                            </a>
                                        ))}
                                    </div>
                                )}
                                {/* --- FIN DEL CAMBIO --- */}

                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500 italic">No se encontraron registros de mantenimiento.</p>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Añadir Nuevo Registro de Mantenimiento">
                <form onSubmit={handleMaintSubmit} className="space-y-4">
                    <DateInput label="Fecha del Mantenimiento" name="date" value={maintForm.date} onChange={handleFormChange} required />
                    <TextInput label="Realizado Por" name="performedBy" value={maintForm.performedBy} onChange={handleFormChange} required />
                    <TextInput label="Descripción del Trabajo" name="description" value={maintForm.description} onChange={handleFormChange} required />
                    <FileInput label="Adjuntar PDF (Opcional)" id="attachment" name="attachment" onFileChange={handleFileChange} />
                    <div className="flex justify-end pt-4 space-x-2">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button type="submit">Guardar Registro</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Eliminación">
                <div className="space-y-4">
                    <p>¿Está seguro de que desea eliminar este equipo? Esta acción no se puede deshacer.</p>
                    <div className="flex justify-end space-x-2">
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
                        <Button variant="danger" onClick={confirmDelete}>Eliminar</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default EquipmentDetailPage;
