import apiClient from '../client/apiClient';
import { IssueReport } from '../../../types';

export const getIssueReports = async (): Promise<IssueReport[]> => {
  const response = await apiClient.get('/issues');
  return response.data;
};

export const getIssueReportById = async (id: string): Promise<IssueReport> => {
  const response = await apiClient.get(`/issues/${id}`);
  return response.data;
};

export const createIssueReport = async (issueReport: Omit<IssueReport, 'id'>): Promise<IssueReport> => {
  const response = await apiClient.post('/issues', issueReport);
  return response.data;
};

export const updateIssueReport = async (id: string, issueReport: Partial<IssueReport>): Promise<IssueReport> => {
  const response = await apiClient.put(`/issues/${id}`, issueReport);
  return response.data;
};

export const deleteIssueReport = async (id: string): Promise<void> => {
  await apiClient.delete(`/issues/${id}`);
}; 