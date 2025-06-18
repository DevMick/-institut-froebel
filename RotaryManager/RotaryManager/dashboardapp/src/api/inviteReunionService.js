import axios from 'axios';
import { API_BASE_URL } from '../config';

const BASE_URL = `${API_BASE_URL}/api/clubs`;

// Add axios interceptor for authentication
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Récupérer tous les invités d'une réunion
export const getInvitesReunion = async (clubId, reunionId) => {
  try {
    const response = await axios.get(`${BASE_URL}/${clubId}/reunions/${reunionId}/invites`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Erreur lors de la récupération des invités');
  }
};

// Récupérer un invité spécifique
export const getInviteReunion = async (clubId, reunionId, inviteId) => {
  try {
    const response = await axios.get(`${BASE_URL}/${clubId}/reunions/${reunionId}/invites/${inviteId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Erreur lors de la récupération de l\'invité');
  }
};

// Ajouter un invité
export const ajouterInvite = async (clubId, reunionId, inviteData) => {
  try {
    const response = await axios.post(`${BASE_URL}/${clubId}/reunions/${reunionId}/invites`, inviteData);
    return response.data;
  } catch (error) {
    console.error('Erreur détaillée:', error.response?.data);
    throw new Error(error.response?.data || 'Erreur lors de l\'ajout de l\'invité');
  }
};

// Modifier un invité
export const modifierInvite = async (clubId, reunionId, inviteId, inviteData) => {
  try {
    const response = await axios.put(`${BASE_URL}/${clubId}/reunions/${reunionId}/invites/${inviteId}`, inviteData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Erreur lors de la modification de l\'invité');
  }
};

// Supprimer un invité
export const supprimerInvite = async (clubId, reunionId, inviteId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${clubId}/reunions/${reunionId}/invites/${inviteId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Erreur lors de la suppression de l\'invité');
  }
};

// Ajouter plusieurs invités en lot
export const ajouterInvitesBatch = async (clubId, reunionId, invitesData) => {
  try {
    const response = await axios.post(`${BASE_URL}/${clubId}/reunions/${reunionId}/invites/batch`, invitesData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Erreur lors de l\'ajout en lot des invités');
  }
};

// Récupérer la liste des organisations représentées
export const getOrganisationsInvites = async (clubId, reunionId) => {
  try {
    const response = await axios.get(`${BASE_URL}/${clubId}/reunions/${reunionId}/invites/organisations`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Erreur lors de la récupération des organisations');
  }
}; 