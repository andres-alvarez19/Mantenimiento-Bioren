
import React, { useMemo } from 'react';
import DashboardCard from '../components/dashboard/DashboardCard';
import { MOCK_EQUIPMENT, MOCK_ISSUES } from '../constants';
import { ChartDataPoint, Equipment } from '../types';
import { WrenchScrewdriverIcon, ExclamationTriangleIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import SimplePieChart from '../components/charts/SimplePieChart';
import SimpleBarChart from '../components/charts/SimpleBarChart';
import { useNavigate } from 'react-router-dom';
import { es } from 'date-fns/locale/es';
import { format } from 'date-fns';


const calculateEquipmentStatus = (equipment: Equipment): 'OK' | 'Advertencia' | 'Vencido' => {
  if (!equipment.lastMaintenanceDate || !equipment.maintenanceFrequency) {
    return 'OK'; 
  }
  const lastMaintenance = new Date(equipment.lastMaintenanceDate);
  const { value, unit } = equipment.maintenanceFrequency;
  let monthsToAdd = 0;
  if (unit === 'Días') monthsToAdd = value / 30;
  else if (unit === 'Semanas') monthsToAdd = value / 4;
  else if (unit === 'Meses') monthsToAdd = value;
  else if (unit === 'Años') monthsToAdd = value * 12;

  const nextMaintenanceDate = new Date(new Date(lastMaintenance).setMonth(lastMaintenance.getMonth() + monthsToAdd));
  const today = new Date();
  const oneMonthFromNow = new Date(new Date().setMonth(today.getMonth() + 1));

  if (nextMaintenanceDate < today) return 'Vencido';
  if (nextMaintenanceDate < oneMonthFromNow) return 'Advertencia';
  return 'OK';
};


const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const totalEquipment = MOCK_EQUIPMENT.length;
  
  const equipmentWithStatus = useMemo(() => 
    MOCK_EQUIPMENT.map(eq => {
        const status = calculateEquipmentStatus(eq);
        let nextMaintenanceDate;
        if (eq.lastMaintenanceDate && eq.maintenanceFrequency) {
            const lastMaint = new Date(eq.lastMaintenanceDate);
            const { value, unit } = eq.maintenanceFrequency;
            let months = 0;
            if (unit === 'Días') months = value / 30;
            else if (unit === 'Semanas') months = value / 4;
            else if (unit === 'Meses') months = value;
            else if (unit === 'Años') months = value * 12;
            nextMaintenanceDate = new Date(new Date(lastMaint).setMonth(lastMaint.getMonth() + months)).toISOString();
        }
        return {...eq, status, nextMaintenanceDate};
    }), 
  [MOCK_EQUIPMENT]); // Dependency on MOCK_EQUIPMENT itself, if its contents can change. Length is not enough if items are mutated.

  const overdueEquipmentCount = equipmentWithStatus.filter(e => e.status === 'Vencido').length;
  const warningEquipmentCount = equipmentWithStatus.filter(e => e.status === 'Advertencia').length;
  const okEquipmentCount = totalEquipment - overdueEquipmentCount - warningEquipmentCount;

  const openIssuesCount = MOCK_ISSUES.filter(issue => issue.status === 'Abierto').length;

  const equipmentStatusData: ChartDataPoint[] = [
    { name: 'OK', value: okEquipmentCount },
    { name: 'Advertencia', value: warningEquipmentCount },
    { name: 'Vencido', value: overdueEquipmentCount },
  ];
  const statusColors = ['#22c55e', '#f59e0b', '#ef4444']; // Green, Amber, Red

  const failureTrendData: ChartDataPoint[] = MOCK_EQUIPMENT.slice(0, 5).map(eq => ({
    name: eq.name.substring(0,15) + "...", // Shorten name for chart
    value: MOCK_ISSUES.filter(issue => issue.equipmentId === eq.id).length, // Number of issues for this equipment
  }));
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-gray-800">Panel Principal BIOREN</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Total de Equipos" 
          value={totalEquipment} 
          icon={<WrenchScrewdriverIcon className="w-8 h-8"/>}
          colorClass="bg-blue-500"
          onClick={() => navigate('/equipment')}
        />
        <DashboardCard 
          title="Equipos OK" 
          value={okEquipmentCount} 
          icon={<CheckCircleIcon className="w-8 h-8"/>}
          colorClass="bg-status-ok"
          onClick={() => navigate('/equipment?status=OK')}
        />
        <DashboardCard 
          title="Advertencia de Mantenimiento" 
          value={warningEquipmentCount} 
          icon={<ClockIcon className="w-8 h-8"/>}
          colorClass="bg-status-warning"
          onClick={() => navigate('/equipment?status=Advertencia')}
        />
        <DashboardCard 
          title="Mantenimiento Vencido" 
          value={overdueEquipmentCount} 
          icon={<ExclamationTriangleIcon className="w-8 h-8"/>}
          colorClass="bg-status-overdue"
          onClick={() => navigate('/equipment?status=Vencido')}
        />
        <DashboardCard 
            title="Incidencias Abiertas" 
            value={openIssuesCount} 
            icon={<ExclamationTriangleIcon className="w-8 h-8"/>}
            colorClass="bg-orange-500"
            onClick={() => navigate('/issues?status=Abierto')}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Estado de los Equipos</h2>
          <SimplePieChart data={equipmentStatusData} colors={statusColors} />
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Equipos Propensos a Fallos (por incidencias reportadas)</h2>
           <SimpleBarChart data={failureTrendData} dataKey="value" barColor="#ef4444" />
        </div>
      </div>

      {/* Quick Actions or Recent Activity can be added here */}
      {/* Example: List of upcoming maintenances */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Mantenimientos Próximos (Siguientes 30 días)</h2>
        <ul className="space-y-2">
            {equipmentWithStatus
                .filter(eq => eq.status === 'Advertencia')
                .slice(0,5) // Show top 5
                .map(eq => (
                    <li key={eq.id} className="p-2 border rounded-md hover:bg-gray-50">
                        <span className="font-medium">{eq.name} ({eq.id})</span> - Próximo vencimiento: {eq.nextMaintenanceDate ? format(new Date(eq.nextMaintenanceDate), 'P', { locale: es }) : 'N/D'}
                    </li>
            ))}
            {equipmentWithStatus.filter(eq => eq.status === 'Advertencia').length === 0 && (
                <p className="text-gray-500">Ningún equipo requiere mantenimiento en los próximos 30 días.</p>
            )}
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;