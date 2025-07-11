import apiClient from '../client/apiClient';

export async function validateInvitation(token: string) {
  return apiClient.get(`/invitations/validate`, { params: { token } });
}

export async function activateInvitation(token: string, password: string) {
  return apiClient.post('/invitations/activate', { token, password });
} 