
import React, { useState, useEffect } from 'react';
import { IssueReport, IssueSeverity, Equipment } from '../../types';
import Button from '../ui/Button';
import TextInput from '../ui/TextInput';
import SelectInput from '../ui/SelectInput';
import TextareaInput from '../ui/TextareaInput';
import FileInput from '../ui/FileInput'; // Simulated
import { ISSUE_SEVERITY_OPTIONS, MOCK_EQUIPMENT } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';

interface IssueReportFormProps {
  initialData?: IssueReport | null;
  equipmentIdFromUrl?: string; // Optional: if navigating from an equipment page
  onSubmit: (issueReport: IssueReport) => void;
  onCancel: () => void;
}

const IssueReportForm: React.FC<IssueReportFormProps> = ({ initialData, equipmentIdFromUrl, onSubmit, onCancel }) => {
  const { currentUser } = useAuth();
  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([]);
  
  const [formData, setFormData] = useState<Partial<IssueReport>>(
    initialData || {
      equipmentId: equipmentIdFromUrl || '',
      severity: IssueSeverity.MINOR,
      status: 'Abierto',
      attachments: [],
    }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof IssueReport, string>>>({});

  useEffect(() => {
    if (currentUser?.role === 'Jefe de Unidad' && currentUser.unit) {
        setAvailableEquipment(MOCK_EQUIPMENT.filter(eq => eq.locationUnit === currentUser.unit));
    } else {
        setAvailableEquipment(MOCK_EQUIPMENT);
    }

    if (equipmentIdFromUrl && !initialData) {
        setFormData(prev => ({...prev, equipmentId: equipmentIdFromUrl}));
    }
  }, [currentUser, equipmentIdFromUrl, initialData]);

  const equipmentOptions = availableEquipment.map(eq => ({ value: eq.id, label: `${eq.name} (${eq.id})` }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
     if (errors[name as keyof IssueReport]) {
        setErrors(prev => ({...prev, [name]: undefined}));
    }
  };
  
  const handleFileChange = (file: File | null) => {
    if (file) {
        setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), { name: file.name, url: '#'}] }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof IssueReport, string>> = {};
    if (!formData.equipmentId) newErrors.equipmentId = 'La selección del equipo es requerida.';
    if (!formData.description?.trim()) newErrors.description = 'La descripción de la incidencia es requerida.';
    if (!formData.severity) newErrors.severity = 'El nivel de severidad es requerido.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const finalData: IssueReport = {
        id: initialData?.id || `issue-${Date.now()}`, 
        reportedBy: currentUser?.name || 'Usuario Desconocido',
        dateTime: initialData?.dateTime || new Date().toISOString(),
        equipmentName: availableEquipment.find(eq => eq.id === formData.equipmentId)?.name || 'Equipo Desconocido',
        ...formData,
      } as IssueReport;
      onSubmit(finalData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {initialData ? 'Editar Reporte de Incidencia' : 'Reportar Nueva Incidencia'}
      </h2>
      
      <SelectInput 
        label="Seleccionar Equipo" 
        id="equipmentId" 
        name="equipmentId" 
        options={equipmentOptions} 
        value={formData.equipmentId || ''} 
        onChange={handleChange} 
        error={errors.equipmentId} 
        required 
        disabled={!!equipmentIdFromUrl && !initialData} 
      />

      <TextareaInput 
        label="Descripción de la Incidencia" 
        id="description" 
        name="description" 
        value={formData.description || ''} 
        onChange={handleChange} 
        error={errors.description} 
        required 
        rows={5}
      />

      <SelectInput 
        label="Severidad" 
        id="severity" 
        name="severity" 
        options={ISSUE_SEVERITY_OPTIONS} 
        value={formData.severity || ''} 
        onChange={handleChange} 
        error={errors.severity} 
        required 
      />
      
      <FileInput 
        label="Adjuntar Imagen o PDF (Opcional)" 
        id="issueAttachment" 
        name="issueAttachment"
        accept=".pdf,.png,.jpg,.jpeg"
        onFileChange={handleFileChange}
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