// Script de test pour vérifier la configuration de l'API
console.log('=== Test de configuration API ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);

// Simuler la logique de configuration
const API_BASE = process.env.REACT_APP_API_BASE_URL || (
  process.env.NODE_ENV === 'production'
    ? '/api'  // Utilise le proxy en production
    : 'https://mon-api-aspnet.onrender.com/api' // Fallback pour le développement
);

console.log('API_BASE calculé:', API_BASE);
console.log('URL complète de login:', API_BASE + '/auth/login');
