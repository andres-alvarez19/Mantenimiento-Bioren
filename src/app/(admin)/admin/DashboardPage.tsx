// pages/DashboardPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { es } from 'date-fns/locale/es';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

import DashboardCard from '@/features/admin/components/dashboard/DashboardCard';
import SimplePieChart from '@/features/admin/components/charts/SimplePieChart';
import SimpleBarChart from '@/features/admin/components/charts/SimpleBarChart';

import { Equipment, IssueReport, ChartDataPoint, UserRole } from '@/types';
import { calculateMaintenanceDetails, transformApiDataToEquipment } from '@/lib/utils/maintenance';
import { getEquipments, EquipmentResponse } from '@/lib/api/services/equipmentService';
import { getIssueReports } from '@/lib/api/services/issueReportService';
import { WrenchScrewdriverIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [allEquipment, setAllEquipment] = useState<EquipmentResponse[]>([]);
    const [allIssues, setAllIssues] = useState<IssueReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [equipData, issuesData] = await Promise.all([
                    getEquipments(),
                    getIssueReports(),
                ]);
                setAllEquipment(equipData);
                setAllIssues(issuesData);
                setError(null);
            } catch (error) {
                console.error(error);
                setError('No se pudieron cargar los datos para el dashboard.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    // --- INICIO DE LA CORRECCIÓN ---
    // useMemo para filtrar los datos base según el rol del usuario
    const userFilteredData = useMemo(() => {
        // Si es Jefe de Unidad, filtra por la unidad del usuario
        if (currentUser?.role === UserRole.UNIT_MANAGER && currentUser.unit) {
            const filteredEquipment = allEquipment.filter(eq => eq.locationUnit === currentUser.unit);
            const filteredEquipmentIds = filteredEquipment.map(eq => eq.id.toString());
            const filteredIssues = allIssues.filter(issue => filteredEquipmentIds.includes(issue.equipment.id));
            return { equipment: filteredEquipment, issues: filteredIssues };
        }
        // Si es Encargado, filtra por los equipos asignados a su usuario
        else if (currentUser?.role === UserRole.EQUIPMENT_MANAGER && currentUser.id) {
            const filteredEquipment = allEquipment.filter(eq => eq.encargado && eq.encargado.id === parseInt(currentUser.id));
            const filteredEquipmentIds = filteredEquipment.map(eq => eq.id.toString());
            const filteredIssues = allIssues.filter(issue => filteredEquipmentIds.includes(issue.equipment.id));
            return { equipment: filteredEquipment, issues: filteredIssues };
        }
        // Si es admin, ve todos los datos
        return { equipment: allEquipment, issues: allIssues };
    }, [currentUser, allEquipment, allIssues]);

    // Función helper para convertir EquipmentResponse a Equipment
    const mapToEquipment = (equip: EquipmentResponse): Equipment => ({
        id: equip.id.toString(),
        institutionalId: equip.institutionalId,
        name: equip.name,
        brand: equip.brand,
        model: equip.model,
        locationBuilding: equip.locationBuilding,
        locationUnit: equip.locationUnit,
        lastCalibrationDate: equip.lastCalibrationDate,
        lastMaintenanceDate: equip.lastMaintenanceDate,
        encargado: equip.encargado ? {
            id: equip.encargado.id.toString(),
            name: equip.encargado.name,
            email: equip.encargado.email,
            role: equip.encargado.role as UserRole,
            unit: equip.encargado.unit
        } : undefined,
        maintenanceFrequency: equip.maintenanceFrequency || { value: 0, unit: 'MONTHS' as any },
        maintenanceRecords: equip.maintenanceRecords,
        customMaintenanceInstructions: equip.customMaintenanceInstructions,
        criticality: equip.criticality as any,
        status: equip.status as any,
        nextMaintenanceDate: equip.nextMaintenanceDate,
        purchasedByGovernment: equip.purchasedByGovernment
    });

    // El resto del código no cambia, ya que ahora operará sobre los datos filtrados en 'userFilteredData'
    const equipmentStats = useMemo(() => {
        const processedEquipment = userFilteredData.equipment.map(equip => {
            const equipment = mapToEquipment(equip);
            return calculateMaintenanceDetails(equipment);
        });

        const okCount = processedEquipment.filter(e => e.status === 'OK').length;
        const warningCount = processedEquipment.filter(e => e.status === 'Advertencia').length;
        const overdueCount = processedEquipment.filter(e => e.status === 'Vencido').length;

        const upcomingMaintenance = processedEquipment
            .filter(eq => eq.status === 'Advertencia')
            .sort((a, b) => new Date(a.nextMaintenanceDate!).getTime() - new Date(b.nextMaintenanceDate!).getTime())
            .slice(0, 5);

        return { okCount, warningCount, overdueCount, upcomingMaintenance };
    }, [userFilteredData.equipment]);

    const openIssuesCount = useMemo(() => {
        return userFilteredData.issues.filter(issue => issue.status === 'Abierto').length;
    }, [userFilteredData.issues]);

    const equipmentStatusData: ChartDataPoint[] = [
        { name: 'OK', value: equipmentStats.okCount },
        { name: 'Advertencia', value: equipmentStats.warningCount },
        { name: 'Vencido', value: equipmentStats.overdueCount },
    ];
    const statusColors = ['#22c55e', '#f59e0b', '#ef4444'];

    const failureTrendData: ChartDataPoint[] = useMemo(() => {
        const issueCounts: { [key: string]: { name: string, count: number } } = {};
        userFilteredData.equipment.forEach(eq => {
            issueCounts[eq.id] = { name: eq.name, count: 0 };
        });
        userFilteredData.issues.forEach(issue => {
            const eqId = issue.equipment.id;
            if (issueCounts[eqId]) {
                issueCounts[eqId].count++;
            }
        });
        return Object.values(issueCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map(item => ({ 
                name: (item.name || 'Sin nombre').substring(0, 15) + "...", 
                value: item.count 
            }));
    }, [userFilteredData.equipment, userFilteredData.issues]);
    // --- FIN DE LA CORRECCIÓN ---


    if (isLoading) {
        return <div className="text-center py-10">Cargando datos del panel...</div>;
    }

    if (error) {
        return <div className="bg-red-100 text-red-700 p-4 rounded shadow text-center">{error}</div>;
    }

    // El resto del JSX no cambia
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-semibold text-gray-800">Panel Principal BIOREN</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <DashboardCard
                    title="Total de Equipos" value={userFilteredData.equipment.length}
                    icon={<WrenchScrewdriverIcon className="w-8 h-8"/>}
                    colorClass="bg-blue-500" onClick={() => navigate('/equipment')}
                />
                <DashboardCard
                    title="Equipos OK" value={equipmentStats.okCount}
                    icon={<CheckCircleIcon className="w-8 h-8"/>}
                    colorClass="bg-status-ok" onClick={() => navigate('/equipment?status=OK')}
                />
                <DashboardCard
                    title="Advertencia" value={equipmentStats.warningCount}
                    icon={<ClockIcon className="w-8 h-8"/>}
                    colorClass="bg-status-warning" onClick={() => navigate('/equipment?status=Advertencia')}
                />
                <DashboardCard
                    title="Mantenimiento Vencido" value={equipmentStats.overdueCount}
                    icon={<ExclamationTriangleIcon className="w-8 h-8"/>}
                    colorClass="bg-status-overdue" onClick={() => navigate('/equipment?status=Vencido')}
                />
                <DashboardCard
                    title="Incidencias Abiertas" value={openIssuesCount}
                    icon={<ExclamationTriangleIcon className="w-8 h-8"/>}
                    colorClass="bg-orange-500" onClick={() => navigate('/issues?status=Abierto')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Estado de los Equipos</h2>
                    <SimplePieChart data={equipmentStatusData.filter(d => d.value > 0)} colors={statusColors} />
                </div>
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Equipos con Más Incidencias</h2>
                    <SimpleBarChart data={failureTrendData.filter(d => d.value > 0)} dataKey="value" barColor="#ef4444" />
                </div>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Mantenimientos Próximos (Siguientes 30 días)</h2>
                <div className="space-y-2">
                    {equipmentStats.upcomingMaintenance.length > 0 ? (
                        equipmentStats.upcomingMaintenance.map(eq => (
                            <div key={eq.id} className="p-2 border rounded-md hover:bg-gray-50 flex justify-between items-center">
                                <span className="font-medium">{eq.name} ({eq.id})</span>
                                <span className="text-sm text-gray-600">
                            Próximo vencimiento: {eq.nextMaintenanceDate ? format(new Date(eq.nextMaintenanceDate), 'dd/MM/yyyy', { locale: es }) : 'N/D'}
                        </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 italic">Ningún equipo requiere mantenimiento en los próximos 30 días.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
