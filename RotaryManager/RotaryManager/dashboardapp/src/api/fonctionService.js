import axios from 'axios';
import { API_BASE_URL } from '../config';

const BASE_URL = `${API_BASE_URL}/api/fonctions`;

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

export const fonctionService = {
    // Récupérer toutes les fonctions
    getFonctions: async (search = null) => {
        try {
            let url = BASE_URL;
            if (search) {
                url += `?search=${encodeURIComponent(search)}`;
            }
            const response = await axios.get(url, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des fonctions:', error);
            throw error;
        }
    },

    // Récupérer une fonction spécifique
    getFonction: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération de la fonction:', error);
            throw error;
        }
    },

    // Créer une nouvelle fonction
    createFonction: async (fonctionData) => {
        try {
            const response = await axios.post(BASE_URL, fonctionData, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la création de la fonction:', error);
            throw error;
        }
    },

    // Mettre à jour une fonction
    updateFonction: async (id, fonctionData) => {
        try {
            await axios.put(`${BASE_URL}/${id}`, fonctionData, { headers: getAuthHeaders() });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la fonction:', error);
            throw error;
        }
    },

    // Supprimer une fonction
    deleteFonction: async (id) => {
        try {
            await axios.delete(`${BASE_URL}/${id}`, { headers: getAuthHeaders() });
        } catch (error) {
            console.error('Erreur lors de la suppression de la fonction:', error);
            throw error;
        }
    }
}; 