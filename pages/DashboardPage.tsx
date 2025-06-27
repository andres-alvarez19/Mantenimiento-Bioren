// pages/DashboardPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import DashboardCard from '../components/dashboard/DashboardCard';
import { Equipment, IssueReport, ChartDataPoint } from '../types';
import { WrenchScrewdriverIcon, ExclamationTriangleIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import SimplePieChart from '../components/charts/SimplePieChart';
import SimpleBarChart from '../components/charts/SimpleBarChart';
import { useNavigate } from 'react-router-dom';
import { es } from 'date-fns/locale/es';
import { format } from 'date-fns';
import { calculateMaintenanceDetails, transformApiDataToEquipment } from '../utils/maintenance';

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [issues, setIssues] = useState<IssueReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Hacemos las dos peticiones en paralelo
                const [equipResponse, issuesResponse] = await Promise.all([
                    fetch('http://localhost:4000/api/equipment'),
                    fetch('http://localhost:4000/api/issues'),
                ]);
                if (!equipResponse.ok || !issuesResponse.ok) {
                    throw new Error('Error al cargar los datos del dashboard');
                }
                const equipData = await equipResponse.json();
                const issuesData = await issuesResponse.json();

                // Transformamos los datos de equipos como ya sabemos hacer
                const transformedEquipData = equipData.map(transformApiDataToEquipment);

                setEquipment(transformedEquipData);
                setIssues(issuesData);

            } catch (error) {
                console.error(error);
                alert("No se pudieron cargar los datos para el dashboard.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    // Usamos useMemo para calcular las estadísticas solo cuando los datos cambian
    const equipmentStats = useMemo(() => {
        const processedEquipment = equipment.map(calculateMaintenanceDetails);

        const okCount = processedEquipment.filter(e => e.status === 'OK').length;
        const warningCount = processedEquipment.filter(e => e.status === 'Advertencia').length;
        const overdueCount = processedEquipment.filter(e => e.status === 'Vencido').length;

        const upcomingMaintenance = processedEquipment
            .filter(eq => eq.status === 'Advertencia')
            .sort((a, b) => new Date(a.nextMaintenanceDate!).getTime() - new Date(b.nextMaintenanceDate!).getTime())
            .slice(0, 5);

        return { okCount, warningCount, overdueCount, upcomingMaintenance };
    }, [equipment]);

    const openIssuesCount = useMemo(() => {
        return issues.filter(issue => issue.status === 'Abierto').length;
    }, [issues]);

    const equipmentStatusData: ChartDataPoint[] = [
        { name: 'OK', value: equipmentStats.okCount },
        { name: 'Advertencia', value: equipmentStats.warningCount },
        { name: 'Vencido', value: equipmentStats.overdueCount },
    ];
    const statusColors = ['#22c55e', '#f59e0b', '#ef4444'];

    const failureTrendData: ChartDataPoint[] = useMemo(() => {
        const issueCounts = equipment.reduce((acc, eq) => {
            acc[eq.id] = { name: eq.name, count: 0 };
            return acc;
        }, {} as { [key: string]: { name: string, count: number } });

        issues.forEach(issue => {
            if (issueCounts[issue.equipmentId]) {
                issueCounts[issue.equipmentId].count++;
            }
        });

        return Object.values(issueCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map(item => ({ name: item.name.substring(0, 15) + "...", value: item.count }));

    }, [equipment, issues]);

    if (isLoading) {
        return <div className="text-center py-10">Cargando datos del panel...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-semibold text-gray-800">Panel Principal BIOREN</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <DashboardCard
                    title="Total de Equipos" value={equipment.length}
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
                    <SimplePieChart data={equipmentStatusData} colors={statusColors} />
                </div>
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Equipos con Más Incidencias</h2>
                    <SimpleBarChart data={failureTrendData} dataKey="value" barColor="#ef4444" />
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
                        <p className="text-gray-500">Ningún equipo requiere mantenimiento en los próximos 30 días.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;