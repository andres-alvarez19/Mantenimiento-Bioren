// frontend/src/pages/AddEquipmentPage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import EquipmentForm from '../components/equipment/EquipmentForm';
import { Equipment } from '../types';

const AddEquipmentPage: React.FC = () => {
    const navigate = useNavigate();

    // Esta función ahora se comunicará con el backend
    const handleSubmit = async (equipmentData: Equipment) => {
        try {
            const response = await fetch('http://localhost:4000/api/equipment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(equipmentData),
            });

            if (!response.ok) {
                // Si el servidor responde con un error, lo lanzamos para que lo capture el catch
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al registrar el equipo');
            }

            // Si todo sale bien
            console.log('Nuevo equipo añadido:', equipmentData);
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