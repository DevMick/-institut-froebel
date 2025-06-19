import axios from 'axios';
import { API_BASE_URL } from '../config';

const BASE_URL = `${API_BASE_URL}/api/clubs`;

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

// Fonction pour obtenir les en-têtes pour l'upload de fichiers
const getFileUploadHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };
};

export const documentService = {
    // Récupérer tous les documents d'un club
    getDocuments: async (clubId, params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.categorieId) queryParams.append('categorieId', params.categorieId);
            if (params.typeDocumentId) queryParams.append('typeDocumentId', params.typeDocumentId);
            if (params.recherche) queryParams.append('recherche', params.recherche);
            if (params.page) queryParams.append('page', params.page);
            if (params.pageSize) queryParams.append('pageSize', params.pageSize);

            const response = await axios.get(`${BASE_URL}/${clubId}/documents?${queryParams.toString()}`, {
                headers: getAuthHeaders()
            });

            // Extraire les informations de pagination des headers
            const totalCount = parseInt(response.headers['x-total-count'] || '0');
            const currentPage = parseInt(response.headers['x-page'] || '1');
            const pageSize = parseInt(response.headers['x-page-size'] || '20');
            const totalPages = parseInt(response.headers['x-total-pages'] || '1');

            return {
                documents: response.data,
                pagination: {
                    total: totalCount,
                    current: currentPage,
                    pageSize: pageSize,
                    totalPages: totalPages
                }
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des documents:', error);
            throw error;
        }
    },

    // Récupérer un document spécifique
    getDocument: async (clubId, documentId) => {
        try {
            const response = await axios.get(`${BASE_URL}/${clubId}/documents/${documentId}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération du document:', error);
            throw error;
        }
    },

    // Créer un nouveau document
    createDocument: async (clubId, documentData) => {
        try {
            const formData = new FormData();
            formData.append('Nom', documentData.nom);
            if (documentData.description) formData.append('Description', documentData.description);
            formData.append('Fichier', documentData.fichier);
            formData.append('CategorieId', documentData.categorieId);
            formData.append('TypeDocumentId', documentData.typeDocumentId);

            const response = await axios.post(`${BASE_URL}/${clubId}/documents`, formData, {
                headers: getFileUploadHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la création du document:', error);
            throw error;
        }
    },

    // Mettre à jour un document
    updateDocument: async (clubId, documentId, documentData) => {
        try {
            const response = await axios.put(`${BASE_URL}/${clubId}/documents/${documentId}`, documentData, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du document:', error);
            throw error;
        }
    },

    // Supprimer un document
    deleteDocument: async (clubId, documentId) => {
        try {
            await axios.delete(`${BASE_URL}/${clubId}/documents/${documentId}`, {
                headers: getAuthHeaders()
            });
        } catch (error) {
            console.error('Erreur lors de la suppression du document:', error);
            throw error;
        }
    },

    // Télécharger un document
    downloadDocument: async (clubId, documentId) => {
        try {
            const response = await axios.get(`${BASE_URL}/${clubId}/documents/${documentId}/telecharger`, {
                headers: getAuthHeaders(),
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors du téléchargement du document:', error);
            throw error;
        }
    },

    // Récupérer les statistiques des documents
    getStatistiques: async (clubId) => {
        try {
            const response = await axios.get(`${BASE_URL}/${clubId}/documents/statistiques`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            throw error;
        }
    },

    // Récupérer les catégories
    getCategories: async (clubId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/categories`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des catégories:', error);
            throw error;
        }
    },

    // Récupérer les types de documents
    getTypesDocument: async (clubId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/types-document`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des types de document:', error);
            throw error;
        }
    }
}; 