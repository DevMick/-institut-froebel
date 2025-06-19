import axios from 'axios';
import { API_URL } from '../config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  };
};

export const evenementRecetteService = {
  // Récupérer les recettes avec pagination et filtres
  getRecettes: async (params) => {
    const response = await axios.get(`${API_URL}/EvenementRecette`, {
      params,
      headers: getAuthHeaders()
    });
    return {
      recettes: response.data,
      totalCount: parseInt(response.headers['x-total-count']) || response.data.length
    };
  },

  // Récupérer une recette par ID
  getRecette: async (id) => {
    const response = await axios.get(`${API_URL}/EvenementRecette/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Créer une recette
  createRecette: async (data) => {
    const response = await axios.post(`${API_URL}/EvenementRecette`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Mettre à jour une recette
  updateRecette: async (id, data) => {
    await axios.put(`${API_URL}/EvenementRecette/${id}`, data, {
      headers: getAuthHeaders()
    });
  },

  // Supprimer une recette
  deleteRecette: async (id) => {
    await axios.delete(`${API_URL}/EvenementRecette/${id}`, {
      headers: getAuthHeaders()
    });
  }
}; 