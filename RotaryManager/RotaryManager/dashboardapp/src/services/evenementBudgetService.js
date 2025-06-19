import axios from 'axios';
import { API_URL } from '../config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  };
};

export const evenementBudgetService = {
  // Récupérer les budgets avec pagination et filtres
  getBudgets: async (params) => {
    const response = await axios.get(`${API_URL}/EvenementBudget`, {
      params,
      headers: getAuthHeaders()
    });
    return {
      budgets: response.data,
      totalCount: parseInt(response.headers['x-total-count']) || response.data.length
    };
  },

  // Récupérer un budget par ID
  getBudget: async (id) => {
    const response = await axios.get(`${API_URL}/EvenementBudget/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Créer un budget
  createBudget: async (data) => {
    const response = await axios.post(`${API_URL}/EvenementBudget`, data, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Mettre à jour un budget
  updateBudget: async (id, data) => {
    await axios.put(`${API_URL}/EvenementBudget/${id}`, data, {
      headers: getAuthHeaders()
    });
  },

  // Supprimer un budget
  deleteBudget: async (id) => {
    await axios.delete(`${API_URL}/EvenementBudget/${id}`, {
      headers: getAuthHeaders()
    });
  }
}; 