import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5265/api';

// Add axios interceptor for authentication
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// GET: api/clubs/{clubId}/mandats/{mandatId}/membres
// Récupérer tous les membres d'un mandat spécifique
export const getMembresMandat = async (clubId, mandatId) => {
  try {
    const response = await axios.get(`${API_URL}/clubs/${clubId}/mandats/${mandatId}/membres`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(error.response?.data || 'Erreur lors de la récupération des membres du mandat');
  }
};

// GET: api/clubs/{clubId}/mandats/{mandatId}/membres/{comiteMembreId}
// Récupérer un membre spécifique d'un mandat
export const getMembreMandat = async (clubId, mandatId, comiteMembreId) => {
  try {
    const response = await axios.get(`${API_URL}/clubs/${clubId}/mandats/${mandatId}/membres/${comiteMembreId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(error.response?.data || 'Erreur lors de la récupération du membre du mandat');
  }
};

// POST: api/clubs/{clubId}/mandats/{mandatId}/membres
// Affecter un membre à un mandat
export const affecterMembreMandat = async (clubId, mandatId, data) => {
  try {
    const response = await axios.post(`${API_URL}/clubs/${clubId}/mandats/${mandatId}/membres`, data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(error.response?.data?.message || error.response?.data || 'Erreur lors de l\'affectation du membre au mandat');
  }
};

// PUT: api/clubs/{clubId}/mandats/{mandatId}/membres/{comiteMembreId}
// Modifier l'affectation d'un membre à un mandat
export const modifierAffectationMembre = async (clubId, mandatId, comiteMembreId, data) => {
  try {
    const response = await axios.put(`${API_URL}/clubs/${clubId}/mandats/${mandatId}/membres/${comiteMembreId}`, data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(error.response?.data?.message || error.response?.data || 'Erreur lors de la modification de l\'affectation');
  }
};

// DELETE: api/clubs/{clubId}/mandats/{mandatId}/membres/{comiteMembreId}
// Supprimer l'affectation d'un membre à un mandat
export const supprimerMembreMandat = async (clubId, mandatId, comiteMembreId) => {
  try {
    const response = await axios.delete(`${API_URL}/clubs/${clubId}/mandats/${mandatId}/membres/${comiteMembreId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(error.response?.data?.message || error.response?.data || 'Erreur lors de la suppression du membre du mandat');
  }
};

// GET: api/clubs/{clubId}/mandats/{mandatId}/membres/disponibles
// Récupérer les membres du club qui ne sont pas encore dans ce mandat
export const getMembresDisponibles = async (clubId, mandatId) => {
  try {
    const response = await axios.get(`${API_URL}/clubs/${clubId}/mandats/${mandatId}/membres/disponibles`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(error.response?.data || 'Erreur lors de la récupération des membres disponibles');
  }
};

// GET: api/clubs/{clubId}/fonctions
// Récupérer toutes les fonctions disponibles
export const getFonctions = async (clubId) => {
  try {
    const response = await axios.get(`${API_URL}/clubs/${clubId}/fonctions`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(error.response?.data || 'Erreur lors de la récupération des fonctions');
  }
}; 