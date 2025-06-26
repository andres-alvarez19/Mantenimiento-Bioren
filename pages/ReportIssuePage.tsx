// pages/ReportIssuePage.tsx

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import IssueReportForm from '../components/issues/IssueReportForm';
import { IssueReport } from '../types';
import { useAuth } from '../contexts/AuthContext'; // Importamos useAuth para obtener el usuario actual

const ReportIssuePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth(); // Obtenemos el usuario actual del contexto

  const queryParams = new URLSearchParams(location.search);
  const equipmentIdFromUrl = queryParams.get('equipmentId') || undefined;

  const handleSubmitIssue = async (issueReportData: Omit<IssueReport, 'id' | 'dateTime' | 'reportedBy'>) => {
    if (!currentUser) {
      alert("Error: Debes estar logueado para reportar una incidencia.");
      return;
    }

    // Completamos los datos de la incidencia con la información del usuario logueado
    const fullIssueReport = {
      ...issueReportData,
      reportedBy: currentUser.name,
    };

    try {
      const response = await fetch('http://localhost:4000/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullIssueReport),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al reportar la incidencia.');
      }

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