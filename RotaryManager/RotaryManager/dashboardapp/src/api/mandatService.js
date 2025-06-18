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

export const getMandats = async (clubId) => {
  try {
    const response = await axios.get(`${API_URL}/clubs/${clubId}/mandats`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(error.response?.data || 'Erreur lors de la récupération des mandats');
  }
};

export const getMandat = async (clubId, id) => {
  try {
    const response = await axios.get(`${API_URL}/clubs/${clubId}/mandats/${id}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(error.response?.data || 'Erreur lors de la récupération du mandat');
  }
};

export const createMandat = async (clubId, mandat) => {
  try {
    const response = await axios.post(`${API_URL}/clubs/${clubId}/mandats`, mandat);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(error.response?.data || 'Erreur lors de la création du mandat');
  }
};

export const updateMandat = async (clubId, id, mandat) => {
  try {
    const response = await axios.put(`${API_URL}/clubs/${clubId}/mandats/${id}`, mandat);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(error.response?.data || 'Erreur lors de la mise à jour du mandat');
  }
};

export const deleteMandat = async (clubId, id) => {
  try {
    const response = await axios.delete(`${API_URL}/clubs/${clubId}/mandats/${id}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(error.response?.data || 'Erreur lors de la suppression du mandat');
  }
}; 