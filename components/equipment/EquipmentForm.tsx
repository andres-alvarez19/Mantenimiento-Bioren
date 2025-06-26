
import React, { useState, useEffect } from 'react';
import { Equipment, EquipmentCriticality, CustomMaintenanceFrequency, MaintenanceFrequencyUnit } from '../../types';
import Button from '../ui/Button';
import TextInput from '../ui/TextInput';
import SelectInput from '../ui/SelectInput';
import DateInput from '../ui/DateInput';
import TextareaInput from '../ui/TextareaInput';
import FileInput from '../ui/FileInput'; // Simulated
import { EQUIPMENT_CRITICALITY_OPTIONS, MAINTENANCE_FREQUENCY_UNITS_OPTIONS } from '../../constants';

interface EquipmentFormProps {
  initialData?: Equipment | null;
  onSubmit: (equipment: Equipment) => void;
  onCancel: () => void;
}

const getDefaultFrequency = (): CustomMaintenanceFrequency => ({
    value: 6,
    unit: MaintenanceFrequencyUnit.MONTHS,
});

const EquipmentForm: React.FC<EquipmentFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Equipment>>(() => {
    const defaults = {
      name: '',
      brand: '',
      model: '',
      locationBuilding: '',
      locationUnit: '',
      maintenanceFrequency: getDefaultFrequency(),
      criticality: EquipmentCriticality.MEDIUM,
      maintenanceRecords: [],
      customMaintenanceInstructions: '',
      encargado: '',
      lastCalibrationDate: '',
      lastMaintenanceDate: '',
    };
    if (initialData) {
        return {
            ...defaults,
            ...initialData,
            maintenanceFrequency: initialData.maintenanceFrequency || getDefaultFrequency(), 
        };
    }
    return { ...defaults, id: '' }; 
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Equipment | 'maintenanceFrequency.value', string>>>({});

  useEffect(() => {
     const defaults = {
      name: '',
      brand: '',
      model: '',
      locationBuilding: '',
      locationUnit: '',
      maintenanceFrequency: getDefaultFrequency(),
      criticality: EquipmentCriticality.MEDIUM,
      maintenanceRecords: [],
      customMaintenanceInstructions: '',
      encargado: '',
      lastCalibrationDate: '',
      lastMaintenanceDate: '',
    };
    if (initialData) {
        setFormData({
            ...defaults,
            ...initialData,
            maintenanceFrequency: initialData.maintenanceFrequency || getDefaultFrequency(),
        });
    } else {
        setFormData({ ...defaults, id: '' }); 
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof Equipment]) {
        setErrors(prev => ({...prev, [name]: undefined}));
    }
  };

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target; 
    setFormData(prev => ({
      ...prev,
      maintenanceFrequency: {
        ...(prev.maintenanceFrequency || getDefaultFrequency()),
        [name]: name === 'value' ? (value === '' ? '' : parseInt(value, 10)) : value,
      },
    }));
     if (errors['maintenanceFrequency.value']) {
        setErrors(prev => ({...prev, 'maintenanceFrequency.value': undefined}));
    }
  };
  
  const handleFileChange = (file: File | null, fieldName: string) => {
    console.log(`Archivo para ${fieldName}:`, file?.name || 'Ninguno');
    // In a real app, you'd handle the file (e.g., upload or store temporarily)
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Equipment | 'maintenanceFrequency.value', string>> = {};
    if (!formData.id?.trim()) newErrors.id = 'El ID Institucional es requerido.';
    if (!formData.name?.trim()) newErrors.name = 'El nombre del equipo es requerido.';
    if (!formData.brand?.trim()) newErrors.brand = 'La marca es requerida.';
    if (!formData.model?.trim()) newErrors.model = 'El modelo es requerido.';
    if (!formData.locationBuilding?.trim()) newErrors.locationBuilding = 'El edificio es requerido.';
    if (!formData.locationUnit?.trim()) newErrors.locationUnit = 'La unidad es requerida.';
    if (!formData.criticality) newErrors.criticality = 'La criticidad es requerida.';
    if (!formData.maintenanceFrequency?.value || formData.maintenanceFrequency.value <=0) {
        newErrors['maintenanceFrequency.value'] = 'El valor de frecuencia debe ser un número positivo.';
    }
    if (!formData.maintenanceFrequency?.unit) {
        newErrors['maintenanceFrequency.value'] = (newErrors['maintenanceFrequency.value'] || '') + ' La unidad de frecuencia es requerida.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const submittedData: Equipment = {
        id: formData.id!, 
        name: formData.name!, 
        brand: formData.brand!, 
        model: formData.model!, 
        locationBuilding: formData.locationBuilding!, 
        locationUnit: formData.locationUnit!, 
        lastCalibrationDate: formData.lastCalibrationDate || undefined,
        lastMaintenanceDate: formData.lastMaintenanceDate || undefined,
        encargado: formData.encargado || undefined,
        maintenanceFrequency: formData.maintenanceFrequency!, 
        maintenanceRecords: formData.maintenanceRecords || [],
        customMaintenanceInstructions: formData.customMaintenanceInstructions || undefined,
        criticality: formData.criticality!, 
      };
      onSubmit(submittedData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow-xl rounded-lg my-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-200">
        {initialData ? 'Editar Equipo' : 'Registrar Nuevo Equipo'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <TextInput label="ID Institucional" id="id" name="id" value={formData.id || ''} onChange={handleChange} error={errors.id} required disabled={!!initialData} />
        <TextInput label="Nombre del Equipo" id="name" name="name" value={formData.name || ''} onChange={handleChange} error={errors.name} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <TextInput label="Marca" id="brand" name="brand" value={formData.brand || ''} onChange={handleChange} error={errors.brand} required />
        <TextInput label="Modelo" id="model" name="model" value={formData.model || ''} onChange={handleChange} error={errors.model} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <TextInput label="Ubicación (Edificio)" id="locationBuilding" name="locationBuilding" value={formData.locationBuilding || ''} onChange={handleChange} error={errors.locationBuilding} required />
        <TextInput label="Ubicación (Unidad/Laboratorio)" id="locationUnit" name="locationUnit" value={formData.locationUnit || ''} onChange={handleChange} error={errors.locationUnit} required />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <DateInput label="Última Fecha de Calibración (Opcional)" id="lastCalibrationDate" name="lastCalibrationDate" value={formData.lastCalibrationDate?.substring(0,10) || ''} onChange={handleChange} />
        <DateInput label="Última Fecha de Mantenimiento (Opcional)" id="lastMaintenanceDate" name="lastMaintenanceDate" value={formData.lastMaintenanceDate?.substring(0,10) || ''} onChange={handleChange} />
      </div>
      
       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-start">
         <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia de Mantenimiento *</label>
            <div className="flex space-x-2">
                <TextInput label="" id="maintenanceFrequency.value" name="value" type="number" min="1" containerClassName="flex-grow mb-0"
                    value={formData.maintenanceFrequency?.value ?? ''} onChange={handleFrequencyChange}  placeholder="Ej: 6"/>
                <SelectInput label="" id="maintenanceFrequency.unit" name="unit" containerClassName="flex-grow mb-0"
                    options={MAINTENANCE_FREQUENCY_UNITS_OPTIONS}
                    value={formData.maintenanceFrequency?.unit ?? ''} onChange={handleFrequencyChange} />
            </div>
             {errors['maintenanceFrequency.value'] && <p className="mt-1 text-sm text-red-500">{errors['maintenanceFrequency.value']}</p>}
         </div>
        <TextInput label="Encargado (Opcional)" id="encargado" name="encargado" value={formData.encargado || ''} onChange={handleChange} /> 
      </div>

      <TextareaInput label="Instrucciones de Mantenimiento Personalizadas (Opcional)" id="customMaintenanceInstructions" name="customMaintenanceInstructions" value={formData.customMaintenanceInstructions || ''} onChange={handleChange} rows={4} />

      <div className="grid grid-cols-1 md:grid-cols-1 gap-x-6 gap-y-4">
        <SelectInput label="Criticidad *" id="criticality" name="criticality" options={EQUIPMENT_CRITICALITY_OPTIONS} value={formData.criticality || ''} onChange={handleChange} error={errors.criticality} required />
      </div>
      
      <FileInput 
        label="Adjuntar Registros de Mantenimiento Anteriores (PDF - Opcional, Simulado)" 
        id="maintenanceRecordsPdf" 
        name="maintenanceRecordsPdf"
        accept=".pdf"
        onFileChange={(file) => handleFileChange(file, 'maintenanceRecordsPdf')}
      />
      {initialData && initialData.maintenanceRecords && initialData.maintenanceRecords.length > 0 && (
        <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Registros Existentes:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 max-h-20 overflow-y-auto">
                {initialData.maintenanceRecords.map(rec => <li key={rec.id}>{rec.attachments[0]?.name || 'Registro'} - {new Date(rec.date).toLocaleDateString()}</li>)}
            </ul>
            <p className="text-xs text-gray-500 mt-1">Nuevos registros pueden ser añadidos después de guardar, mediante la sección de seguimiento de mantenimiento (no implementado en este formulario).</p>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {initialData ? 'Guardar Cambios' : 'Registrar Equipo'}
        </Button>
      </div>
    </form>
  );
};

export default EquipmentForm;