
import React from 'react';
import Button from '@/components/ui/Button';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

const ReportsPage: React.FC = () => {
  const handleExport = (format: 'Excel' | 'PDF') => {
    alert(`Simulando exportación a ${format}... En una aplicación real, esto generaría y descargaría un archivo.`);
    console.log(`Solicitud para exportar datos a ${format}.`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-gray-800">Informes</h1>
      <div className="bg-white p-6 shadow rounded-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Generar Informes</h2>
        <p className="text-gray-600 mb-6">
          Seleccione el tipo de informe que desea generar. Los datos se pueden exportar para auditoría o análisis.
          (Nota: La funcionalidad de exportación está simulada en este prototipo).
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Equipment Maintenance History Report */}
          <div className="border p-4 rounded-md">
            <h3 className="font-medium text-gray-800">Historial de Mantenimiento de Equipos</h3>
            <p className="text-sm text-gray-500 mt-1 mb-3">Historial detallado del mantenimiento para todos o equipos seleccionados.</p>
            <div className="space-x-2">
              <Button onClick={() => handleExport('Excel')} leftIcon={<DocumentArrowDownIcon className="w-4 h-4"/>}>Exportar a Excel</Button>
              <Button onClick={() => handleExport('PDF')} leftIcon={<DocumentArrowDownIcon className="w-4 h-4"/>}>Exportar a PDF</Button>
            </div>
          </div>

          {/* Unit Equipment Overview */}
          <div className="border p-4 rounded-md">
            <h3 className="font-medium text-gray-800">Resumen de Equipos por Unidad</h3>
            <p className="text-sm text-gray-500 mt-1 mb-3">Resumen de todos los equipos dentro de una unidad específica, incluyendo estado.</p>
            <div className="space-x-2">
              <Button onClick={() => handleExport('Excel')} leftIcon={<DocumentArrowDownIcon className="w-4 h-4"/>}>Exportar a Excel</Button>
              <Button onClick={() => handleExport('PDF')} leftIcon={<DocumentArrowDownIcon className="w-4 h-4"/>}>Exportar a PDF</Button>
            </div>
          </div>

          {/* Failure Analysis Report */}
          <div className="border p-4 rounded-md">
            <h3 className="font-medium text-gray-800">Informe de Análisis de Fallos</h3>
            <p className="text-sm text-gray-500 mt-1 mb-3">Tendencias y estadísticas sobre fallos de equipos e incidencias reportadas.</p>
            <div className="space-x-2">
              <Button onClick={() => handleExport('Excel')} leftIcon={<DocumentArrowDownIcon className="w-4 h-4"/>}>Exportar a Excel</Button>
              <Button onClick={() => handleExport('PDF')} leftIcon={<DocumentArrowDownIcon className="w-4 h-4"/>}>Exportar a PDF</Button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
            <p className="font-bold">Nota del Desarrollador:</p>
            <p>La exportación real de datos (Excel/PDF) requiere un procesamiento backend significativo o bibliotecas frontend especializadas (como jsPDF, SheetJS) y está fuera del alcance de este prototipo solo frontend. Los botones anteriores simulan la acción.</p>
        </div>

      </div>
    </div>
  );
};

export default ReportsPage;
