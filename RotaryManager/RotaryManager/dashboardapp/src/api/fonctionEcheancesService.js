import axios from 'axios';
import { API_BASE_URL } from '../config';
import { message } from 'antd';

const BASE_URL = `${API_BASE_URL}/api/fonctions`;

// Intercepteur pour gérer les erreurs d'authentification
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      message.error("Votre session a expiré. Veuillez vous reconnecter.");
      // Rediriger vers la page de connexion
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const fonctionEcheancesService = {
  async getEcheances() {
    try {
      // Récupérer d'abord toutes les fonctions
      const fonctionsResponse = await axios.get(`${API_BASE_URL}/api/fonctions`);
      const fonctions = fonctionsResponse.data;

      // Récupérer les échéances pour chaque fonction
      const allEcheances = [];
      for (const fonction of fonctions) {
        try {
          const response = await axios.get(`${BASE_URL}/${fonction.id}/echeances`);
          const echeances = response.data.map(echeance => ({
            ...echeance,
            fonctionNom: fonction.nomFonction
          }));
          allEcheances.push(...echeances);
        } catch (error) {
          console.error(`Error fetching echeances for function ${fonction.id}:`, error);
        }
      }

      return allEcheances;
    } catch (error) {
      console.error('Error fetching echeances:', error);
      throw error;
    }
  },

  async getEcheance(fonctionId, id) {
    try {
      const response = await axios.get(`${BASE_URL}/${fonctionId}/echeances/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching echeance:', error);
      throw error;
    }
  },

  async createEcheance(fonctionId, data) {
    try {
      const response = await axios.post(`${BASE_URL}/${fonctionId}/echeances`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating echeance:', error);
      throw error;
    }
  },

  async updateEcheance(fonctionId, id, data) {
    try {
      const response = await axios.put(`${BASE_URL}/${fonctionId}/echeances/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating echeance:', error);
      throw error;
    }
  },

  async deleteEcheance(fonctionId, id) {
    try {
      const response = await axios.delete(`${BASE_URL}/${fonctionId}/echeances/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting echeance:', error);
      throw error;
    }
  },

  async getProchainesEcheances(fonctionId, jours = 30) {
    try {
      const response = await axios.get(`${BASE_URL}/${fonctionId}/echeances/prochaines`, {
        params: { jours }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching prochaines echeances:', error);
      throw error;
    }
  },

  async getFrequences() {
    return [
      { valeur: 0, libelle: 'Unique', description: 'Une seule fois à la date spécifiée' },
      { valeur: 1, libelle: 'Quotidienne', description: 'Tous les jours' },
      { valeur: 2, libelle: 'Hebdomadaire', description: 'Toutes les semaines' },
      { valeur: 3, libelle: 'Mensuelle', description: 'Tous les mois' },
      { valeur: 4, libelle: 'Trimestrielle', description: 'Tous les 3 mois' },
      { valeur: 5, libelle: 'Semestrielle', description: 'Tous les 6 mois' },
      { valeur: 6, libelle: 'Annuelle', description: 'Tous les ans' },
      { valeur: 7, libelle: 'Par Mandat', description: 'À chaque mandat' }
    ];
  }
}; 