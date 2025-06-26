
import React from 'react';
import { useNavigate } from 'react-router-dom';
import EquipmentForm from '../components/equipment/EquipmentForm';
import { Equipment } from '../types';
import { MOCK_EQUIPMENT } from '../constants'; // Assuming this can be mutated for demo

const AddEquipmentPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (equipmentData: Equipment) => {
    const newEquipmentWithDefaults: Equipment = {
        maintenanceRecords: [], 
        ...equipmentData,
    };

    MOCK_EQUIPMENT.push(newEquipmentWithDefaults);
    console.log('Nuevo equipo añadido:', newEquipmentWithDefaults);
    alert('¡Equipo registrado exitosamente!');
    navigate('/equipment'); 
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