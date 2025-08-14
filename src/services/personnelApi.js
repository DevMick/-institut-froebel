import axios from 'axios';

const API_BASE = '/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const personnelApi = {
  // Administrateurs - Récupérer tous les utilisateurs d'une école
  getSchoolUsers: async (ecoleId) => {
    try {
      console.log(`Récupération des utilisateurs pour l'école ${ecoleId}`);
      const response = await apiClient.get(`/auth/school/${ecoleId}/users`);
      console.log('Réponse getSchoolUsers:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur getSchoolUsers:', error);
      throw error;
    }
  },

  createAdmin: async (adminData) => {
    try {
      const response = await apiClient.post('/auth/register/admin', adminData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Professeurs
  getTeachers: async (ecoleId) => {
    try {
      const response = await apiClient.get(`/ecoles/${ecoleId}/professeurs`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createTeacher: async (ecoleId, teacherData) => {
    try {
      const response = await apiClient.post(`/ecoles/${ecoleId}/professeurs`, teacherData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateTeacher: async (ecoleId, teacherId, teacherData) => {
    try {
      const response = await apiClient.put(`/ecoles/${ecoleId}/professeurs/${teacherId}`, teacherData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteTeacher: async (ecoleId, teacherId) => {
    try {
      const response = await apiClient.delete(`/ecoles/${ecoleId}/professeurs/${teacherId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Classes (pour les selects)
  getClasses: async (ecoleId) => {
    try {
      const response = await apiClient.get(`/ecoles/${ecoleId}/classes`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default personnelApi;
