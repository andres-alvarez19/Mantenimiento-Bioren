// frontend/src/pages/AddEquipmentPage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import EquipmentForm from '@/features/admin/components/equipment/EquipmentForm';
import { Equipment } from '@/types';
import { createEquipment } from '@/lib/api/services/equipmentService';

const AddEquipmentPage: React.FC = () => {
    const navigate = useNavigate();

    // Esta función ahora se comunicará con el backend
    const handleSubmit = async (equipmentData: Equipment) => {
        try {
            await createEquipment(equipmentData);
            alert('¡Equipo registrado exitosamente!');
            navigate('/equipment');
        } catch (error) {
            console.error('Error en el handleSubmit:', error);
            alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    const handleCancel = () => {
        navigate('/equipment');
    };

    return (
        <div className="max-w-4xl mx-auto">
            <EquipmentForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
            />
        </div>
    );
};

export default AddEquipmentPage;
