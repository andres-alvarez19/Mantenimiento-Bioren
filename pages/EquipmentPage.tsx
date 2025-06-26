// pages/EquipmentPage.tsx

import { calculateMaintenanceDetails, transformApiDataToEquipment } from '../utils/maintenance';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Equipment, UserRole } from '../types';
import EquipmentListItem from '../components/equipment/EquipmentListItem';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { PlusCircleIcon, FunnelIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import TextInput from '../components/ui/TextInput';
import { calculateMaintenanceDetails } from '../utils/maintenance';

const EquipmentPage: React.FC = () => {
    const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
    const [filteredEquipment, setFilteredEquipment] = useState<Array<Equipment & { status: 'OK' | 'Advertencia' | 'Vencido', nextMaintenanceDate: string }>>([]);
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [deletingEquipmentId, setDeletingEquipmentId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Dentro de EquipmentPage.tsx

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const response = await fetch('http://localhost:4000/api/equipment');
                if (!response.ok) throw new Error('La respuesta de la red no fue exitosa');

                const dataFromApi: any[] = await response.json();

                // Usamos nuestra nueva función para transformar cada item
                const transformedData: Equipment[] = dataFromApi.map(transformApiDataToEquipment);

                setAllEquipment(transformedData);

            } catch (error) {
                console.error("Error al obtener los equipos:", error);
            }
        };

        fetchEquipment();
    }, []);


    useEffect(() => {
        let tempEquipment = allEquipment.map(calculateMaintenanceDetails);

        if (searchTerm) {
            tempEquipment = tempEquipment.filter(eq =>
                eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                eq.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (eq.brand && eq.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (eq.model && eq.model.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        if (statusFilter) {
            tempEquipment = tempEquipment.filter(eq => eq.status === statusFilter);
        }
        if (currentUser?.role === UserRole.UNIT_MANAGER && currentUser.unit) {
            tempEquipment = tempEquipment.filter(eq => eq.locationUnit === currentUser.unit);
        }
        setFilteredEquipment(tempEquipment);
    }, [searchTerm, statusFilter, currentUser, allEquipment]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const status = params.get('status');
        if (status) {
            setStatusFilter(status);
        }
    }, [location.search]);

    const handleAddEquipment = () => navigate('/equipment/new');

    const handleDeleteEquipment = (id: string) => {
        setDeletingEquipmentId(id);
        setIsConfirmDeleteModalOpen(true);
    };


    //Nueva funcion para manejar la eliminacion de equipos
    const confirmDelete = async () => {
        if (!deletingEquipmentId) {
            alert("Error: No se ha especificado un equipo para eliminar.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:4000/api/equipment/${deletingEquipmentId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error al eliminar el equipo.");
            }

            alert("¡Equipo eliminado exitosamente!");
            // Actualizamos el estado local para quitar el equipo de la lista sin recargar la página
            setAllEquipment(prev => prev.filter(eq => eq.id !== deletingEquipmentId));

        } catch (error) {
            console.error("Error al eliminar el equipo:", error);
            alert(`Error: ${error instanceof Error ? error.message : "Ocurrió un error"}`);
        } finally {
            // Cerramos el modal de confirmación en cualquier caso
            setIsConfirmDeleteModalOpen(false);
            setDeletingEquipmentId(null);
        }
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

            <div className="bg-white p-4 shadow rounded-md flex space-x-4 items-end">
                <TextInput
                    label="Buscar Equipo" id="searchEquipment"
                    placeholder="ID, Nombre, Marca, Modelo..."
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    containerClassName="flex-grow"
                />
                <div className="flex-shrink-0">
                    <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select
                        id="statusFilter" value={statusFilter}
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
                                key={equipment.id} equipment={equipment}
                                onDelete={handleDeleteEquipment}
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                                Cargando equipos o no hay equipos para mostrar...
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {isConfirmDeleteModalOpen && (
                <Modal
                    isOpen={isConfirmDeleteModalOpen} onClose={() => setIsConfirmDeleteModalOpen(false)}
                    title="Confirmar Eliminación" size="sm"
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