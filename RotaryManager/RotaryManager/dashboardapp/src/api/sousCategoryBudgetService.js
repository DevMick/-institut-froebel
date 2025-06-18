import axios from './axiosConfig';
import { API_BASE_URL } from '../config';

export const sousCategoryBudgetService = {
    // Récupérer toutes les sous-catégories d'une catégorie de budget
    getSousCategories: async (clubId, categoryBudgetId, recherche = null) => {
        console.log('Début getSousCategories avec:', { clubId, categoryBudgetId });
        
        if (!clubId) {
            console.error('clubId manquant pour getSousCategories');
            throw new Error('clubId est requis');
        }
        if (!categoryBudgetId) {
            console.error('categoryBudgetId manquant pour getSousCategories');
            throw new Error('categoryBudgetId est requis');
        }

        try {
            let url = `${API_BASE_URL}/api/clubs/${clubId}/categories/${categoryBudgetId}/sous-categories`;
            if (recherche) {
                url += `?recherche=${encodeURIComponent(recherche)}`;
            }
            console.log('Requête GET sous-catégories:', url);
            const response = await axios.get(url);
            
            console.log('Réponse API sous-catégories:', response.data);
            
            if (!response.data) {
                console.warn('Aucune donnée reçue de l\'API pour les sous-catégories');
                return [];
            }
            
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des sous-catégories:', error);
            if (error.response) {
                console.error('Détails de l\'erreur:', {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                });
            }
            throw error;
        }
    },

    // Récupérer une sous-catégorie spécifique
    getSousCategory: async (clubId, categoryBudgetId, id) => {
        if (!clubId || !categoryBudgetId || !id) {
            console.error('clubId, categoryBudgetId et id sont requis');
            throw new Error('Paramètres manquants');
        }

        try {
            const url = `${API_BASE_URL}/api/clubs/${clubId}/categories/${categoryBudgetId}/sous-categories/${id}`;
            console.log(`Requête GET vers: ${url}`);
            const response = await axios.get(url);
            
            if (!response.data) {
                console.error('Sous-catégorie non trouvée');
                throw new Error('Sous-catégorie non trouvée');
            }
            
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération de la sous-catégorie:', error);
            throw error;
        }
    },

    // Créer une nouvelle sous-catégorie
    createSousCategory: async (clubId, categoryBudgetId, sousCategoryData) => {
        if (!clubId || !categoryBudgetId || !sousCategoryData) {
            console.error('clubId, categoryBudgetId et sousCategoryData sont requis');
            throw new Error('Paramètres manquants');
        }

        if (!sousCategoryData.libelle) {
            console.error('Le libellé est requis');
            throw new Error('Le libellé est requis');
        }

        try {
            const url = `${API_BASE_URL}/api/clubs/${clubId}/categories/${categoryBudgetId}/sous-categories`;
            console.log(`Requête POST vers: ${url}`, sousCategoryData);
            const response = await axios.post(url, sousCategoryData);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la création de la sous-catégorie:', error);
            throw error;
        }
    },

    // Mettre à jour une sous-catégorie
    updateSousCategory: async (clubId, categoryBudgetId, id, sousCategoryData) => {
        if (!clubId || !categoryBudgetId || !id || !sousCategoryData) {
            console.error('clubId, categoryBudgetId, id et sousCategoryData sont requis');
            throw new Error('Paramètres manquants');
        }

        if (!sousCategoryData.libelle) {
            console.error('Le libellé est requis');
            throw new Error('Le libellé est requis');
        }

        try {
            const url = `${API_BASE_URL}/api/clubs/${clubId}/categories/${categoryBudgetId}/sous-categories/${id}`;
            console.log(`Requête PUT vers: ${url}`, sousCategoryData);
            const response = await axios.put(url, sousCategoryData);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la sous-catégorie:', error);
            throw error;
        }
    },

    // Supprimer une sous-catégorie
    deleteSousCategory: async (clubId, categoryBudgetId, id) => {
        if (!clubId || !categoryBudgetId || !id) {
            console.error('clubId, categoryBudgetId et id sont requis');
            throw new Error('Paramètres manquants');
        }

        try {
            const url = `${API_BASE_URL}/api/clubs/${clubId}/categories/${categoryBudgetId}/sous-categories/${id}`;
            console.log(`Requête DELETE vers: ${url}`);
            await axios.delete(url);
        } catch (error) {
            console.error('Erreur lors de la suppression de la sous-catégorie:', error);
            throw error;
        }
    },

    // Récupérer les rubriques d'une sous-catégorie
    getRubriquesSousCategory: async (clubId, categoryBudgetId, id) => {
        if (!clubId || !categoryBudgetId || !id) {
            console.error('clubId, categoryBudgetId et id sont requis');
            throw new Error('Paramètres manquants');
        }

        try {
            const url = `${API_BASE_URL}/api/clubs/${clubId}/categories/${categoryBudgetId}/sous-categories/${id}/rubriques`;
            console.log(`Requête GET vers: ${url}`);
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des rubriques:', error);
            throw error;
        }
    },

    // Récupérer les statistiques d'une sous-catégorie
    getStatistiques: async (clubId, categoryBudgetId) => {
        if (!clubId || !categoryBudgetId) {
            console.error('clubId et categoryBudgetId sont requis');
            throw new Error('Paramètres manquants');
        }

        try {
            const url = `${API_BASE_URL}/api/clubs/${clubId}/categories/${categoryBudgetId}/sous-categories/statistiques`;
            console.log(`Requête GET vers: ${url}`);
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            throw error;
        }
    }
}; 