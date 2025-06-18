import axios from 'axios';
import { API_BASE_URL } from '../config';

const BASE_URL = `${API_BASE_URL}/api/types-budget`;

export const categoryBudgetService = {
    // Récupérer toutes les catégories d'un type de budget
    getCategories: async (typeBudgetId) => {
        try {
            const response = await axios.get(`${BASE_URL}/${typeBudgetId}/categories`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des catégories:', error);
            throw error;
        }
    },

    // Récupérer une catégorie spécifique
    getCategory: async (typeBudgetId, categoryId) => {
        try {
            const response = await axios.get(`${BASE_URL}/${typeBudgetId}/categories/${categoryId}`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération de la catégorie:', error);
            throw error;
        }
    },

    // Créer une nouvelle catégorie
    createCategory: async (typeBudgetId, categoryData) => {
        try {
            const response = await axios.post(`${BASE_URL}/${typeBudgetId}/categories`, categoryData);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la création de la catégorie:', error);
            throw error;
        }
    },

    // Mettre à jour une catégorie
    updateCategory: async (typeBudgetId, categoryId, categoryData) => {
        try {
            const response = await axios.put(`${BASE_URL}/${typeBudgetId}/categories/${categoryId}`, categoryData);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la catégorie:', error);
            throw error;
        }
    },

    // Supprimer une catégorie
    deleteCategory: async (typeBudgetId, categoryId) => {
        try {
            await axios.delete(`${BASE_URL}/${typeBudgetId}/categories/${categoryId}`);
        } catch (error) {
            console.error('Erreur lors de la suppression de la catégorie:', error);
            throw error;
        }
    },

    // Récupérer les catégories prédéfinies
    getPredefinedCategories: async (typeBudgetId) => {
        try {
            const response = await axios.get(`${BASE_URL}/${typeBudgetId}/categories/predefinies`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des catégories prédéfinies:', error);
            throw error;
        }
    },

    // Initialiser les catégories prédéfinies
    initializePredefinedCategories: async (typeBudgetId) => {
        try {
            const response = await axios.post(`${BASE_URL}/${typeBudgetId}/categories/initialiser-predefinies`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de l\'initialisation des catégories prédéfinies:', error);
            throw error;
        }
    },

    // Récupérer toutes les catégories pour tous les types de budget
    getAllCategories: async () => {
        try {
            const typesResponse = await axios.get(`${API_BASE_URL}/api/types-budget`);
            const types = typesResponse.data;
            
            const allCategories = [];
            for (const type of types) {
                const categoriesResponse = await axios.get(`${BASE_URL}/${type.id}/categories`);
                allCategories.push(...categoriesResponse.data);
            }
            return allCategories;
        } catch (error) {
            console.error('Erreur lors de la récupération de toutes les catégories:', error);
            throw error;
        }
    }
}; 