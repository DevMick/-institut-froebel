import axios from 'axios';
import { API_BASE_URL } from '../config';

const COTISATION_API_URL = `${API_BASE_URL}/Cotisation`;

export const getCotisations = async () => {
  try {
    const response = await fetch(COTISATION_API_URL);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des cotisations');
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
};

export const getCotisationById = async (id) => {
  try {
    const response = await fetch(`${COTISATION_API_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de la cotisation');
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
};

export const getCotisationsByMandat = async (mandatId) => {
  try {
    const response = await fetch(`${COTISATION_API_URL}/mandat/${mandatId}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des cotisations du mandat');
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
};

export const getCotisationsByMembre = async (membreId) => {
  try {
    const response = await fetch(`${COTISATION_API_URL}/membre/${membreId}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des cotisations du membre');
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
};

export const createCotisation = async (cotisationData) => {
  try {
    const response = await fetch(COTISATION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cotisationData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erreur lors de la création de la cotisation');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
};

export const updateCotisation = async (id, cotisationData) => {
  try {
    const response = await fetch(`${COTISATION_API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cotisationData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erreur lors de la modification de la cotisation');
    }

    // Si la réponse est vide (204 No Content), retourner les données mises à jour
    if (response.status === 204) {
      return { ...cotisationData, id };
    }

    // Sinon, essayer de parser la réponse JSON
    try {
      return await response.json();
    } catch (e) {
      // Si la réponse n'est pas un JSON valide, retourner les données mises à jour
      return { ...cotisationData, id };
    }
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
};

export const deleteCotisation = async (id) => {
  try {
    const response = await fetch(`${COTISATION_API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erreur lors de la suppression de la cotisation');
    }

    return true;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
};

export const createBulkCotisations = async (bulkData) => {
  try {
    const response = await fetch(`${COTISATION_API_URL}/bulk-create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bulkData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erreur lors de la création en masse des cotisations');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}; 