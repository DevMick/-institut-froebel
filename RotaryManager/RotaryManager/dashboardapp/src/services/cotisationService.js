import axios from 'axios';
import { API_URL } from '../config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  };
};

export const cotisationService = {
  // Récupérer toutes les cotisations
  getCotisations: async () => {
    try {
      const response = await axios.get(`${API_URL}/Cotisation`, {
        headers: getAuthHeaders()
      });
      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des cotisations:', error);
      throw error;
    }
  },

  // Récupérer une cotisation par ID
  getCotisation: async (id) => {
    const response = await axios.get(`${API_URL}/Cotisation/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Créer une cotisation
  createCotisation: async (data) => {
    const response = await axios.post(`${API_URL}/Cotisation`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Mettre à jour une cotisation
  updateCotisation: async (id, data) => {
    await axios.put(`${API_URL}/Cotisation/${id}`, data, {
      headers: getAuthHeaders()
    });
  },

  // Supprimer une cotisation
  deleteCotisation: async (id) => {
    await axios.delete(`${API_URL}/Cotisation/${id}`, {
      headers: getAuthHeaders()
    });
  },

  // Bulk create
  bulkCreate: async (data) => {
    const response = await axios.post(`${API_URL}/Cotisation/bulk-create`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Cotisations par mandat
  getCotisationsByMandat: async (mandatId) => {
    const response = await axios.get(`${API_URL}/Cotisation/mandat/${mandatId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Cotisations par membre
  getCotisationsByMembre: async (membreId) => {
    const response = await axios.get(`${API_URL}/Cotisation/membre/${membreId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  }
}; 