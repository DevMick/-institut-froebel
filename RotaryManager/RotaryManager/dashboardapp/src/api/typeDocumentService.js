import axios from 'axios';
import { API_BASE_URL } from '../config';

const getTypesDocument = async (search = '') => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/types-document`, {
            params: { recherche: search },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des types de document:', error);
        throw error;
    }
};

const getTypeDocument = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/types-document/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération du type de document:', error);
        throw error;
    }
};

const createTypeDocument = async (typeDocument) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/types-document`, typeDocument, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création du type de document:', error);
        throw error;
    }
};

const updateTypeDocument = async (id, typeDocument) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/types-document/${id}`, typeDocument, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du type de document:', error);
        throw error;
    }
};

const deleteTypeDocument = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/api/types-document/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la suppression du type de document:', error);
        throw error;
    }
};

const getDocumentsTypeDocument = async (typeDocumentId, clubId = null, categorieId = null) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/types-document/${typeDocumentId}/documents`, {
            params: { clubId, categorieId },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des documents du type:', error);
        throw error;
    }
};

const getStatistiques = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/types-document/statistiques`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        throw error;
    }
};

const getTypesDocumentPopulaires = async (limite = 5) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/types-document/populaires`, {
            params: { limite },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des types de document populaires:', error);
        throw error;
    }
};

export {
    getTypesDocument,
    getTypeDocument,
    createTypeDocument,
    updateTypeDocument,
    deleteTypeDocument,
    getDocumentsTypeDocument,
    getStatistiques,
    getTypesDocumentPopulaires
}; 