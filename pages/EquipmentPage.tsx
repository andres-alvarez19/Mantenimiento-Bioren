
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Equipment, UserRole, MaintenanceFrequencyUnit } from '../types';
import { MOCK_EQUIPMENT } from '../constants'; // Using mock data
import EquipmentListItem from '../components/equipment/EquipmentListItem';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { PlusCircleIcon, FunnelIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import TextInput from '../components/ui/TextInput';

// Helper to calculate next maintenance date and status (can be moved to utils)
export const calculateMaintenanceDetails = (equipment: Equipment): Equipment & { status: 'OK' | 'Advertencia' | 'Vencido', nextMaintenanceDate: string } => {
  let status: 'OK' | 'Advertencia' | 'Vencido' = 'OK';
  let nextMaintenanceDateStr = 'N/D';

  if (equipment.lastMaintenanceDate && equipment.maintenanceFrequency) {
    const lastMaintenance = new Date(equipment.lastMaintenanceDate);
    // Create a new date object for calculation to avoid mutating the original lastMaintenance
    const calculationDate = new Date(equipment.lastMaintenanceDate);
    const { value, unit } = equipment.maintenanceFrequency;
    let monthsToAdd = 0;
    switch (unit) {
      case MaintenanceFrequencyUnit.DAYS: monthsToAdd = value / 30; break;
      case MaintenanceFrequencyUnit.WEEKS: monthsToAdd = value / 4; break;
      case MaintenanceFrequencyUnit.MONTHS: monthsToAdd = value; break;
      case MaintenanceFrequencyUnit.YEARS: monthsToAdd = value * 12; break;
    }
    
    const nextMaintenanceDate = new Date(calculationDate.setMonth(calculationDate.getMonth() + monthsToAdd));
    nextMaintenanceDateStr = nextMaintenanceDate.toISOString();
    const today = new Date();
    const oneMonthFromNow = new Date(new Date().setMonth(today.getMonth() + 1));

    if (nextMaintenanceDate < today) status = 'Vencido';
    else if (nextMaintenanceDate < oneMonthFromNow) status = 'Advertencia';
    else status = 'OK';
  }
  return { ...equipment, status, nextMaintenanceDate: nextMaintenanceDateStr };
};


const EquipmentPage: React.FC = () => {
  const [filteredEquipment, setFilteredEquipment] = useState<Array<Equipment & { status: 'OK' | 'Advertencia' | 'Vencido', nextMaintenanceDate: string }>>([]);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [deletingEquipmentId, setDeletingEquipmentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let tempEquipment = MOCK_EQUIPMENT.map(calculateMaintenanceDetails);

    if (searchTerm) {
      tempEquipment = tempEquipment.filter(eq =>
        eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter) {
       tempEquipment = tempEquipment.filter(eq => eq.status === statusFilter);
    }
     if (currentUser?.role === UserRole.UNIT_MANAGER && currentUser.unit) {
      tempEquipment = tempEquipment.filter(eq => eq.locationUnit === currentUser.unit);
    }
    setFilteredEquipment(tempEquipment);
  }, [searchTerm, statusFilter, currentUser, MOCK_EQUIPMENT.length]); 


   useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    if (status) {
      setStatusFilter(status);
    }
  }, [location.search]);


  const handleAddEquipment = () => {
    navigate('/equipment/new');
  };

  const handleDeleteEquipment = (id: string) => {
    setDeletingEquipmentId(id);
    setIsConfirmDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deletingEquipmentId) {
      const indexToDelete = MOCK_EQUIPMENT.findIndex(eq => eq.id === deletingEquipmentId);
      if (indexToDelete > -1) {
        MOCK_EQUIPMENT.splice(indexToDelete, 1);
      }
      console.log(`Equipo ${deletingEquipmentId} eliminado.`);
      alert(`Equipo ${deletingEquipmentId} eliminado.`);
      // Re-trigger the effect that filters equipment
      setFilteredEquipment(prev => prev.filter(eq => eq.id !== deletingEquipmentId));
       // Force a re-evaluation of the list if other effects depend on MOCK_EQUIPMENT directly
       // This is a bit of a hack; ideally, MOCK_EQUIPMENT would be state managed higher up or via context.
       const updatedList = MOCK_EQUIPMENT.map(calculateMaintenanceDetails).filter(eq => {
            let matches = true;
            if (searchTerm) {
                matches = matches && (eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    eq.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    eq.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    eq.model.toLowerCase().includes(searchTerm.toLowerCase()));
            }
            if (statusFilter) {
                matches = matches && (eq.status === statusFilter);
            }
            if (currentUser?.role === UserRole.UNIT_MANAGER && currentUser.unit) {
                 matches = matches && (eq.locationUnit === currentUser.unit);
            }
            return matches;
       });
       setFilteredEquipment(updatedList);
    }
    setIsConfirmDeleteModalOpen(false);
    setDeletingEquipmentId(null);
  };
  
  const canAddEquipment = currentUser?.role === UserRole.BIOREN_ADMIN || currentUser?.role === UserRole.UNIT_MANAGER;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-gray-800">Gestión de Equipos</h1>
        {canAddEquipment && (
          <Button onClick={handleAddEquipment} leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>
            Añadir Nuevo Equipo
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 shadow rounded-md flex space-x-4 items-end">
        <TextInput 
            label="Buscar Equipo"
            id="searchEquipment"
            placeholder="ID, Nombre, Marca, Modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            containerClassName="flex-grow"
        />
        <div className="flex-shrink-0">
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select 
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-bioren-blue-light focus:border-bioren-blue-light sm:text-sm rounded-md"
            >
                <option value="">Todos</option>
                <option value="OK">OK</option>
                <option value="Advertencia">Advertencia</option>
                <option value="Vencido">Vencido</option>
            </select>
        </div>
         <Button variant="secondary" onClick={() => { setSearchTerm(''); setStatusFilter('');}} leftIcon={<FunnelIcon className="w-4 h-4 mr-1"/>}>Limpiar Filtros</Button>
      </div>

      {/* Equipment Table */}
      <div className="bg-white shadow overflow-x-auto rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Próx. Mantenimiento</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criticidad</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEquipment.length > 0 ? (
              filteredEquipment.map(equipment => (
                <EquipmentListItem
                  key={equipment.id}
                  equipment={equipment}
                  onDelete={handleDeleteEquipment}
                />
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                  No se encontraron equipos que coincidan con sus criterios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Modals */}
      {isConfirmDeleteModalOpen && (
        <Modal
          isOpen={isConfirmDeleteModalOpen}
          onClose={() => setIsConfirmDeleteModalOpen(false)}
          title="Confirmar Eliminación"
          size="sm"
          footerActions={
            <>
              <Button variant="secondary" onClick={() => setIsConfirmDeleteModalOpen(false)}>Cancelar</Button>
              <Button variant="danger" onClick={confirmDelete} className="ml-3">Eliminar</Button>
            </>
          }
        >
          <p>¿Está seguro de que desea eliminar el equipo con ID: {deletingEquipmentId}? Esta acción no se puede deshacer.</p>
        </Modal>
      )}
    </div>
  );
};

export default EquipmentPage;