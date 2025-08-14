import axios from 'axios';

// Configuration pour l'API des classes
const CLASSES_API_BASE = 'http://localhost:5000/api';

console.log('CLASSES_API_BASE:', CLASSES_API_BASE);

// Créer une instance axios pour les classes
const classesApiClient = axios.create({
  baseURL: CLASSES_API_BASE,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Intercepteur pour les requêtes
classesApiClient.interceptors.request.use(
  (config) => {
    console.log('Requête classes:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Erreur de requête classes:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
classesApiClient.interceptors.response.use(
  (response) => {
    console.log('Réponse classes:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Erreur de réponse classes:', error);
    return Promise.reject(error);
  }
);

const classesApi = {
  // Récupérer toutes les classes d'une école
  getClassesByEcole: async (ecoleId) => {
    try {
      console.log(`Récupération des classes pour l'école ${ecoleId}`);
      const response = await classesApiClient.get(`/ecoles/${ecoleId}/classes`);
      
      // Gérer différents formats de réponse
      if (Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data,
          message: `${response.data.length} classes récupérées`
        };
      } else if (response.data && Array.isArray(response.data.data)) {
        return {
          success: true,
          data: response.data.data,
          message: `${response.data.data.length} classes récupérées`
        };
      } else if (response.data && Array.isArray(response.data.classes)) {
        return {
          success: true,
          data: response.data.classes,
          message: `${response.data.classes.length} classes récupérées`
        };
      } else {
        console.warn('Format de réponse inattendu:', response.data);
        return {
          success: true,
          data: response.data,
          message: 'Données récupérées avec format non standard'
        };
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des classes:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Erreur lors de la récupération des classes';
      
      return {
        success: false,
        data: [],
        message: errorMessage,
        error: error
      };
    }
  },

  // Récupérer une classe spécifique
  getClasseById: async (ecoleId, classeId) => {
    try {
      console.log(`Récupération de la classe ${classeId} de l'école ${ecoleId}`);
      const response = await classesApiClient.get(`/ecoles/${ecoleId}/classes/${classeId}`);
      
      return {
        success: true,
        data: response.data,
        message: 'Classe récupérée avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la classe:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Erreur lors de la récupération de la classe';
      
      return {
        success: false,
        data: null,
        message: errorMessage,
        error: error
      };
    }
  },

  // Tester la connexion à l'API
  testConnection: async () => {
    try {
      console.log('Test de connexion à l\'API classes');
      // Tester avec l'école ID 1
      const response = await classesApiClient.get('/ecoles/1/classes');
      
      return {
        success: true,
        message: 'Connexion à l\'API classes réussie',
        data: response.data
      };
    } catch (error) {
      console.error('Erreur de connexion à l\'API classes:', error);
      
      return {
        success: false,
        message: `Erreur de connexion: ${error.message}`,
        error: error
      };
    }
  },

  // Obtenir la configuration actuelle
  getConfig: () => {
    return {
      baseURL: CLASSES_API_BASE,
      timeout: classesApiClient.defaults.timeout,
      headers: classesApiClient.defaults.headers
    };
  }
};

export default classesApi;
