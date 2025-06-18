import axios from 'axios';
import { API_BASE_URL } from '../config';

const BASE_URL = `${API_BASE_URL}/api/fonctions`;

// Cache pour stocker les fonctions
let fonctionsCache = null;

export const fonctionRolesResponsabilitesService = {
  async getFonctions() {
    try {
      if (!fonctionsCache) {
        const response = await axios.get(`${API_BASE_URL}/api/fonctions`);
        fonctionsCache = response.data;
      }
      return fonctionsCache;
    } catch (error) {
      console.error('Error fetching functions:', error);
      throw error;
    }
  },

  async getRolesResponsabilites() {
    try {
      // Récupérer les fonctions (utilise le cache si disponible)
      const fonctions = await this.getFonctions();
      console.log('Fonctions reçues:', fonctions);
      
      // Créer un Map pour un accès rapide aux fonctions par ID
      const fonctionsMap = new Map(fonctions.map(f => [f.id, f]));
      console.log('Map des fonctions:', Object.fromEntries(fonctionsMap));
      
      // Récupérer les rôles/responsabilités pour chaque fonction
      const allRolesPromises = fonctions.map(fonction => 
        axios.get(`${BASE_URL}/${fonction.id}/roles-responsabilites`)
      );
      
      const allRolesResponses = await Promise.all(allRolesPromises);
      const allRoles = allRolesResponses.flatMap(response => response.data);
      console.log('Rôles reçus:', allRoles);
      
      // Enrichir les données avec les noms des fonctions
      const enrichedRoles = allRoles.map(role => {
        const fonction = fonctionsMap.get(role.fonctionId);
        console.log('Recherche fonction pour role:', role.fonctionId, 'Fonction trouvée:', fonction);
        return {
          ...role,
          fonctionNom: fonction ? fonction.nomFonction : 'Fonction inconnue'
        };
      });
      console.log('Rôles enrichis:', enrichedRoles);
      
      return enrichedRoles;
    } catch (error) {
      console.error('Error fetching roles and responsibilities:', error);
      throw error;
    }
  },

  async getRoleResponsabilite(fonctionId, id) {
    try {
      const response = await axios.get(`${BASE_URL}/${fonctionId}/roles-responsabilites/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role and responsibility:', error);
      throw error;
    }
  },

  async createRoleResponsabilite(data) {
    try {
      const response = await axios.post(`${BASE_URL}/${data.fonctionId}/roles-responsabilites`, {
        libelle: data.libelle,
        description: data.description
      });
      return response.data;
    } catch (error) {
      console.error('Error creating role and responsibility:', error);
      throw error;
    }
  },

  async updateRoleResponsabilite(fonctionId, id, data) {
    try {
      const response = await axios.put(`${BASE_URL}/${fonctionId}/roles-responsabilites/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating role and responsibility:', error);
      throw error;
    }
  },

  async deleteRoleResponsabilite(fonctionId, id) {
    try {
      const response = await axios.delete(`${BASE_URL}/${fonctionId}/roles-responsabilites/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting role and responsibility:', error);
      throw error;
    }
  },

  async searchRolesResponsabilites(searchTerm) {
    try {
      // Récupérer les fonctions (utilise le cache si disponible)
      const fonctions = await this.getFonctions();
      console.log('Fonctions reçues (search):', fonctions);
      
      // Créer un Map pour un accès rapide aux fonctions par ID
      const fonctionsMap = new Map(fonctions.map(f => [f.id, f]));
      console.log('Map des fonctions (search):', Object.fromEntries(fonctionsMap));
      
      // Rechercher dans les rôles/responsabilités de chaque fonction
      const searchPromises = fonctions.map(fonction => 
        axios.get(`${BASE_URL}/${fonction.id}/roles-responsabilites/search?terme=${encodeURIComponent(searchTerm)}`)
      );
      
      const searchResponses = await Promise.all(searchPromises);
      const allResults = searchResponses.flatMap(response => response.data);
      console.log('Résultats de recherche:', allResults);
      
      // Enrichir les données avec les noms des fonctions
      const enrichedResults = allResults.map(role => {
        const fonction = fonctionsMap.get(role.fonctionId);
        console.log('Recherche fonction pour role (search):', role.fonctionId, 'Fonction trouvée:', fonction);
        return {
          ...role,
          fonctionNom: fonction ? fonction.nomFonction : 'Fonction inconnue'
        };
      });
      console.log('Résultats enrichis:', enrichedResults);
      
      return enrichedResults;
    } catch (error) {
      console.error('Error searching roles and responsibilities:', error);
      throw error;
    }
  },

  // Méthode pour forcer le rafraîchissement du cache des fonctions
  async refreshFonctionsCache() {
    fonctionsCache = null;
    return this.getFonctions();
  }
}; 