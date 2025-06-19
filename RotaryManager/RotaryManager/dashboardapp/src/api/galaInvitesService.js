import axios from 'axios';

const API_URL = 'http://localhost:5265';

export const getInvitesByGala = async (galaId, recherche = '') => {
  const params = recherche ? { recherche } : {};
  const response = await axios.get(`${API_URL}/api/gala-invites/gala/${galaId}`, { params });
  return response.data;
};

export const getInvite = async (id) => {
  const response = await axios.get(`${API_URL}/api/gala-invites/${id}`);
  return response.data;
};

export const createInvite = async (inviteData) => {
  const payload = {
    GalaId: inviteData.GalaId,
    Nom_Prenom: inviteData.Nom_Prenom
  };
  const response = await axios.post(`${API_URL}/api/gala-invites`, payload);
  return response.data;
};

export const updateInvite = async (id, inviteData) => {
  const payload = {
    Nom_Prenom: inviteData.Nom_Prenom
  };
  const response = await axios.put(`${API_URL}/api/gala-invites/${id}`, payload);
  return response.data;
};

export const deleteInvite = async (id) => {
  if (!id) {
    console.error('ID invalide pour la suppression de l\'invité');
    throw new Error('ID invalide pour la suppression de l\'invité');
  }
  const response = await axios.delete(`${API_URL}/api/gala-invites/${id}`);
  return response.data;
};

export const affecterTable = async (inviteId, tableId) => {
  const response = await axios.post(`${API_URL}/api/gala-invites/${inviteId}/affecter-table`, { TableId: tableId });
  return response.data;
};

export const retirerTable = async (inviteId) => {
  const response = await axios.delete(`${API_URL}/api/gala-invites/${inviteId}/retirer-table`);
  return response.data;
};

export const importInvitesExcel = async (galaId, file) => {
  const formData = new FormData();
  formData.append('GalaId', galaId);
  formData.append('FichierExcel', file);
  const response = await axios.post(`${API_URL}/api/gala-invites/import-excel-file`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}; 