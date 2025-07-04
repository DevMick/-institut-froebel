import axios from 'axios';

// Configuration de l'API - utilise directement l'URL GitHub Codespaces
const API_BASE = 'https://ominous-space-potato-r4gg6jvq474jcx99j-5271.app.github.dev/api';

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
    // Add CORS headers
    config.headers['Access-Control-Allow-Origin'] = '*';
    config.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    config.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
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
  getSchools: async () => {
    try {
      console.log('Tentative de récupération des écoles depuis:', `${API_BASE}/auth/schools`);
      const response = await apiClient.get('/auth/schools');
      console.log('Réponse brute des écoles:', response);
      
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
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
      
      // Fallback data basé sur la réponse de l'API
      console.log('Utilisation des données de fallback pour les écoles');
      return [
        { id: 1, nom: "Institut Froebel" },
        { id: 2, nom: "Institut Froebel LA TULIPE" }
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