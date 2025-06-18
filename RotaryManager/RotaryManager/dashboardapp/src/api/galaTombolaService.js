import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5265/api';

const galaTombolaService = {
  // Récupérer toutes les tombolas d'un gala
  getTombolasByGala: async (galaId) => {
    try {
      const response = await axios.get(`${API_URL}/gala-tombolas/gala/${galaId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer toutes les tombolas d'un membre
  getTombolasByMembre: async (membreId) => {
    try {
      const response = await axios.get(`${API_URL}/gala-tombolas/membre/${membreId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer une tombola par son ID
  getTombola: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/gala-tombolas/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Créer une nouvelle tombola
  createTombola: async (tombolaData) => {
    try {
      const response = await axios.post(`${API_URL}/gala-tombolas`, tombolaData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Mettre à jour une tombola
  updateTombola: async (id, tombolaData) => {
    try {
      const response = await axios.put(`${API_URL}/gala-tombolas/${id}`, tombolaData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Supprimer une tombola
  deleteTombola: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/gala-tombolas/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les statistiques des tombolas d'un gala
  getStatistiquesTombolasByGala: async (galaId) => {
    try {
      const response = await axios.get(`${API_URL}/gala-tombolas/gala/${galaId}/statistiques`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les top vendeurs de tombolas d'un gala
  getTopVendeurs: async (galaId, limit = 10) => {
    try {
      const response = await axios.get(`${API_URL}/gala-tombolas/gala/${galaId}/top-vendeurs?limit=${limit}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Créer plusieurs tombolas en une seule fois
  createBulkTombolas: async (tombolasData) => {
    try {
      const response = await axios.post(`${API_URL}/gala-tombolas/bulk-create`, tombolasData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Effectuer le tirage des gagnants
  tirageGagnants: async (galaId, nombreGagnants = 1) => {
    try {
      const response = await axios.get(`${API_URL}/gala-tombolas/gala/${galaId}/tirage-gagnants?nombreGagnants=${nombreGagnants}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default galaTombolaService; 