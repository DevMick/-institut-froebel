import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || (
  process.env.NODE_ENV === 'production'
    ? '/api'  // Utilise le proxy en production
    : 'https://mon-api-aspnet.onrender.com/api' // Fallback pour le développement
);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

const admissionsApi = {
  getConditions: () => api.get('/admissions/conditions').then(res => res.data),
  getDossiersRequis: () => api.get('/admissions/dossiers-requis').then(res => res.data),
  getTarifs: () => api.get('/admissions/tarifs').then(res => res.data),
  getSchools: () => api.get('/auth/schools').then(res => res.data),
  postPreInscription: (payload) => api.post('/admissions/pre-inscription', payload).then(res => res.data),
  getFAQ: () => api.get('/admissions/faq').then(res => res.data),
};

export default admissionsApi; 