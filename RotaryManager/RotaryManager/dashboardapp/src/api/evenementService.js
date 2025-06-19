import axios from 'axios';
import { API_BASE_URL } from '../config';

// Add axios interceptor for authentication
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Configuration globale d'axios pour gérer le chunked encoding
axios.defaults.timeout = 30000; // 30 secondes
axios.defaults.maxContentLength = Infinity;
axios.defaults.maxBodyLength = Infinity;

// Fonction utilitaire pour gérer les réponses avec chunked encoding
const handleResponse = (response) => {
  // Si la réponse est valide, retourner les données
  if (response && response.data) {
    return response.data;
  }
  return null;
};

// Fonction utilitaire pour gérer les erreurs de chunked encoding
const handleChunkedError = (error) => {
  // Si c'est une erreur de chunked encoding mais qu'on a des données
  if (error.code === 'ERR_INCOMPLETE_CHUNKED_ENCODING' && error.response?.data) {
    return error.response.data;
  }
  
  // Si c'est une erreur réseau générale
  if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
    throw new Error('Erreur de connexion au serveur. Veuillez vérifier votre connexion.');
  }
  
  // Autres erreurs
  throw new Error(error.response?.data?.message || error.message || 'Une erreur est survenue');
};

// Récupérer le clubId depuis le localStorage
const getClubId = () => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.clubId;
    } catch (error) {
      console.error('Erreur lors de la récupération du clubId:', error);
    }
  }
  return null;
};

export const getEvenements = async (filters = {}) => {
  try {
    const clubId = getClubId();
    console.log('ClubId récupéré:', clubId);
    
    if (!clubId) {
      throw new Error('ClubId non trouvé');
    }

    const {
      estInterne = null,
      dateDebut = null,
      dateFin = null,
      page = 1,
      pageSize = 10
    } = filters;

    const url = `${API_BASE_URL}/api/clubs/${clubId}/evenements`;
    console.log('URL de la requête:', url);
    console.log('Paramètres:', { estInterne, dateDebut, dateFin, page, pageSize });

    const response = await axios.get(url, {
      params: {
        estInterne,
        dateDebut,
        dateFin,
        page,
        pageSize
      }
    });

    const data = handleResponse(response);
    
    // Extraire les informations de pagination des headers
    const totalCount = parseInt(response.headers['x-total-count'] || '0');
    const currentPage = parseInt(response.headers['x-page'] || '1');
    const currentPageSize = parseInt(response.headers['x-page-size'] || '10');

    return {
      data: data || [],
      pagination: {
        totalCount,
        currentPage,
        currentPageSize,
        totalPages: Math.ceil(totalCount / currentPageSize)
      }
    };
  } catch (error) {
    console.error('Erreur dans getEvenements:', error);
    
    // Gestion spéciale pour chunked encoding
    if (error.code === 'ERR_INCOMPLETE_CHUNKED_ENCODING' && error.response?.data) {
      const data = error.response.data;
      return {
        data: Array.isArray(data) ? data : [],
        pagination: {
          totalCount: parseInt(error.response.headers['x-total-count'] || '0'),
          currentPage: parseInt(error.response.headers['x-page'] || '1'),
          currentPageSize: parseInt(error.response.headers['x-page-size'] || '10'),
          totalPages: Math.ceil(parseInt(error.response.headers['x-total-count'] || '0') / parseInt(error.response.headers['x-page-size'] || '10'))
        }
      };
    }
    
    return handleChunkedError(error);
  }
};

export const getEvenement = async (id) => {
  try {
    const clubId = getClubId();
    if (!clubId) {
      throw new Error('ClubId non trouvé');
    }

    const response = await axios.get(`${API_BASE_URL}/api/clubs/${clubId}/evenements/${id}`);
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur dans getEvenement:', error);
    return handleChunkedError(error);
  }
};

export const getEvenementDocuments = async (id) => {
  try {
    const clubId = getClubId();
    if (!clubId) {
      throw new Error('ClubId non trouvé');
    }

    const response = await axios.get(`${API_BASE_URL}/api/clubs/${clubId}/evenements/${id}/documents`);
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur dans getEvenementDocuments:', error);
    return handleChunkedError(error);
  }
};

export const getEvenementImages = async (id) => {
  try {
    const clubId = getClubId();
    if (!clubId) {
      throw new Error('ClubId non trouvé');
    }

    const response = await axios.get(`${API_BASE_URL}/api/clubs/${clubId}/evenements/${id}/images`);
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur dans getEvenementImages:', error);
    return handleChunkedError(error);
  }
};

export const getEvenementBudget = async (id) => {
  try {
    const clubId = getClubId();
    if (!clubId) {
      throw new Error('ClubId non trouvé');
    }

    const response = await axios.get(`${API_BASE_URL}/api/clubs/${clubId}/evenements/${id}/budget`);
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur dans getEvenementBudget:', error);
    return handleChunkedError(error);
  }
};

export const getEvenementStatistiques = async (filters = {}) => {
  try {
    const clubId = getClubId();
    if (!clubId) {
      throw new Error('ClubId non trouvé');
    }

    const { annee = null, estInterne = null } = filters;
    const response = await axios.get(`${API_BASE_URL}/api/clubs/${clubId}/evenements/statistiques`, {
      params: {
        annee,
        estInterne
      }
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur dans getEvenementStatistiques:', error);
    return handleChunkedError(error);
  }
};

export const createEvenement = async (evenement) => {
  try {
    const clubId = getClubId();
    if (!clubId) {
      throw new Error('ClubId non trouvé');
    }

    const response = await axios.post(`${API_BASE_URL}/api/clubs/${clubId}/evenements`, evenement);
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur dans createEvenement:', error);
    return handleChunkedError(error);
  }
};

export const updateEvenement = async (id, evenement) => {
  try {
    const clubId = getClubId();
    if (!clubId) {
      throw new Error('ClubId non trouvé');
    }

    console.log('Mise à jour de l\'événement - Données envoyées:', {
      id,
      clubId,
      evenement,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const response = await axios.put(`${API_BASE_URL}/api/clubs/${clubId}/evenements/${id}`, evenement, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Réponse complète de la mise à jour:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur détaillée dans updateEvenement:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    return handleChunkedError(error);
  }
};

export const getEvenementParticipants = async (id) => {
  try {
    const clubId = getClubId();
    if (!clubId) {
      throw new Error('ClubId non trouvé');
    }

    const response = await axios.get(`${API_BASE_URL}/api/clubs/${clubId}/evenements/${id}/participants`);
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur dans getEvenementParticipants:', error);
    return handleChunkedError(error);
  }
};

export const getEvenementMembers = async (id) => {
  try {
    const clubId = getClubId();
    if (!clubId) {
      throw new Error('ClubId non trouvé');
    }

    const response = await axios.get(`${API_BASE_URL}/api/clubs/${clubId}/evenements/${id}/members`);
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur dans getEvenementMembers:', error);
    return handleChunkedError(error);
  }
};

export const deleteEvenement = async (id) => {
  try {
    const clubId = getClubId();
    if (!clubId) {
      throw new Error('ClubId non trouvé');
    }

    const response = await axios.delete(`${API_BASE_URL}/api/clubs/${clubId}/evenements/${id}`);
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur dans deleteEvenement:', error);
    return handleChunkedError(error);
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
  getEvenementParticipants,
  getEvenementMembers,
  deleteEvenement
};