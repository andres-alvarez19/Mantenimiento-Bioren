// components/issues/IssueReportForm.tsx

import React, { useState, useEffect } from 'react';
import { IssueReport, IssueSeverity, Equipment, UserRole } from '@/types';
import Button from '@/components/ui/Button';
import SelectInput from '@/components/ui/SelectInput';
import TextareaInput from '@/components/ui/TextareaInput';
import FileInput from '@/components/ui/FileInput';
import { ISSUE_SEVERITY_OPTIONS } from '@/lib/config/constants';
import { useAuth } from '@/hooks/useAuth';
import { getEquipments } from '@/lib/api/services/equipmentService';

interface IssueReportFormProps {
    initialData?: IssueReport | null;
    equipmentIdFromUrl?: string;
    onSubmit: (issueReport: any) => void;
    onCancel: () => void;
}

const IssueReportForm: React.FC<IssueReportFormProps> = ({ initialData, equipmentIdFromUrl, onSubmit, onCancel }) => {
    const { currentUser } = useAuth();

    // Estado para guardar la lista de equipos cargada desde la API
    const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([]);
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
                // Usar el servicio en vez de fetch directo
                const data: Equipment[] = await getEquipments();
                // Si el usuario es un Jefe de Unidad, filtramos los equipos por su unidad
                if (currentUser?.role === UserRole.UNIT_MANAGER && currentUser.unit) {
                    setAvailableEquipment(data.filter(eq => eq.locationUnit === currentUser.unit));
                } else {
                    setAvailableEquipment(data);
                }
            } catch (error) {
                console.error(error);
                alert("Error: No se pudo cargar la lista de equipos desde el servidor.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchEquipmentList();
    }, [currentUser]);


    useEffect(() => {
        if (equipmentIdFromUrl && !initialData) {
            setFormData(prev => ({...prev, equipmentId: equipmentIdFromUrl}));
        }
    }, [equipmentIdFromUrl, initialData]);

    const equipmentOptions = availableEquipment.map(eq => ({ value: eq.id, label: `${eq.name} (${eq.id})` }));

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

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.equipmentId) newErrors.equipmentId = 'La selección del equipo es requerida.';
        if (!formData.description?.trim()) newErrors.description = 'La descripción de la incidencia es requerida.';
        if (!formData.severity) newErrors.severity = 'El nivel de severidad es requerido.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const selectedEquipment = availableEquipment.find(eq => eq.id === formData.equipmentId);
            if (!selectedEquipment) {
                alert('Error: Equipo no encontrado.');
                return;
            }
            const finalData = {
                id: formData.id,
                equipment: selectedEquipment,
                description: formData.description,
                severity: formData.severity,
                status: formData.status,
                attachments: formData.attachments,
            };
            onSubmit(finalData);
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
