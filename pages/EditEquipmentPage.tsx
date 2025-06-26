
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EquipmentForm from '../components/equipment/EquipmentForm';
import { Equipment } from '../types';
import { MOCK_EQUIPMENT } from '../constants'; 
import Button from '../components/ui/Button'; 

const EditEquipmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { equipmentId } = useParams<{ equipmentId: string }>();

  const equipmentToEdit = MOCK_EQUIPMENT.find(eq => eq.id === equipmentId);

  const handleSubmit = (equipmentData: Equipment) => {
    if (!equipmentToEdit) {
        alert('Error: Equipo no encontrado para editar.');
        navigate('/equipment');
        return;
    }
    const index = MOCK_EQUIPMENT.findIndex(eq => eq.id === equipmentData.id);
    if (index !== -1) {
      MOCK_EQUIPMENT[index] = equipmentData;
      console.log('Equipo actualizado:', equipmentData);
      alert('¡Equipo actualizado exitosamente!');
      navigate(`/equipment/${equipmentData.id}`); 
    } else {
      alert('Error: No se encontró el equipo para actualizar.');
      navigate('/equipment');
    }
  };

  const handleCancel = () => {
    if (equipmentId) {
        navigate(`/equipment/${equipmentId}`); 
    } else {
        navigate('/equipment'); 
    }
  };

  if (!equipmentToEdit) {
    return (
        <div className="text-center py-10">
            <h1 className="text-xl font-semibold text-red-600">Equipo no encontrado</h1>
            <p className="text-gray-600">El equipo que intenta editar no existe.</p>
            <Button onClick={() => navigate('/equipment')} className="mt-4">Ir a la Lista de Equipos</Button>
        </div>
    );
  }

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