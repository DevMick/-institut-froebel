import axios from 'axios';
import { API_BASE_URL } from '../config';
import axiosInstance from './axiosConfig';

const galaService = {
  getAllGalas: async (clubId, recherche = null) => {
    return axiosInstance.get(`/api/galas`, {
      params: { recherche }
    });
  },

  getGala: async (id) => {
    return axiosInstance.get(`/api/galas/${id}`);
  },

  createGala: async (galaData) => {
    return axiosInstance.post(`/api/galas`, galaData);
  },

  updateGala: async (id, galaData) => {
    return axiosInstance.put(`/api/galas/${id}`, galaData);
  },

  deleteGala: async (id) => {
    return axiosInstance.delete(`/api/galas/${id}`);
  },

  createTables: async (galaId, tables) => {
    try {
      // Créer les tables une par une car l'API ne supporte pas la création en masse
      const createdTables = [];
      for (const table of tables) {
        const response = await axiosInstance.post(`/api/gala-tables`, {
          galaId: galaId,
          tableLibelle: table.tableLibelle
        });
        createdTables.push(response.data);
      }
      return { data: createdTables };
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }
};

export default galaService; 