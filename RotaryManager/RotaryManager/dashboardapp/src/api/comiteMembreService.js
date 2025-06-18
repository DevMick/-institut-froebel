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

export const getComiteMembres = async (clubId, comiteId) => {
  try {
    const response = await axios.get(`${API_URL}/clubs/${clubId}/comites/${comiteId}/membres`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(error.response?.data || 'Erreur lors de la récupération des membres du comité');
  }
};

export const getComiteMembre = async (clubId, comiteId, membreComiteId) => {
  try {
    const response = await axios.get(`${API_URL}/clubs/${clubId}/comites/${comiteId}/membres/${membreComiteId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(error.response?.data || 'Erreur lors de la récupération du membre du comité');
  }
};

export const createComiteMembre = async (clubId, comiteId, membre) => {
  try {
    const response = await axios.post(`${API_URL}/clubs/${clubId}/comites/${comiteId}/membres`, membre);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Erreur lors de l\'ajout du membre au comité');
  }
};

export const updateComiteMembre = async (clubId, comiteId, membreComiteId, data) => {
  try {
    const response = await axios.put(`${API_URL}/clubs/${clubId}/comites/${comiteId}/membres/${membreComiteId}`, data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(error.response?.data || 'Erreur lors de la mise à jour du membre du comité');
  }
};

export const deleteComiteMembre = async (clubId, comiteId, membreComiteId) => {
  try {
    const response = await axios.delete(`${API_URL}/clubs/${clubId}/comites/${comiteId}/membres/${membreComiteId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Erreur lors de la suppression du membre du comité');
  }
};

export const getMembresDisponibles = async (clubId, comiteId) => {
  try {
    const response = await axios.get(`${API_URL}/clubs/${clubId}/comites/${comiteId}/membres/disponibles`);
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

export const addComiteMembre = async (clubId, comiteId, data) => {
  try {
    const response = await axios.post(`${API_URL}/clubs/${clubId}/comites/${comiteId}/membres`, data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(error.response?.data || 'Erreur lors de l\'ajout du membre au comité');
  }
};

export const removeComiteMembre = async (clubId, comiteId, membreComiteId) => {
  try {
    const response = await axios.delete(`${API_URL}/clubs/${clubId}/comites/${comiteId}/membres/${membreComiteId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(error.response?.data || 'Erreur lors de la suppression du membre du comité');
  }
}; 