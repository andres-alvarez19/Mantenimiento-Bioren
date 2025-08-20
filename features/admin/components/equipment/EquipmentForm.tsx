// components/equipment/EquipmentForm.tsx

import React, { useState, useEffect } from 'react';
import { Equipment, EquipmentCriticality, CustomMaintenanceFrequency, MaintenanceFrequencyUnit, User } from '../../../../types';
import Button from '../../../../components/ui/Button';
import TextInput from '../../../../components/ui/TextInput';
import SelectInput from '../../../../components/ui/SelectInput';
import DateInput from '../../../../components/ui/DateInput';
import TextareaInput from '../../../../components/ui/TextareaInput';
import { EQUIPMENT_CRITICALITY_OPTIONS, MAINTENANCE_FREQUENCY_UNITS_OPTIONS } from '../../../../lib/config/constants';
import { getUsers } from '../../../../lib/api/services/userService';
import { checkInstitutionalIdExists } from '../../../../lib/api/services/equipmentService';

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
    const [idCheckError, setIdCheckError] = useState<string | null>(null);

    // useEffect para cargar la lista de usuarios desde la API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getUsers();
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
            encargado: undefined,
            institutionalId: '',
        };
        if (initialData) {
            setFormData({ ...defaults, ...initialData });
        } else {
            setFormData({ ...defaults });
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIdCheckError(null);
        // Validar ID institucional único antes de enviar
        if (!initialData) { // Solo al crear
            const exists = await checkInstitutionalIdExists(formData.institutionalId || '');
            if (exists) {
                setIdCheckError('El ID institucional ya está registrado.');
                return;
            }
        }
        // Normalizar enums antes de enviar
        const normalized: any = { ...formData };
        // Convertir criticality a inglés si es necesario
        if (normalized.criticality && typeof normalized.criticality === 'string') {
            const critOpt = EQUIPMENT_CRITICALITY_OPTIONS.find(opt => opt.label === normalized.criticality || opt.value === normalized.criticality);
            if (critOpt) normalized.criticality = critOpt.value;
        }
        // Convertir maintenanceFrequency.unit a inglés si es necesario
        if (normalized.maintenanceFrequency && typeof normalized.maintenanceFrequency.unit === 'string') {
            const freqOpt = MAINTENANCE_FREQUENCY_UNITS_OPTIONS.find(opt => opt.label === normalized.maintenanceFrequency.unit || opt.value === normalized.maintenanceFrequency.unit);
            if (freqOpt) normalized.maintenanceFrequency.unit = freqOpt.value;
        }
        // Eliminar el campo id si existe (solo para creación)
        delete normalized.id;
        onSubmit(normalized as Equipment);
    };

    // Preparamos las opciones para el menú desplegable de usuarios
    const userOptions = users.map(user => ({
        value: user.id,
        label: `${user.name} (${user.role})`
    }));

    const handleEncargadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedUser = users.find(u => String(u.id) === e.target.value);
        setFormData(prev => ({ ...prev, encargado: selectedUser }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow-xl rounded-lg my-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-200">
                {initialData ? 'Editar Equipo' : 'Registrar Nuevo Equipo'}
            </h2>

            {/* Campos de ID y Nombre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <TextInput label="ID Institucional" id="institutionalId" name="institutionalId" value={formData.institutionalId || ''} onChange={handleChange} required disabled={!!initialData} />
                <TextInput label="Nombre del Equipo" id="name" name="name" value={formData.name || ''} onChange={handleChange} required />
            </div>
            {idCheckError && <div className="text-red-600 text-sm mb-2">{idCheckError}</div>}

            {/* Nuevo campo: ¿Comprado por el gobierno? */}
            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="purchasedByGovernment"
                    name="purchasedByGovernment"
                    checked={!!formData.purchasedByGovernment}
                    onChange={e => setFormData(prev => ({ ...prev, purchasedByGovernment: e.target.checked }))}
                />
                <label htmlFor="purchasedByGovernment" className="text-sm text-gray-700">¿Comprado por el gobierno?</label>
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
                    value={formData.encargado ? (formData.encargado as User).id : ''}
                    onChange={handleEncargadoChange}
                    options={userOptions}
                    disabled={isLoadingUsers}
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
