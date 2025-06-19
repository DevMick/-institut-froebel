import axios from 'axios';
import { API_URL } from '../config';

const handleError = (error) => {
    console.error('Erreur API:', error);
    throw new Error(error.response?.data || 'Une erreur est survenue');
};

// Fonction pour obtenir les en-têtes d'authentification
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
    };
};

export const evenementImageService = {
    // Récupérer toutes les images avec pagination et filtres
    getImages: async (params) => {
        try {
            const response = await axios.get(`${API_URL}/EvenementImage`, { 
                params,
                headers: getAuthHeaders()
            });
            return {
                images: response.data.map(image => ({
                    ...image,
                    imageUrl: `${API_URL}/EvenementImage/${image.id}/download`
                })),
                totalCount: parseInt(response.headers['x-total-count']),
                page: parseInt(response.headers['x-page']),
                pageSize: parseInt(response.headers['x-page-size'])
            };
        } catch (error) {
            handleError(error);
        }
    },

    // Récupérer une image spécifique
    getImage: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/EvenementImage/${id}`, {
                headers: getAuthHeaders()
            });
            return {
                ...response.data,
                imageUrl: `${API_URL}/EvenementImage/${id}/download`
            };
        } catch (error) {
            handleError(error);
        }
    },

    // Télécharger une image
    downloadImage: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/EvenementImage/${id}/download`, {
                responseType: 'blob',
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    // Créer une nouvelle image
    createImage: async (formData) => {
        try {
            const response = await axios.post(`${API_URL}/EvenementImage`, formData, {
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'multipart/form-data'
                }
            });
            return {
                ...response.data,
                imageUrl: `${API_URL}/EvenementImage/${response.data.id}/download`
            };
        } catch (error) {
            handleError(error);
        }
    },

    // Créer plusieurs images
    createMultipleImages: async (formData) => {
        try {
            const response = await axios.post(`${API_URL}/EvenementImage/multiple`, formData, {
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data.map(image => ({
                ...image,
                imageUrl: `${API_URL}/EvenementImage/${image.id}/download`
            }));
        } catch (error) {
            handleError(error);
        }
    },

    // Mettre à jour la description d'une image
    updateImage: async (id, data) => {
        try {
            const response = await axios.put(`${API_URL}/EvenementImage/${id}`, data, {
                headers: getAuthHeaders()
            });
            return {
                ...response.data,
                imageUrl: `${API_URL}/EvenementImage/${id}/download`
            };
        } catch (error) {
            handleError(error);
        }
    },

    // Supprimer une image
    deleteImage: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/EvenementImage/${id}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    // Récupérer les images d'un événement spécifique
    getImagesByEvenement: async (evenementId) => {
        try {
            const response = await axios.get(`${API_URL}/EvenementImage/evenement/${evenementId}`, {
                headers: getAuthHeaders()
            });
            return response.data.map(image => ({
                ...image,
                imageUrl: `${API_URL}/EvenementImage/${image.id}/download`
            }));
        } catch (error) {
            handleError(error);
        }
    },

    // Récupérer la galerie d'un événement
    getImageGallery: async (evenementId) => {
        try {
            const response = await axios.get(`${API_URL}/EvenementImage/evenement/${evenementId}/gallery`, {
                headers: getAuthHeaders()
            });
            return response.data.map(image => ({
                ...image,
                imageUrl: `${API_URL}/EvenementImage/${image.id}/download`
            }));
        } catch (error) {
            handleError(error);
        }
    }
}; 