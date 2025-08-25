// components/issues/IssueReportForm.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { IssueReport, IssueSeverity, Equipment, UserRole, EquipmentCriticality, MaintenanceFrequencyUnit } from '@/types';
import Button from '@/components/ui/Button';
import SelectInput from '@/components/ui/SelectInput';
import TextareaInput from '@/components/ui/TextareaInput';
import FileInput from '@/components/ui/FileInput';
import { ISSUE_SEVERITY_OPTIONS } from '@/lib/config/constants';
import { useAuth } from '@/hooks/useAuth';
import { getEquipments, EquipmentResponse } from '@/lib/api/services/equipmentService';
import { useToast } from '@/hooks/useToast';

type IssueReportInput = Omit<IssueReport, 'id'> & { id?: string };

interface IssueReportFormProps {
    initialData?: IssueReport | null;
    equipmentIdFromUrl?: string;
    onSubmit: (issueReport: IssueReportInput) => void;
    onCancel: () => void;
}

const IssueReportForm: React.FC<IssueReportFormProps> = ({ initialData, equipmentIdFromUrl, onSubmit, onCancel }) => {
    const { currentUser } = useAuth();
    const toast = useToast();

    // Estado para guardar la lista de equipos cargada desde la API
    const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([]);
    // Función para transformar EquipmentResponse a Equipment
    function transformEquipmentResponse(data: EquipmentResponse): Equipment {
        return {
            id: String(data.id),
            institutionalId: data.institutionalId,
            name: data.name,
            brand: data.brand,
            model: data.model,
            locationBuilding: data.locationBuilding,
            locationUnit: data.locationUnit,
            lastCalibrationDate: data.lastCalibrationDate,
            lastMaintenanceDate: data.lastMaintenanceDate,
            encargado: data.encargado
                ? {
                    id: String(data.encargado.id),
                    name: data.encargado.name,
                    email: data.encargado.email,
                    role: data.encargado.role as UserRole,
                    unit: data.encargado.unit,
                }
                : undefined,
            maintenanceFrequency: data.maintenanceFrequency
                ? {
                    value: data.maintenanceFrequency.value,
                    unit: data.maintenanceFrequency.unit as MaintenanceFrequencyUnit,
                }
                : { value: 6, unit: MaintenanceFrequencyUnit.MONTHS },
            maintenanceRecords: data.maintenanceRecords || [],
            customMaintenanceInstructions: data.customMaintenanceInstructions,
            criticality: (Object.values(EquipmentCriticality) as string[]).includes(data.criticality || '')
                ? (data.criticality as EquipmentCriticality)
                : EquipmentCriticality.MEDIUM,
            status:
                data.status === 'OK' || data.status === 'Advertencia' || data.status === 'Vencido'
                    ? data.status
                    : undefined,
            nextMaintenanceDate: data.nextMaintenanceDate,
            purchasedByGovernment: data.purchasedByGovernment,
        };
    }
    const [isLoading, setIsLoading] = useState(true);

    interface FormState {
        id?: string;
        equipmentId: string;
        description?: string;
        severity: IssueSeverity;
        status: 'Abierto' | 'En Progreso' | 'Resuelto';
        attachments: { name: string; url: string }[];
    }

    const [formData, setFormData] = useState<FormState>(
        initialData ? {
            id: initialData.id,
            equipmentId: initialData.equipment.id,
            description: initialData.description,
            severity: initialData.severity,
            status: initialData.status,
            attachments: initialData.attachments || [],
        } : {
            equipmentId: equipmentIdFromUrl || '',
            severity: IssueSeverity.MINOR,
            status: 'Abierto',
            attachments: [],
        }
    );
    const [errors, setErrors] = useState<Record<string, string>>({});

    // useEffect para buscar la lista de equipos desde la API
    useEffect(() => {
        const fetchEquipmentList = async () => {
            try {
                const data: EquipmentResponse[] = await getEquipments();
                const transformed = data.map(transformEquipmentResponse);
                // Si el usuario es un Jefe de Unidad, filtramos los equipos por su unidad
                if (currentUser?.role === UserRole.UNIT_MANAGER && currentUser.unit) {
                    setAvailableEquipment(transformed.filter(eq => eq.locationUnit === currentUser.unit));
                } else {
                    setAvailableEquipment(transformed);
                }
            } catch (error) {
                console.error(error);
                toast.showToast("No se pudo cargar la lista de equipos desde el servidor.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchEquipmentList();
    }, []); // Solo se ejecuta una vez al montar


    useEffect(() => {
        if (equipmentIdFromUrl && !initialData) {
            setFormData(prev => ({...prev, equipmentId: equipmentIdFromUrl}));
        }
    }, [equipmentIdFromUrl, initialData]);

    const equipmentOptions = useMemo(() =>
        availableEquipment.map(eq => ({ value: eq.id, label: `${eq.name} (${eq.id})` })),
        [availableEquipment]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleFileChange = (file: File | null) => {
        if (file) {
            setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), { name: file.name, url: '#'}] }));
        }
    };

    // Validación extraída
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.equipmentId) newErrors.equipmentId = 'La selección del equipo es requerida.';
        if (!formData.description?.trim()) newErrors.description = 'La descripción de la incidencia es requerida.';
        if (!formData.severity) newErrors.severity = 'El nivel de severidad es requerido.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Mapeo de criticality para backend
    const mapCriticalityToBackend = (criticality: string): string => {
        switch (criticality) {
            case 'Alta': return 'HIGH';
            case 'Media': return 'MEDIUM';
            case 'Baja': return 'LOW';
            default: return 'MEDIUM';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const selectedEquipment = availableEquipment.find(eq => eq.id === formData.equipmentId);
            if (!selectedEquipment) {
                toast.showToast('Equipo no encontrado.');
                return;
            }
            // Clonar y transformar criticality
            const equipmentForBackend = {
                ...selectedEquipment,
                criticality: mapCriticalityToBackend(selectedEquipment.criticality as string)
            };
            const finalData: Omit<IssueReport, 'id'> = {
                equipment: equipmentForBackend,
                reportedBy: currentUser?.id || '',
                dateTime: new Date().toISOString(),
                description: formData.description || '',
                severity: formData.severity,
                status: formData.status,
                attachments: formData.attachments,
            };
            if (formData.id) {
                onSubmit({ ...finalData, id: formData.id });
            } else {
                onSubmit(finalData);
            }
        }
    };

    // Si está cargando los equipos, muestra un mensaje
    if (isLoading) {
        return <div className="text-center p-8">Cargando lista de equipos...</div>
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
                {initialData ? 'Editar Reporte de Incidencia' : 'Reportar Nueva Incidencia'}
            </h2>

            <SelectInput
                label="Seleccionar Equipo" id="equipmentId" name="equipmentId"
                options={equipmentOptions} value={formData.equipmentId || ''}
                onChange={handleChange} error={errors.equipmentId}
                required disabled={!!equipmentIdFromUrl && !initialData}
            />
            <TextareaInput
                label="Descripción de la Incidencia" id="description" name="description"
                value={formData.description || ''} onChange={handleChange}
                error={errors.description} required rows={5}
            />
            <SelectInput
                label="Severidad" id="severity" name="severity"
                options={ISSUE_SEVERITY_OPTIONS} value={formData.severity || ''}
                onChange={handleChange} error={errors.severity} required
            />
            <FileInput
                label="Adjuntar Imagen o PDF (Opcional)" id="issueAttachment" name="issueAttachment"
                accept=".pdf,.png,.jpg,.jpeg" onFileChange={handleFileChange}
            />
            {formData.attachments && formData.attachments.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Archivos Adjuntos:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                        {formData.attachments.map((att, idx) => <li key={idx}>{att.name}</li>)}
                    </ul>
                </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" variant="primary">
                    {initialData ? 'Guardar Cambios' : 'Enviar Reporte'}
                </Button>
            </div>
        </form>
    );
};

export default IssueReportForm;
