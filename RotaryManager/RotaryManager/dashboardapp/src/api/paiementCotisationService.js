import axios from 'axios';
import { API_BASE_URL } from '../config';

const BASE_URL = `${API_BASE_URL}/api/PaiementCotisation`;

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

// Fonction pour formater la date
const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Format YYYY-MM-DD
};

export const paiementCotisationService = {
    // Récupérer tous les paiements
    getPaiements: async (clubId = null) => {
        try {
            let url = BASE_URL;
            if (clubId) {
                url += `?clubId=${clubId}`;
            }
            const response = await axios.get(url, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des paiements:', error);
            throw error;
        }
    },

    // Récupérer un paiement spécifique
    getPaiement: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération du paiement:', error);
            throw error;
        }
    },

    // Récupérer les paiements d'un membre
    getPaiementsByMembre: async (membreId) => {
        try {
            const response = await axios.get(`${BASE_URL}/membre/${membreId}`, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des paiements du membre:', error);
            throw error;
        }
    },

    // Récupérer les paiements par période
    getPaiementsByPeriode: async (dateDebut, dateFin) => {
        try {
            const response = await axios.get(`${BASE_URL}/periode`, {
                params: { dateDebut, dateFin },
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des paiements par période:', error);
            throw error;
        }
    },

    // Récupérer les statistiques d'un membre
    getStatistiquesMembre: async (membreId) => {
        try {
            const response = await axios.get(`${BASE_URL}/statistiques/membre/${membreId}`, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques du membre:', error);
            throw error;
        }
    },

    // Récupérer les statistiques globales
    getStatistiquesGlobales: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/statistiques/globales`, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques globales:', error);
            throw error;
        }
    },

    // Créer un nouveau paiement
    createPaiement: async (paiementData) => {
        // Adapter la casse des propriétés pour le backend
        const payload = {
            MembreId: paiementData.MembreId,
            ClubId: paiementData.ClubId,
            Date: paiementData.Date ? new Date(paiementData.Date).toISOString() : null,
            Montant: paiementData.Montant,
            Commentaires: paiementData.Commentaires
        };
        try {
            const response = await axios.post(BASE_URL, payload, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la création du paiement:', error);
            throw error;
        }
    },

    // Mettre à jour un paiement
    updatePaiement: async (id, paiementData) => {
        // Adapter la casse des propriétés pour le backend
        const payload = {
            MembreId: paiementData.MembreId,
            ClubId: paiementData.ClubId,
            Date: paiementData.Date ? new Date(paiementData.Date).toISOString() : null,
            Montant: paiementData.Montant,
            Commentaires: paiementData.Commentaires
        };
        try {
            await axios.put(`${BASE_URL}/${id}`, payload, { headers: getAuthHeaders() });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du paiement:', error);
            throw error;
        }
    },

    // Supprimer un paiement
    deletePaiement: async (id) => {
        try {
            await axios.delete(`${BASE_URL}/${id}`, { headers: getAuthHeaders() });
        } catch (error) {
            console.error('Erreur lors de la suppression du paiement:', error);
            throw error;
        }
    }
}; 