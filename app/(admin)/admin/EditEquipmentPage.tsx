// pages/EditEquipmentPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EquipmentForm from '../../../features/admin/components/equipment/EquipmentForm';
import { Equipment } from '../../../types';
import Button from '../../../components/ui/Button';
import { transformApiDataToEquipment } from '../../../lib/utils/maintenance'; // Importamos nuestra función de utilidad
import { getEquipmentById, updateEquipment } from '../../../lib/api/services/equipmentService';

const EditEquipmentPage: React.FC = () => {
    const navigate = useNavigate();
    const { equipmentId } = useParams<{ equipmentId: string }>();

    // Estados para manejar la carga y los datos del equipo
    const [equipmentToEdit, setEquipmentToEdit] = useState<Equipment | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // useEffect para buscar los datos del equipo cuando la página carga
    useEffect(() => {
        if (!equipmentId) {
            setIsLoading(false);
            setError("No se proporcionó ID de equipo.");
            return;
        }
        const fetchEquipmentForEdit = async () => {
            try {
                const dataFromApi = await getEquipmentById(equipmentId);
                const transformedData = transformApiDataToEquipment(dataFromApi);
                setEquipmentToEdit(transformedData);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Ocurrió un error");
            } finally {
                setIsLoading(false);
            }
        };
        fetchEquipmentForEdit();
    }, [equipmentId]);


    // La lógica para guardar los cambios (la haremos en el siguiente paso)
    // --- REEMPLAZA LA FUNCIÓN handleSubmit CON ESTA ---
    const handleSubmit = async (equipmentData: Equipment) => {
        if (!equipmentId) {
            alert("Error: No se encontró el ID del equipo.");
            return;
        }

        try {
            await updateEquipment(equipmentId, equipmentData);
            alert("¡Equipo actualizado exitosamente!");
            navigate(`/equipment/${equipmentId}`); // Redirige a la página de detalles

        } catch (error) {
            console.error("Error al enviar la actualización:", error);
            alert(`Error: ${error instanceof Error ? error.message : "Ocurrió un error"}`);
        }
    };

    const handleCancel = () => {
        if (equipmentId) {
            navigate(`/equipment/${equipmentId}`);
        } else {
            navigate('/equipment');
        }
    };

    // --- Renderizado condicional mientras carga o si hay error ---
    if (isLoading) {
        return <div className="text-center py-10">Cargando equipo para editar...</div>;
    }

    if (error || !equipmentToEdit) {
        return (
            <div className="text-center py-10">
                <h1 className="text-xl font-semibold text-red-600">Equipo no encontrado</h1>
                <p className="text-gray-600">{error || "El equipo que intenta editar no existe."}</p>
                <Button onClick={() => navigate('/equipment')} className="mt-4">Ir a la Lista de Equipos</Button>
            </div>
        );
    }

    // Si todo está bien, muestra el formulario con los datos cargados
    return (
        <div className="max-w-4xl mx-auto">
            <EquipmentForm
                initialData={equipmentToEdit}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
            />
        </div>
    );
};

export default EditEquipmentPage;
