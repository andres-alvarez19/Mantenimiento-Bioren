import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getIssueReports, getIssueReportById, createIssueReport, updateIssueReport, deleteIssueReport } from '../services/issueReportService';
import { IssueReport } from '../../../types';

export const useIssueReports = () => {
  return useQuery({
    queryKey: ['issueReports'],
    queryFn: getIssueReports,
  });
};

export const useIssueReport = (id: string) => {
  return useQuery({
    queryKey: ['issueReport', id],
    queryFn: () => getIssueReportById(id),
    enabled: !!id,
  });
};

export const useCreateIssueReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newIssueReport: Omit<IssueReport, 'id'>) => createIssueReport(newIssueReport),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issueReports'] });
    },
  });
};

export const useUpdateIssueReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updatedIssueReport }: { id: string, updatedIssueReport: Partial<IssueReport> }) => updateIssueReport(id, updatedIssueReport),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['issueReports'] });
      queryClient.setQueryData(['issueReport', data.id], data);
    },
  });
};

export const useDeleteIssueReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteIssueReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issueReports'] });
    },
  });
}; 