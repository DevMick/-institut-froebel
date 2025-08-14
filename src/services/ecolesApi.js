import axios from 'axios';

// Configuration pour l'API des écoles - utilise le proxy
const ECOLES_API_BASE = '/api';

console.log('ECOLES_API_BASE:', ECOLES_API_BASE);

// Créer une instance axios pour les écoles
const ecolesApiClient = axios.create({
  baseURL: ECOLES_API_BASE,
  headers: {
    'accept': 'text/plain',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Intercepteur pour les requêtes
ecolesApiClient.interceptors.request.use(
  (config) => {
    console.log('Requête écoles:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Erreur de requête écoles:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
ecolesApiClient.interceptors.response.use(
  (response) => {
    console.log('Réponse écoles:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Erreur de réponse écoles:', error);
    return Promise.reject(error);
  }
);

const ecolesApi = {
  // Récupérer toutes les écoles avec pagination
  getEcoles: async (page = 1, pageSize = 20) => {
    try {
      console.log(`Récupération des écoles - Page: ${page}, Taille: ${pageSize}`);
      const response = await ecolesApiClient.get(`/ecoles?page=${page}&pageSize=${pageSize}`);
      
      if (Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data,
          pagination: {
            page,
            pageSize,
            total: response.data.length,
            hasMore: response.data.length === pageSize
          },
          message: `${response.data.length} écoles récupérées`
        };
      } else {
        console.warn('Format de réponse inattendu:', response.data);
        return {
          success: true,
          data: response.data,
          pagination: { page, pageSize, total: 0, hasMore: false },
          message: 'Données récupérées avec format non standard'
        };
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des écoles:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Erreur lors de la récupération des écoles';
      
      // Données de fallback basées sur votre exemple
      const fallbackData = [
        {
          id: 2,
          nom: "Institut Froebel LA TULIPE",
          code: "FROEBEL_DEFAULT",
          adresse: "Marcory Anoumambo, en face de l'ARTCI",
          commune: "Marcory",
          telephone: "+225 27 22 49 50 00",
          email: "contact@froebel-default.ci",
          anneeScolaire: "2024-2025",
          nombreUtilisateurs: 3,
          nombreClasses: 4,
          nombreEleves: 3,
          createdAt: "2025-07-02T01:31:58.01563Z"
        }
      ];
      
      return {
        success: false,
        data: fallbackData,
        pagination: { page: 1, pageSize: 20, total: 1, hasMore: false },
        message: `${errorMessage} (utilisation des données de fallback)`,
        error: error
      };
    }
  },

  // Récupérer toutes les écoles (sans pagination)
  getAllEcoles: async () => {
    try {
      console.log('Récupération de toutes les écoles');
      // Récupérer avec une grande taille de page pour avoir toutes les écoles
      const result = await ecolesApi.getEcoles(1, 100);
      
      if (result.success) {
        return {
          success: true,
          data: result.data,
          message: `${result.data.length} écoles récupérées au total`
        };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de toutes les écoles:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Erreur lors de la récupération des écoles',
        error: error
      };
    }
  },

  // Récupérer une école spécifique par ID
  getEcoleById: async (ecoleId) => {
    try {
      console.log(`Récupération de l'école ${ecoleId}`);
      const response = await ecolesApiClient.get(`/ecoles/${ecoleId}`);
      
      return {
        success: true,
        data: response.data,
        message: 'École récupérée avec succès'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'école:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Erreur lors de la récupération de l\'école';
      
      return {
        success: false,
        data: null,
        message: errorMessage,
        error: error
      };
    }
  },

  // Rechercher des écoles par nom
  searchEcoles: async (searchTerm, page = 1, pageSize = 20) => {
    try {
      console.log(`Recherche d'écoles: "${searchTerm}"`);
      const response = await ecolesApiClient.get(`/ecoles/search?q=${encodeURIComponent(searchTerm)}&page=${page}&pageSize=${pageSize}`);
      
      if (Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data,
          pagination: { page, pageSize, total: response.data.length },
          message: `${response.data.length} écoles trouvées`
        };
      } else {
        return {
          success: true,
          data: response.data,
          pagination: { page, pageSize, total: 0 },
          message: 'Recherche effectuée'
        };
      }
    } catch (error) {
      console.error('Erreur lors de la recherche d\'écoles:', error);
      
      // Fallback: filtrer les données locales
      const allEcoles = await ecolesApi.getAllEcoles();
      if (allEcoles.success) {
        const filtered = allEcoles.data.filter(ecole => 
          ecole.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ecole.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ecole.commune?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        return {
          success: true,
          data: filtered,
          pagination: { page: 1, pageSize: filtered.length, total: filtered.length },
          message: `${filtered.length} écoles trouvées (recherche locale)`
        };
      }
      
      return {
        success: false,
        data: [],
        pagination: { page, pageSize, total: 0 },
        message: error.message || 'Erreur lors de la recherche',
        error: error
      };
    }
  },

  // Tester la connexion à l'API
  testConnection: async () => {
    try {
      console.log('Test de connexion à l\'API écoles');
      const response = await ecolesApiClient.get('/ecoles?page=1&pageSize=1');
      
      return {
        success: true,
        message: 'Connexion à l\'API écoles réussie',
        data: response.data
      };
    } catch (error) {
      console.error('Erreur de connexion à l\'API écoles:', error);
      
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
      baseURL: ECOLES_API_BASE,
      timeout: ecolesApiClient.defaults.timeout,
      headers: ecolesApiClient.defaults.headers
    };
  }
};

export default ecolesApi;
