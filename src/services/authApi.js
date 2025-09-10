import axios from 'axios';

// Configuration de l'API - utilise les variables d'environnement
const API_BASE = process.env.REACT_APP_API_BASE_URL || (
  process.env.NODE_ENV === 'production'
    ? '/api'  // Utilise le proxy en production
    : 'https://mon-api-aspnet.onrender.com/api' // Fallback pour le développement
);

console.log('API_BASE:', API_BASE);

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Handle redirects automatically
  maxRedirects: 5,
  // Add timeout
  timeout: 15000,
  // Add withCredentials for CORS
  withCredentials: false,
});

// Add request interceptor to handle CORS
apiClient.interceptors.request.use(
  (config) => {
    // Ne pas ajouter les headers CORS côté client - c'est au serveur de les gérer
    console.log('Requête API:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - possible CORS issue or server unavailable');
    }
    return Promise.reject(error);
  }
);

const authApi = {
  // Connexion
  login: async (ecoleId, email, password) => {
    try {
      console.log('Tentative de connexion avec:', { ecoleId, email, password: '***' });
      
      // S'assurer que ecoleId est un nombre
      const numericEcoleId = parseInt(ecoleId, 10);
      
      if (isNaN(numericEcoleId)) {
        throw new Error('ID d\'école invalide');
      }
      
      const response = await apiClient.post('/auth/login', {
        email,
        password,
        ecoleId: numericEcoleId
      });
      
      console.log('Réponse login brute:', response);
      console.log('Réponse login data:', response.data);
      
      // La réponse de l'API a une structure imbriquée
      if (response.data && response.data.success) {
        return response.data;
      } else {
        // Si la réponse n'a pas la structure attendue, on la retourne telle quelle
        return response.data;
      }
    } catch (error) {
      console.error('Erreur login:', error);
      
      if (error.response) {
        // Erreur de réponse du serveur
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        return error.response.data;
      } else if (error.request) {
        // Erreur de réseau
        console.error('Erreur réseau:', error.request);
        return {
          success: false,
          message: 'Erreur de connexion au serveur. Vérifiez votre connexion internet.'
        };
      } else {
        // Erreur de configuration
        console.error('Erreur de configuration:', error.message);
        return {
          success: false,
          message: error.message || 'Erreur de configuration'
        };
      }
    }
  },

  // Inscription des parents (publique)
  registerParent: async (registerData) => {
    try {
      const response = await apiClient.post('/auth/register/parent', registerData);
      return response.data;
    } catch (error) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  },

  // Inscription des administrateurs (réservé aux SuperAdmin)
  registerAdmin: async (registerData, token) => {
    try {
      const response = await apiClient.post('/auth/register/admin', registerData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  },

  // Inscription des enseignants (réservé aux SuperAdmin/Admin)
  registerTeacher: async (registerData, token) => {
    try {
      const response = await apiClient.post('/auth/register/teacher', registerData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  },

  // Renouvellement de token
  refreshToken: async (token, refreshToken) => {
    try {
      const response = await apiClient.post('/auth/refresh-token', {
        token,
        refreshToken
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  },

  // Déconnexion
  logout: async (token) => {
    try {
      const response = await apiClient.post('/auth/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  },

  // Récupérer le profil utilisateur actuel
  getCurrentUser: async (token) => {
    try {
      const response = await apiClient.get('/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  },

  // Récupérer la liste des écoles disponibles
  getSchools: async (page = 1, pageSize = 20) => {
    try {
      // Utiliser l'API via le proxy
      const url = `/api/ecoles?page=${page}&pageSize=${pageSize}`;
      console.log('Tentative de récupération des écoles depuis:', url);

      const response = await apiClient.get(`/ecoles?page=${page}&pageSize=${pageSize}`);

      console.log('Réponse brute des écoles:', response);
      console.log('Données des écoles:', response.data);

      if (Array.isArray(response.data)) {
        console.log(`${response.data.length} écoles récupérées avec succès`);
        return response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        console.log(`${response.data.data.length} écoles récupérées avec succès`);
        return response.data.data;
      } else {
        console.error('Format de réponse inattendu pour les écoles:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des écoles:', error);
      if (error.response) {
        console.error('Détails de l\'erreur:', error.response.data);
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
      }

      // Fallback data basé sur la réponse de l'API que vous avez fournie
      console.log('Utilisation des données de fallback pour les écoles');
      return [
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
    }
  },

  // Récupérer la liste des classes d'une école
  getClasses: async (ecoleId) => {
    try {
      // Utiliser l'API via le proxy
      console.log('Tentative de récupération des classes depuis:', `/api/ecoles/${ecoleId}/classes`);

      const response = await apiClient.get(`/ecoles/${ecoleId}/classes`);

      console.log('Réponse brute des classes:', response);

      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data && response.data.classes && Array.isArray(response.data.classes)) {
        return response.data.classes;
      } else {
        console.error('Format de réponse inattendu pour les classes:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des classes:', error);
      if (error.response) {
        console.error('Détails de l\'erreur:', error.response.data);
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
      }

      // Fallback data pour les classes
      console.log('Utilisation des données de fallback pour les classes');
      return [
        { id: 1, nom: "Petite Section", niveau: "Maternelle", effectif: 20 },
        { id: 2, nom: "Moyenne Section", niveau: "Maternelle", effectif: 22 },
        { id: 3, nom: "Grande Section", niveau: "Maternelle", effectif: 25 },
        { id: 4, nom: "CP", niveau: "Primaire", effectif: 28 },
        { id: 5, nom: "CE1", niveau: "Primaire", effectif: 26 },
        { id: 6, nom: "CE2", niveau: "Primaire", effectif: 24 }
      ];
    }
  },

  // Méthode pour changer la configuration de l'API
  setApiBase: (newBase) => {
    apiClient.defaults.baseURL = newBase;
    console.log('API base URL changée vers:', newBase);
  },

  // Méthode pour obtenir la configuration actuelle
  getApiConfig: () => {
    return {
      currentBase: apiClient.defaults.baseURL,
      apiBase: API_BASE
    };
  }
};

export default authApi; 