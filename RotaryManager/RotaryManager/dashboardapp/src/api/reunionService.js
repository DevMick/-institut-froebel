import axios from 'axios';
import { API_BASE_URL } from '../config';

const BASE_URL = `${API_BASE_URL}/clubs`;

// Add axios interceptor for authentication
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur de réponse pour gérer le 401 (token expiré)
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const handleResponse = (response) => {
  if (!response.ok) {
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }
  return response.data;
};

function getClubIdFromStorage() {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.clubId;
    } catch (e) {
      return null;
    }
  }
  return null;
}

// Récupérer toutes les réunions d'un club
export const getReunions = async (clubId) => {
  const realClubId = clubId || getClubIdFromStorage();
  if (!realClubId) throw new Error('ClubId non trouvé');
  try {
    const response = await axios.get(`${BASE_URL}/${realClubId}/reunions`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Récupérer une réunion spécifique
export const getReunion = async (clubId, reunionId) => {
  const realClubId = clubId || getClubIdFromStorage();
  if (!realClubId) throw new Error('ClubId non trouvé');
  try {
    const response = await axios.get(`${BASE_URL}/${realClubId}/reunions/${reunionId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Créer une nouvelle réunion
export const createReunion = async (clubId, reunionData) => {
  const realClubId = clubId || getClubIdFromStorage();
  if (!realClubId) throw new Error('ClubId non trouvé');
  try {
    const response = await axios.post(`${BASE_URL}/${realClubId}/reunions`, reunionData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la création de la réunion');
  }
};

// Mettre à jour une réunion
export const updateReunion = async (clubId, reunionId, reunionData) => {
  const realClubId = clubId || getClubIdFromStorage();
  if (!realClubId) throw new Error('ClubId non trouvé');
  try {
    const response = await axios.put(`${BASE_URL}/${realClubId}/reunions/${reunionId}`, reunionData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de la réunion');
  }
};

// Supprimer une réunion
export const deleteReunion = async (clubId, reunionId) => {
  const realClubId = clubId || getClubIdFromStorage();
  if (!realClubId) throw new Error('ClubId non trouvé');
  try {
    await axios.delete(`${BASE_URL}/${realClubId}/reunions/${reunionId}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de la réunion');
  }
};

// Récupérer les types de réunion
export const getTypesReunion = async (clubId) => {
  const realClubId = clubId || getClubIdFromStorage();
  if (!realClubId) throw new Error('ClubId non trouvé');
  try {
    const response = await axios.get(`${BASE_URL}/${realClubId}/types-reunion`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des types de réunion');
  }
};

export const reunionService = {
  getReunions: getReunions,
  getReunion: getReunion,
  createReunion: createReunion,
  updateReunion: updateReunion,
  deleteReunion: deleteReunion,
  getTypesReunion: getTypesReunion
}; 