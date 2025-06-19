import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/EvenementDocument`;

// Fonction utilitaire pour gérer les erreurs
const handleError = (error) => {
    console.error('Erreur détaillée:', error);
    if (error.response) {
        // Le serveur a répondu avec un code d'état d'erreur
        const errorMessage = error.response.data?.message || error.response.data || 'Une erreur est survenue';
        console.error('Réponse du serveur:', error.response.data);
        throw new Error(errorMessage);
    } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        console.error('Pas de réponse du serveur:', error.request);
        throw new Error('Impossible de se connecter au serveur');
    } else {
        // Une erreur s'est produite lors de la configuration de la requête
        console.error('Erreur de configuration:', error.message);
        throw new Error('Une erreur est survenue lors de la requête');
    }
};

export const evenementDocumentService = {
    // Récupérer tous les documents avec pagination et filtres
    getDocuments: async (params) => {
        try {
            const response = await axios.get(API_URL, { params });
            return {
                documents: response.data,
                totalCount: parseInt(response.headers['x-total-count']),
                page: parseInt(response.headers['x-page']),
                pageSize: parseInt(response.headers['x-page-size'])
            };
        } catch (error) {
            handleError(error);
        }
    },

    // Récupérer un document spécifique
    getDocument: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    // Télécharger un document
    downloadDocument: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}/download`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    // Créer un nouveau document
    createDocument: async (formData) => {
        try {
            console.log('Envoi des données:', {
                evenementId: formData.get('EvenementId'),
                libelle: formData.get('Libelle'),
                document: formData.get('Document')?.name
            });
            
            const response = await axios.post(API_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    // Mettre à jour le libellé d'un document
    updateDocument: async (id, data) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    // Remplacer un document
    replaceDocument: async (id, formData) => {
        try {
            const response = await axios.put(`${API_URL}/${id}/replace`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    // Supprimer un document
    deleteDocument: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    // Récupérer les documents d'un événement spécifique
    getDocumentsByEvenement: async (evenementId) => {
        try {
            const response = await axios.get(`${API_URL}/evenement/${evenementId}`);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    }
}; 