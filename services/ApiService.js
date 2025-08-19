import * as SecureStore from 'expo-secure-store';

// Configuration API (version JS)
const API_CONFIG = {
  BASE_URL: 'http://localhost:5265', // URL locale directe
  API_PREFIX: '/api',
  TIMEOUT: 10000,
};

export class ApiService {
  async getToken() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('authToken');
      }
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('authToken');
      }
      return null;
    }
  }

  async setToken(token) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('authToken', token);
        return;
      }
      await SecureStore.setItemAsync('authToken', token);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token:', error);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('authToken', token);
      }
    }
  }

  async removeToken() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('authToken');
        return;
      }
      await SecureStore.deleteItemAsync('authToken');
    } catch (error) {
      console.error('Erreur lors de la suppression du token:', error);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('authToken');
      }
    }
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const token = await this.getToken();
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${endpoint}`;

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...options.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          await this.removeToken();
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  }

  async login(loginData) {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/Auth/login`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur de connexion');
      }

      const data = await response.json();
      
      if (data.token) {
        await this.setToken(data.token);
      }

      return data.user;
    } catch (error) {
      console.error('Erreur login:', error);
      throw error;
    }
  }

  async register(userData) {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/Auth/register`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur d\'inscription');
      }

      const data = await response.json();
      
      if (data.token) {
        await this.setToken(data.token);
      }

      return data.user;
    } catch (error) {
      console.error('Erreur register:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await this.removeToken();
      return { success: true };
    } catch (error) {
      console.error('Erreur logout:', error);
      throw error;
    }
  }

  async getClubs() {
    try {
      console.log('🔄 Tentative de récupération des clubs...');
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/Clubs`;
      console.log('🌐 URL appelée:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Réponse API clubs:', data);
      
      // S'assurer que data est un tableau
      const clubs = Array.isArray(data) ? data : [];
      console.log('✅ Clubs récupérés:', clubs.length);
      return clubs;
    } catch (error) {
      console.error('❌ Erreur getClubs:', error);
      throw error;
    }
  }

  async getMembers(clubId) {
    try {
      const response = await this.makeRequest(`/Members/club/${clubId}`);
      return response.data || [];
    } catch (error) {
      console.error('Erreur getMembers:', error);
      throw error;
    }
  }

  async getReunions(clubId) {
    try {
      const response = await this.makeRequest(`/Reunions/club/${clubId}`);
      return response.data || [];
    } catch (error) {
      console.error('Erreur getReunions:', error);
      throw error;
    }
  }

  async getCotisations(clubId) {
    try {
      const response = await this.makeRequest(`/Cotisations/club/${clubId}`);
      return response.data || [];
    } catch (error) {
      console.error('Erreur getCotisations:', error);
      throw error;
    }
  }

  async updateProfile(userData) {
    try {
      const response = await this.makeRequest('/Users/profile', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      return response.data;
    } catch (error) {
      console.error('Erreur updateProfile:', error);
      throw error;
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await this.makeRequest('/Users/change-password', {
        method: 'PUT',
        body: JSON.stringify(passwordData),
      });
      return response.data;
    } catch (error) {
      console.error('Erreur changePassword:', error);
      throw error;
    }
  }

  async sendSituationCotisation(emailData) {
    try {
      const response = await this.makeRequest('/EmailCotisation/send-to-multiple-members', {
        method: 'POST',
        body: JSON.stringify({
          clubId: emailData.clubId,
          membresIds: emailData.membresIds
        }),
      });
      return response;
    } catch (error) {
      console.error('Erreur sendSituationCotisation:', error);
      throw error;
    }
  }
}
