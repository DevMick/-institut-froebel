import axios from 'axios';
import { API_BASE_URL } from '../config';

// Récupérer tous les membres d'un club
export const getMembres = async (clubId) => {
  try {
    console.log('Appel API membres pour clubId:', clubId);
    const response = await axios.get(`${API_BASE_URL}/api/Auth/club/${clubId}/members`);
    console.log('Réponse brute API membres:', response);
    console.log('Données membres:', response.data);
    
    const membres = Array.isArray(response.data) ? response.data : response.data.members || [];
    console.log('Membres traités:', membres);
    
    return membres;
  } catch (error) {
    console.error('Erreur API membres:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des membres');
  }
};

// Récupérer un membre spécifique
export const getMembre = async (clubId, membreId) => {
  try {
    const response = await axios.get(`/api/clubs/${clubId}/membres/${membreId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du membre');
  }
};

// Créer un nouveau membre
export const createMembre = async (clubId, membreData) => {
  try {
    const response = await axios.post(`/api/clubs/${clubId}/membres`, membreData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la création du membre');
  }
};

// Mettre à jour un membre
export const updateMembre = async (clubId, membreId, membreData) => {
  try {
    const response = await axios.put(`/api/clubs/${clubId}/membres/${membreId}`, membreData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du membre');
  }
};

// Supprimer un membre
export const deleteMembre = async (clubId, membreId) => {
  try {
    await axios.delete(`/api/clubs/${clubId}/membres/${membreId}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du membre');
  }
};

// Récupérer les départements
export const getDepartements = async (clubId) => {
  try {
    const response = await axios.get(`/api/clubs/${clubId}/departements`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des départements');
  }
}; 