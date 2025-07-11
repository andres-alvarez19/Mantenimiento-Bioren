// pages/IssuesListPage.tsx

import React, { useState, useEffect } from 'react';
import { IssueReport, UserRole, IssueSeverity } from '../types';
import Button from '../components/ui/Button';
import { PlusCircleIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/ui/Modal';
import IssueReportForm from '../components/issues/IssueReportForm';
import Badge from '../components/ui/Badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { getEquipments } from '../lib/api/services/equipmentService';
import { getIssueReports, deleteIssueReport, updateIssueReport } from '../lib/api/services/issueReportService';

const getSeverityColor = (severity: IssueSeverity): 'red' | 'orange' | 'yellow' => {
    switch(severity) {
        case IssueSeverity.CRITICAL: return 'red';
        case IssueSeverity.MODERATE: return 'orange';
        case IssueSeverity.MINOR: return 'yellow';
        default: return 'yellow';
    }
}

const IssuesListPage: React.FC = () => {
    // Estado para guardar las incidencias que vienen de la API
    const [issues, setIssues] = useState<IssueReport[]>([]);
    const [filteredIssues, setFilteredIssues] = useState<IssueReport[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [allEquipment, setAllEquipment] = useState<any[]>([]);
    const [equipmentError, setEquipmentError] = useState<string | null>(null);

    // Estados para filtros y modales (sin cambios)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingIssue, setEditingIssue] = useState<IssueReport | null>(null);
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [deletingIssueId, setDeletingIssueId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterSeverity, setFilterSeverity] = useState<string>('');

    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const location = useLocation();

    // useEffect para llamar a la API y obtener las incidencias
    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const data: IssueReport[] = await getIssueReports();
                setIssues(data);
                setError(null);
            } catch (error) {
                console.error(error);
                setError('No se pudieron cargar las incidencias.');
            }
        };
        fetchIssues();
    }, []); // Se ejecuta solo una vez al cargar la página

    // useEffect para obtener todos los equipos (para filtrar por unidad)
    useEffect(() => {
        const fetchEquipments = async () => {
            try {
                const data = await getEquipments();
                setAllEquipment(data);
                setEquipmentError(null);
            } catch (error) {
                console.error(error);
                setEquipmentError('No se pudieron cargar los equipos para filtrar incidencias.');
            }
        };
        fetchEquipments();
    }, []);

    // useEffect para filtrar las incidencias cuando cambian los filtros o los datos base
    useEffect(() => {
        let tempIssues = [...issues];

        if (filterStatus) {
            tempIssues = tempIssues.filter(issue => issue.status === filterStatus);
        }
        if (filterSeverity) {
            tempIssues = tempIssues.filter(issue => issue.severity === filterSeverity);
        }
        if (currentUser?.role === UserRole.UNIT_MANAGER && currentUser.unit && allEquipment.length > 0) {
            const unitEquipmentIds = allEquipment
                .filter((eq: any) => eq.locationUnit === currentUser.unit)
                .map((eq: any) => eq.id);
            tempIssues = tempIssues.filter(issue => unitEquipmentIds.includes(issue.equipmentId));
        }

        setFilteredIssues(tempIssues);
    }, [issues, filterStatus, filterSeverity, currentUser, allEquipment]);

    // El resto de las funciones (handleAdd, handleEdit, etc.) por ahora se quedan igual,
    // las conectaremos a la API más adelante.

    const handleAddNewIssue = () => navigate('/issues/new');
    const handleEditIssue = (issue: IssueReport) => {
        setEditingIssue(issue);
        setIsEditModalOpen(true);
    };
    const handleDeleteIssue = (issueId: string) => {
        setDeletingIssueId(issueId);
        setIsConfirmDeleteModalOpen(true);
    };
    // --- REEMPLAZA LA FUNCIÓN confirmDelete CON ESTA ---
    const confirmDelete = async () => {
        if (!deletingIssueId) return;
        try {
            await deleteIssueReport(deletingIssueId);
            alert('¡Incidencia eliminada exitosamente!');
            setIssues(prev => prev.filter(issue => issue.id !== deletingIssueId));
        } catch (error) {
            console.error("Error al eliminar la incidencia:", error);
            alert(`Error: ${error instanceof Error ? error.message : "Ocurrió un error"}`);
        } finally {
            setIsConfirmDeleteModalOpen(false);
            setDeletingIssueId(null);
        }
    };


    // --- REEMPLAZA LA FUNCIÓN handleFormSubmit CON ESTA ---
    const handleFormSubmit = async (updatedIssue: IssueReport) => {
        if (!editingIssue) return;
        try {
            await updateIssueReport(editingIssue.id, {
                description: updatedIssue.description,
                severity: updatedIssue.severity,
                status: updatedIssue.status,
            });
            alert('¡Incidencia actualizada exitosamente!');
            setIssues(prevIssues =>
                prevIssues.map(issue =>
                    issue.id === updatedIssue.id ? { ...issue, ...updatedIssue } : issue
                )
            );
        } catch (error) {
            console.error("Error al actualizar la incidencia:", error);
            alert(`Error: ${error instanceof Error ? error.message : "Ocurrió un error"}`);
        } finally {
            setIsEditModalOpen(false);
            setEditingIssue(null);
        }
    };



    const canManageIssues = currentUser?.role === UserRole.BIOREN_ADMIN || currentUser?.role === UserRole.UNIT_MANAGER;

    // El JSX (la parte visual) permanece casi igual.
    return (
        <div className="space-y-6">
            {equipmentError && (
                <div className="bg-red-100 text-red-700 p-4 rounded shadow text-center">
                    {equipmentError}
                </div>
            )}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-semibold text-gray-800">Incidencias Reportadas</h1>
                {canManageIssues && (
                    <Button onClick={handleAddNewIssue} leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>
                        Reportar Nueva Incidencia
                    </Button>
                )}
            </div>

            {error ? (
                <div className="bg-red-100 text-red-700 p-4 rounded shadow text-center">
                    {error}
                </div>
            ) : (
                <>
                    <div className="bg-white p-4 shadow rounded-md flex space-x-4 items-end">
                        <div>
                            <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <select id="filterStatus" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-bioren-blue-light focus:border-bioren-blue-light sm:text-sm rounded-md">
                                <option value="">Todos los Estados</option>
                                <option value="Abierto">Abierto</option>
                                <option value="En Progreso">En Progreso</option>
                                <option value="Resuelto">Resuelto</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="filterSeverity" className="block text-sm font-medium text-gray-700 mb-1">Severidad</label>
                            <select id="filterSeverity" value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-bioren-blue-light focus:border-bioren-blue-light sm:text-sm rounded-md">
                                <option value="">Todas las Severidades</option>
                                {Object.values(IssueSeverity).map(sev => <option key={sev} value={sev}>{sev}</option>)}
                            </select>
                        </div>
                        <Button variant="secondary" onClick={() => { setFilterStatus(''); setFilterSeverity('');}}>Limpiar Filtros</Button>
                    </div>

                    <div className="bg-white shadow overflow-x-auto rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reportado Por</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha/Hora</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severidad</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {filteredIssues.length > 0 ? filteredIssues.map(issue => (
                                <tr key={issue.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{issue.equipmentName || issue.equipmentId}</td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 max-w-xs truncate">{issue.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{issue.reportedBy}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(issue.dateTime), 'PPpp', { locale: es })}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <Badge text={issue.severity} color={getSeverityColor(issue.severity)} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <Badge text={issue.status} color={issue.status === 'Abierto' ? 'red' : issue.status === 'En Progreso' ? 'yellow' : 'green'} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                        {canManageIssues && (
                                            <>
                                                <Button variant="ghost" size="sm" onClick={() => handleEditIssue(issue)} title="Editar Incidencia">
                                                    <PencilSquareIcon className="w-5 h-5 text-yellow-600"/>
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteIssue(issue.id)} title="Eliminar Incidencia">
                                                    <TrashIcon className="w-5 h-5 text-red-600"/>
                                                </Button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No se encontraron incidencias.</td></tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {isEditModalOpen && editingIssue && (
                <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Reporte de Incidencia" size="lg">
                    <IssueReportForm initialData={editingIssue} onSubmit={handleFormSubmit} onCancel={() => setIsEditModalOpen(false)} />
                </Modal>
            )}

            {isConfirmDeleteModalOpen && (
                <Modal isOpen={isConfirmDeleteModalOpen} onClose={() => setIsConfirmDeleteModalOpen(false)} title="Confirmar Eliminación" size="sm"
                       footerActions={
                           <>
                               <Button variant="secondary" onClick={() => setIsConfirmDeleteModalOpen(false)}>Cancelar</Button>
                               <Button variant="danger" onClick={confirmDelete} className="ml-3">Eliminar</Button>
                           </>
                       }
                >
                    <p>¿Está seguro de que desea eliminar la incidencia seleccionada? Esta acción no se puede deshacer.</p>
                </Modal>
            )}
        </div>
    );
};

export default IssuesListPage;