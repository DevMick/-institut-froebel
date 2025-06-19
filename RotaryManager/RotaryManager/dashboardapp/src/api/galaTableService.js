import axios from 'axios';
import { API_BASE_URL } from '../config';

const galaTableService = {
  getAllTables: async (clubId, searchTerm = '') => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/gala-tables/gala/${clubId}`, {
        params: { recherche: searchTerm }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTable: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/gala-tables/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createTable: async (tableData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/gala-tables`, tableData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateTable: async (id, tableData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/gala-tables/${id}`, tableData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteTable: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/gala-tables/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTablesDisponibles: async (galaId, capaciteMax = null) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/gala-tables/gala/${galaId}/disponibles`, {
        params: { capaciteMax }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getStatistiquesTables: async (galaId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/gala-tables/gala/${galaId}/statistiques`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  ajouterInvite: async (tableId, inviteId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/gala-tables/${tableId}/ajouter-invite`, {
        inviteId
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  retirerInvite: async (tableId, inviteId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/gala-tables/${tableId}/retirer-invite/${inviteId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTablesByGala: async (galaId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/gala-tables/gala/${galaId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default galaTableService; 