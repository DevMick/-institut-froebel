import axios from 'axios';
import { API_BASE_URL } from '../config';

const getApiUrl = (clubId, rubriqueId) => `${API_BASE_URL}/api/clubs/${clubId}/rubriques/${rubriqueId}/realisations`;

export const rubriqueBudgetRealiseService = {
    // GET: api/clubs/{clubId}/rubriques/{rubriqueId}/realisations
    getRealisations: async (clubId, rubriqueId, dateDebut = null, dateFin = null, page = 1, pageSize = 20) => {
        try {
            const response = await axios.get(getApiUrl(clubId, rubriqueId), {
                params: { dateDebut, dateFin, page, pageSize },
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            // The backend sends pagination headers, so we need to extract them
            // and return an object that includes both the items and pagination info.
            const items = response.data;
            const totalItems = parseInt(response.headers['x-total-count'], 10);
            const currentPage = parseInt(response.headers['x-page'], 10);
            const currentPageSize = parseInt(response.headers['x-page-size'], 10);
            const totalPages = parseInt(response.headers['x-total-pages'], 10);

            return {
                items,
                totalItems,
                currentPage,
                pageSize: currentPageSize,
                totalPages
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des réalisations:', error.response || error.message);
            throw error;
        }
    },

    // GET: api/clubs/{clubId}/rubriques/{rubriqueId}/realisations/{id}
    getRealisation: async (clubId, rubriqueId, id) => {
        try {
            const response = await axios.get(`${getApiUrl(clubId, rubriqueId)}/${id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération de la réalisation:', error.response || error.message);
            throw error;
        }
    },

    // POST: api/clubs/{clubId}/rubriques/{rubriqueId}/realisations
    createRealisation: async (clubId, rubriqueId, realisationData) => {
        try {
            const response = await axios.post(getApiUrl(clubId, rubriqueId), realisationData, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la création de la realisation:', error.response || error.message);
            throw error;
        }
    },

    // PUT: api/clubs/{clubId}/rubriques/{rubriqueId}/realisations/{id}
    updateRealisation: async (clubId, rubriqueId, id, realisationData) => {
        try {
            const response = await axios.put(`${getApiUrl(clubId, rubriqueId)}/${id}`, realisationData, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la realisation:', error.response || error.message);
            throw error;
        }
    },

    // DELETE: api/clubs/{clubId}/rubriques/{rubriqueId}/realisations/{id}
    deleteRealisation: async (clubId, rubriqueId, id) => {
        try {
            const response = await axios.delete(`${getApiUrl(clubId, rubriqueId)}/${id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la suppression de la realisation:', error.response || error.message);
            throw error;
        }
    },

    // GET: api/clubs/{clubId}/rubriques/{rubriqueId}/realisations/statistiques
    getStatistiques: async (clubId, rubriqueId, annee = null) => {
        try {
            const response = await axios.get(`${getApiUrl(clubId, rubriqueId)}/statistiques`, {
                params: { annee },
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error.response || error.message);
            throw error;
        }
    }
}; 