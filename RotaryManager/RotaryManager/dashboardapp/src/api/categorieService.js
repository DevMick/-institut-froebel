import axios from 'axios';
import { API_BASE_URL } from '../config';

const BASE_URL = `${API_BASE_URL}/api/categories`;

// Fonction pour obtenir les en-têtes d'autorisation
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };
};

export const categorieService = {
    // Récupérer toutes les catégories
    getCategories: async (recherche = null) => {
        try {
            let url = BASE_URL;
            if (recherche) {
                url += `?recherche=${encodeURIComponent(recherche)}`;
            }
            const response = await axios.get(url, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des catégories:', error);
            throw error;
        }
    },

    // Récupérer une catégorie spécifique
    getCategorie: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération de la catégorie:', error);
            throw error;
        }
    },

    // Récupérer les documents d'une catégorie
    getDocumentsCategorie: async (id, clubId = null, typeDocumentId = null) => {
        try {
            let url = `${BASE_URL}/${id}/documents`;
            const params = new URLSearchParams();
            if (clubId) params.append('clubId', clubId);
            if (typeDocumentId) params.append('typeDocumentId', typeDocumentId);
            
            const response = await axios.get(`${url}?${params.toString()}`, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des documents de la catégorie:', error);
            throw error;
        }
    },

    // Créer une nouvelle catégorie
    createCategorie: async (categorieData) => {
        try {
            const response = await axios.post(BASE_URL, categorieData, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la création de la catégorie:', error);
            throw error;
        }
    },

    // Mettre à jour une catégorie
    updateCategorie: async (id, categorieData) => {
        try {
            await axios.put(`${BASE_URL}/${id}`, categorieData, { headers: getAuthHeaders() });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la catégorie:', error);
            throw error;
        }
    },

    // Supprimer une catégorie
    deleteCategorie: async (id) => {
        try {
            await axios.delete(`${BASE_URL}/${id}`, { headers: getAuthHeaders() });
        } catch (error) {
            console.error('Erreur lors de la suppression de la catégorie:', error);
            throw error;
        }
    },

    // Récupérer les statistiques des catégories
    getStatistiques: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/statistiques`, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques des catégories:', error);
            throw error;
        }
    }
}; 