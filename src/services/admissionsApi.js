import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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