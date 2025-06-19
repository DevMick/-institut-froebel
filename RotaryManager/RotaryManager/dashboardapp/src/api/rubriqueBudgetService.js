import axios from './axiosConfig';
import { API_BASE_URL } from '../config';

export const rubriqueBudgetService = {
  // Récupérer toutes les rubriques d'un mandat (avec filtres optionnels)
  getRubriques: async (clubId, mandatId, params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/api/clubs/${clubId}/mandats/${mandatId}/rubriques`, { params });
    return response.data;
  },

  // Récupérer toutes les rubriques d'un club (pour les réalisations)
  getRubriquesBudget: async (clubId) => {
    try {
      // Récupérer d'abord le mandat actif du club
      const mandatsResponse = await axios.get(`${API_BASE_URL}/api/clubs/${clubId}/mandats`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!mandatsResponse.data || mandatsResponse.data.length === 0) {
        throw new Error('Aucun mandat trouvé pour ce club');
      }

      // Utiliser le premier mandat (le plus récent)
      const mandatId = mandatsResponse.data[0].id;
      
      // Récupérer les rubriques du mandat
      const response = await axios.get(`${API_BASE_URL}/api/clubs/${clubId}/mandats/${mandatId}/rubriques`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des rubriques:', error);
      throw error;
    }
  },

  // Récupérer une rubrique spécifique
  getRubrique: async (clubId, mandatId, id) => {
    const response = await axios.get(`${API_BASE_URL}/api/clubs/${clubId}/mandats/${mandatId}/rubriques/${id}`);
    return response.data;
  },

  // Créer une nouvelle rubrique
  createRubrique: async (clubId, mandatId, rubriqueData) => {
    const response = await axios.post(`${API_BASE_URL}/api/clubs/${clubId}/mandats/${mandatId}/rubriques`, rubriqueData);
    return response.data;
  },

  // Mettre à jour une rubrique
  updateRubrique: async (clubId, mandatId, id, rubriqueData) => {
    const response = await axios.put(`${API_BASE_URL}/api/clubs/${clubId}/mandats/${mandatId}/rubriques/${id}`, rubriqueData);
    return response.data;
  },

  // Supprimer une rubrique
  deleteRubrique: async (clubId, mandatId, id) => {
    await axios.delete(`${API_BASE_URL}/api/clubs/${clubId}/mandats/${mandatId}/rubriques/${id}`);
  },
}; 