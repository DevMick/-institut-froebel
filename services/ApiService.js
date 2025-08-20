import * as SecureStore from 'expo-secure-store';
import { API_CONFIG, DEMO_DATA } from '../config/api-config';

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
    // Vérifier si le mode démo est forcé
    if (API_CONFIG.FORCE_DEMO_MODE) {
      console.log('🧪 Mode démo forcé - Utilisation des données de test');
      return DEMO_DATA.clubs;
    }

    const urlsToTry = [
      `${API_CONFIG.LOCAL_URL}${API_CONFIG.API_PREFIX}/Clubs`,
      `${API_CONFIG.NGROK_URL}${API_CONFIG.API_PREFIX}/Clubs`,
    ];

    for (let i = 0; i < urlsToTry.length; i++) {
      const url = urlsToTry[i];
      try {
        console.log(`🔄 Tentative ${i + 1}/${urlsToTry.length} - URL:`, url);
        
        // Test de connectivité d'abord
        console.log('🔍 Test de connectivité...');
        try {
          const testResponse = await fetch(url, { 
            method: 'HEAD',
            mode: 'cors',
            headers: API_CONFIG.DEFAULT_HEADERS
          });
          console.log('📡 Status de connectivité:', testResponse.status);
        } catch (testError) {
          console.log('⚠️ Test de connectivité échoué, continuation avec GET:', testError.message);
        }
        
        console.log('🌐 Tentative de requête GET...');
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          headers: API_CONFIG.DEFAULT_HEADERS,
        });

        console.log('📊 Status de la réponse:', response.status);
        console.log('📊 Headers de la réponse:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Erreur HTTP:', response.status, errorText);
          throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('📊 Réponse API clubs (brute):', data);
        console.log('📊 Type de données:', typeof data);
        console.log('📊 Est un tableau?', Array.isArray(data));
        
        // S'assurer que data est un tableau
        const clubs = Array.isArray(data) ? data : [];
        console.log('✅ Clubs récupérés:', clubs.length);
        
        if (clubs.length > 0) {
          console.log('📋 Premier club:', clubs[0]);
        }
        
        return clubs;
      } catch (error) {
        console.error(`❌ Erreur avec URL ${url}:`, error);
        if (i === urlsToTry.length - 1) {
          // C'est la dernière tentative, on utilise les données de test
          console.error('❌ Toutes les URLs ont échoué, utilisation des données de test');
          console.log('⚠️ Mode démo activé - Utilisation de données de test');
          return DEMO_DATA.clubs;
        }
        console.log('🔄 Tentative de l\'URL suivante...');
      }
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

  // Alias pour getMembers (pour compatibilité)
  async getClubMembers(clubId) {
    return this.getMembers(clubId);
  }

  // Méthode pour envoyer des emails de club
  async sendClubEmail(emailData) {
    try {
      // En mode démo, simuler l'envoi d'email
      if (API_CONFIG.FORCE_DEMO_MODE) {
        console.log('🧪 Mode démo - Simulation envoi email:', emailData);
        return {
          success: true,
          message: 'Email envoyé avec succès (mode démo)',
          sentTo: emailData.recipients?.length || 0
        };
      }

      const response = await this.makeRequest('/Email/send', {
        method: 'POST',
        body: JSON.stringify(emailData),
      });
      return response;
    } catch (error) {
      console.error('Erreur sendClubEmail:', error);
      throw error;
    }
  }

  // Méthode pour envoyer des messages WhatsApp
  async sendWhatsAppMessage(messageData) {
    try {
      // En mode démo, simuler l'envoi WhatsApp
      if (API_CONFIG.FORCE_DEMO_MODE) {
        console.log('🧪 Mode démo - Simulation envoi WhatsApp:', messageData);
        return {
          success: true,
          message: 'Message WhatsApp envoyé avec succès (mode démo)',
          sentTo: messageData.recipients?.length || 0
        };
      }

      const response = await this.makeRequest('/WhatsApp/send', {
        method: 'POST',
        body: JSON.stringify(messageData),
      });
      return response;
    } catch (error) {
      console.error('Erreur sendWhatsAppMessage:', error);
      throw error;
    }
  }

}
