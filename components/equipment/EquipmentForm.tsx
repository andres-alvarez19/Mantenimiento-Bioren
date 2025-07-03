// components/equipment/EquipmentForm.tsx

import React, { useState, useEffect } from 'react';
import { Equipment, EquipmentCriticality, CustomMaintenanceFrequency, MaintenanceFrequencyUnit, User } from '../../types';
import Button from '../ui/Button';
import TextInput from '../ui/TextInput';
import SelectInput from '../ui/SelectInput';
import DateInput from '../ui/DateInput';
import TextareaInput from '../ui/TextareaInput';
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
    const [formData, setFormData] = useState<Partial<Equipment>>({});
    const [users, setUsers] = useState<User[]>([]); // Estado para guardar la lista de usuarios
    const [isLoadingUsers, setIsLoadingUsers] = useState(true); // Estado para saber si los usuarios están cargando

    // useEffect para cargar la lista de usuarios desde la API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:4000/api/users');
                if (!response.ok) throw new Error('No se pudo cargar la lista de encargados');
                const data: User[] = await response.json();
                setUsers(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoadingUsers(false);
            }
        };
        fetchUsers();
    }, []);

    // useEffect para inicializar el formulario con los datos del equipo a editar o con valores por defecto
    useEffect(() => {
        const defaults = {
            name: '', brand: '', model: '', locationBuilding: '', locationUnit: '',
            maintenanceFrequency: getDefaultFrequency(),
            criticality: EquipmentCriticality.MEDIUM,
            encargado: '',
        };
        if (initialData) {
            setFormData({ ...defaults, ...initialData });
        } else {
            setFormData({ ...defaults, id: '' });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFrequencyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const numericValue = value === '' ? 0 : parseInt(value, 10);
        setFormData(prev => ({
            ...prev,
            maintenanceFrequency: {
                ...(prev.maintenanceFrequency || getDefaultFrequency()),
                [name]: name === 'value' ? numericValue : value,
            },
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Aquí puedes añadir tu lógica de validación si es necesario
        onSubmit(formData as Equipment);
    };

    // Preparamos las opciones para el menú desplegable de usuarios
    const userOptions = users.map(user => ({
        value: user.name, // El valor que se guardará será el nombre
        label: `${user.name} (${user.role})` // Lo que se mostrará en la lista
    }));

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow-xl rounded-lg my-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-200">
                {initialData ? 'Editar Equipo' : 'Registrar Nuevo Equipo'}
            </h2>

            {/* Campos de ID y Nombre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <TextInput label="ID Institucional" id="id" name="id" value={formData.id || ''} onChange={handleChange} required disabled={!!initialData} />
                <TextInput label="Nombre del Equipo" id="name" name="name" value={formData.name || ''} onChange={handleChange} required />
            </div>

            {/* Campos de Marca y Modelo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <TextInput label="Marca" id="brand" name="brand" value={formData.brand || ''} onChange={handleChange} required />
                <TextInput label="Modelo" id="model" name="model" value={formData.model || ''} onChange={handleChange} required />
            </div>

            {/* Campos de Ubicación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <TextInput label="Ubicación (Edificio)" id="locationBuilding" name="locationBuilding" value={formData.locationBuilding || ''} onChange={handleChange} required />
                <TextInput label="Ubicación (Unidad/Laboratorio)" id="locationUnit" name="locationUnit" value={formData.locationUnit || ''} onChange={handleChange} required />
            </div>

            {/* Campos de Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <DateInput label="Última Fecha de Calibración (Opcional)" id="lastCalibrationDate" name="lastCalibrationDate" value={formData.lastCalibrationDate?.substring(0,10) || ''} onChange={handleChange} />
                <DateInput label="Última Fecha de Mantenimiento (Opcional)" id="lastMaintenanceDate" name="lastMaintenanceDate" value={formData.lastMaintenanceDate?.substring(0,10) || ''} onChange={handleChange} />
            </div>

            {/* Frecuencia y Encargado */}
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
                </div>

                {/* --- INICIO DEL CAMBIO --- */}
                <SelectInput
                    label="Encargado (Opcional)"
                    id="encargado"
                    name="encargado"
                    value={formData.encargado || ''}
                    onChange={handleChange}
                    options={userOptions} // Usamos la lista de usuarios cargada desde la API
                    disabled={isLoadingUsers} // El campo se deshabilita mientras carga los usuarios
                />
                {/* --- FIN DEL CAMBIO --- */}
            </div>

            <TextareaInput label="Instrucciones de Mantenimiento Personalizadas (Opcional)" id="customMaintenanceInstructions" name="customMaintenanceInstructions" value={formData.customMaintenanceInstructions || ''} onChange={handleChange} rows={4} />

            <SelectInput label="Criticidad *" id="criticality" name="criticality" options={EQUIPMENT_CRITICALITY_OPTIONS} value={formData.criticality || ''} onChange={handleChange} required />

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