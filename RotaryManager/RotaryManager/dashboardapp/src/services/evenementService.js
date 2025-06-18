import axios from 'axios';
import { API_URL } from '../config';

// Add axios interceptor for authentication
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Configuration globale d'axios pour gérer le chunked encoding
axios.defaults.maxContentLength = Infinity;
axios.defaults.maxBodyLength = Infinity;
axios.defaults.timeout = 30000; // 30 secondes

const getClubId = () => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      if (!userData.clubId) {
        throw new Error('Club ID non trouvé dans les données utilisateur');
      }
      return userData.clubId;
    } catch (error) {
      console.error('Erreur lors de la récupération du clubId:', error);
      throw new Error('Club ID non trouvé dans le stockage local');
    }
  }
  throw new Error('Utilisateur non connecté');
};

export const getEvenements = async (filters = {}) => {
  try {
    const clubId = getClubId();
    const {
      estInterne = null,
      dateDebut = null,
      dateFin = null,
      page = 1,
      pageSize = 10
    } = filters;

    const response = await axios.get(`${API_URL}/clubs/${clubId}/evenements`, {
      params: {
        estInterne,
        dateDebut,
        dateFin,
        page,
        pageSize
      }
    });

    return {
      data: response.data || [],
      pagination: {
        totalCount: parseInt(response.headers['x-total-count'] || '0'),
        currentPage: parseInt(response.headers['x-page'] || '1'),
        currentPageSize: parseInt(response.headers['x-page-size'] || '10')
      }
    };
  } catch (error) {
    console.error('Erreur dans getEvenements:', error);
    throw new Error(error.response?.data || 'Erreur lors de la récupération des événements');
  }
};

export const getEvenement = async (id) => {
  try {
    const clubId = getClubId();
    const response = await axios.get(`${API_URL}/clubs/${clubId}/evenements/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur dans getEvenement:', error);
    throw new Error(error.response?.data || 'Erreur lors de la récupération de l\'événement');
  }
};

export const getEvenementDocuments = async (id) => {
  try {
    const clubId = getClubId();
    const response = await axios.get(`${API_URL}/clubs/${clubId}/evenements/${id}/documents`);
    return response.data;
  } catch (error) {
    console.error('Erreur dans getEvenementDocuments:', error);
    throw new Error(error.response?.data || 'Erreur lors de la récupération des documents');
  }
};

export const getEvenementImages = async (id) => {
  try {
    const clubId = getClubId();
    const response = await axios.get(`${API_URL}/clubs/${clubId}/evenements/${id}/images`);
    return response.data;
  } catch (error) {
    console.error('Erreur dans getEvenementImages:', error);
    throw new Error(error.response?.data || 'Erreur lors de la récupération des images');
  }
};

export const getEvenementBudget = async (id) => {
  try {
    const clubId = getClubId();
    const response = await axios.get(`${API_URL}/clubs/${clubId}/evenements/${id}/budget`);
    return response.data;
  } catch (error) {
    console.error('Erreur dans getEvenementBudget:', error);
    throw new Error(error.response?.data || 'Erreur lors de la récupération du budget');
  }
};

export const getEvenementStatistiques = async (filters = {}) => {
  try {
    const clubId = getClubId();
    const { annee = null, estInterne = null } = filters;
    const response = await axios.get(`${API_URL}/clubs/${clubId}/evenements/statistiques`, {
      params: {
        annee,
        estInterne
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur dans getEvenementStatistiques:', error);
    throw new Error(error.response?.data || 'Erreur lors de la récupération des statistiques');
  }
};

export const createEvenement = async (evenement) => {
  try {
    const clubId = getClubId();
    const response = await axios.post(`${API_URL}/clubs/${clubId}/evenements`, evenement);
    return response.data;
  } catch (error) {
    console.error('Erreur dans createEvenement:', error);
    throw new Error(error.response?.data || 'Erreur lors de la création de l\'événement');
  }
};

export const updateEvenement = async (id, evenement) => {
  try {
    const clubId = getClubId();
    const response = await axios.put(`${API_URL}/clubs/${clubId}/evenements/${id}`, evenement);
    return response.data;
  } catch (error) {
    console.error('Erreur dans updateEvenement:', error);
    throw new Error(error.response?.data || 'Erreur lors de la mise à jour de l\'événement');
  }
};

export const deleteEvenement = async (id) => {
  try {
    const clubId = getClubId();
    const response = await axios.delete(`${API_URL}/clubs/${clubId}/evenements/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur dans deleteEvenement:', error);
    throw new Error(error.response?.data || 'Erreur lors de la suppression de l\'événement');
  }
};

// Export an object for backward compatibility
export const evenementService = {
  getEvenements,
  getEvenement,
  getEvenementDocuments,
  getEvenementImages,
  getEvenementBudget,
  getEvenementStatistiques,
  createEvenement,
  updateEvenement,
  deleteEvenement
}; 