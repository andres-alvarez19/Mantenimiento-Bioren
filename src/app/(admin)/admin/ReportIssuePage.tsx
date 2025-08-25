// pages/ReportIssuePage.tsx

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import IssueReportForm from '@/features/admin/components/issues/IssueReportForm';
import { IssueReport } from '@/types';
import { useAuth } from '@/hooks/useAuth'; // Importamos useAuth para obtener el usuario actual
import { createIssueReport } from '@/lib/api/services/issueReportService';

const ReportIssuePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth(); // Obtenemos el usuario actual del contexto

  const queryParams = new URLSearchParams(location.search);
  const equipmentIdFromUrl = queryParams.get('equipmentId') || undefined;

  const handleSubmitIssue = async (issueReportData: Omit<IssueReport, 'id'> & { id?: string }) => {
    if (!currentUser) {
      alert("Error: Debes estar logueado para reportar una incidencia.");
      return;
    }

    const { id: _id, ...dataWithoutId } = issueReportData;

    try {
      await createIssueReport(dataWithoutId);
      alert('¡Incidencia reportada exitosamente!');
      navigate('/issues'); // Redirigimos a la lista de incidencias

    } catch (error) {
      console.error("Error al enviar el reporte:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Ocurrió un error"}`);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
      <div className="max-w-2xl mx-auto">
        <IssueReportForm
            onSubmit={handleSubmitIssue}
            onCancel={handleCancel}
            equipmentIdFromUrl={equipmentIdFromUrl}
        />
      </div>
  );
};

export default ReportIssuePage;
