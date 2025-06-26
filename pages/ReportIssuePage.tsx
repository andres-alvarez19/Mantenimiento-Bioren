
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import IssueReportForm from '../components/issues/IssueReportForm';
import { IssueReport } from '../types';
import { MOCK_ISSUES } from '../constants'; // Use for temporary storage

const ReportIssuePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const equipmentIdFromUrl = queryParams.get('equipmentId') || undefined;

  const handleSubmitIssue = (issueReportData: IssueReport) => {
    MOCK_ISSUES.push(issueReportData); 
    console.log('Nueva incidencia reportada:', issueReportData);
    alert('¡Incidencia reportada exitosamente!');
    navigate('/issues'); 
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