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
      const url = `${API_CONFIG.NGROK_URL}${API_CONFIG.API_PREFIX}${endpoint}`;

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
      console.log('🔐 Tentative de connexion...');
      console.log('📧 Email:', loginData.email);
      console.log('🏢 Club ID:', loginData.clubId);
      
      // Utiliser l'URL ngrok pour la connexion
      const url = `${API_CONFIG.NGROK_URL}${API_CONFIG.API_PREFIX}/Auth/login`;
      console.log('🌐 URL de connexion:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(loginData),
      });

      console.log('📊 Status de la réponse:', response.status);
      console.log('📊 Headers de la réponse:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        // Essayer de lire le contenu de l'erreur
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Erreur de connexion';
        
        try {
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || 'Erreur de connexion';
          } else {
            const errorText = await response.text();
            console.error('❌ Réponse d\'erreur (non-JSON):', errorText);
            errorMessage = `Erreur serveur (${response.status}): ${errorText.substring(0, 100)}`;
          }
        } catch (parseError) {
          console.error('❌ Erreur lors du parsing de la réponse:', parseError);
          errorMessage = `Erreur de connexion (${response.status})`;
        }
        
        throw new Error(errorMessage);
      }

      // Vérifier le type de contenu de la réponse
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('❌ Réponse non-JSON reçue:', responseText);
        throw new Error('Le serveur a retourné une réponse invalide. Vérifiez que l\'API backend est correctement configurée.');
      }

      const data = await response.json();
      console.log('✅ Données de connexion reçues:', data);
      
      if (data.token) {
        await this.setToken(data.token);
        console.log('🔑 Token sauvegardé');
      }

      // Construire l'objet utilisateur à partir de la réponse
      const userData = {
        id: data.userId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName} ${data.lastName}`,
        clubId: data.clubId,
        clubName: data.clubName,
        numeroMembre: data.numeroMembre,
        roles: data.roles || [],
        dateAnniversaire: data.dateAnniversaire
      };

      console.log('👤 Données utilisateur formatées:', userData);
      return userData;
    } catch (error) {
      console.error('❌ Erreur login:', error);
      throw error;
    }
  }

  async register(userData) {
    try {
      console.log('📝 Tentative d\'inscription...');
      
      // Utiliser l'URL ngrok pour l'inscription
      const url = `${API_CONFIG.NGROK_URL}${API_CONFIG.API_PREFIX}/Auth/register`;
      console.log('🌐 URL d\'inscription:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(userData),
      });

      console.log('📊 Status de la réponse:', response.status);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Erreur d\'inscription';
        
        try {
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || 'Erreur d\'inscription';
          } else {
            const errorText = await response.text();
            console.error('❌ Réponse d\'erreur (non-JSON):', errorText);
            errorMessage = `Erreur serveur (${response.status}): ${errorText.substring(0, 100)}`;
          }
        } catch (parseError) {
          console.error('❌ Erreur lors du parsing de la réponse:', parseError);
          errorMessage = `Erreur d'inscription (${response.status})`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Données d\'inscription reçues:', data);
      
      if (data.token) {
        await this.setToken(data.token);
        console.log('🔑 Token sauvegardé');
      }

      // Construire l'objet utilisateur à partir de la réponse
      const userData = {
        id: data.userId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName} ${data.lastName}`,
        clubId: data.clubId,
        clubName: data.clubName,
        numeroMembre: data.numeroMembre,
        roles: data.roles || [],
        dateAnniversaire: data.dateAnniversaire
      };

      console.log('👤 Données utilisateur formatées:', userData);
      return userData;
    } catch (error) {
      console.error('❌ Erreur register:', error);
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

    console.log('🚨 ATTENTION: Tentative de connexion API réelle...');
    console.log('⏰ Timeout de 10 secondes pour éviter le blocage');

    const urlsToTry = [
      // Pour Expo Snack, on essaie d'abord ngrok car localhost ne marchera pas
      `${API_CONFIG.NGROK_URL}${API_CONFIG.API_PREFIX}/Clubs`,
      `${API_CONFIG.LOCAL_URL}${API_CONFIG.API_PREFIX}/Clubs`,
    ];

    for (let i = 0; i < urlsToTry.length; i++) {
      const url = urlsToTry[i];
      try {
        console.log(`🔄 Tentative ${i + 1}/${urlsToTry.length} - URL:`, url);
        
        // Lancer directement la requête GET (évite un pré-test qui peut être bloqué)
        console.log('🌐 Tentative de requête GET...');
        
        // Ajouter un timeout de 20 secondes (plus généreux)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);
        
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          // En-têtes minimaux pour éviter une préflight CORS
          headers: {
            Accept: 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        console.log('✅ Requête GET terminée');

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
                  // C'est la dernière tentative, on lance une erreur
                  console.error('❌ Toutes les URLs ont échoué');
                  throw new Error('Impossible de se connecter à l\'API. Vérifiez votre connexion internet et que le serveur backend est démarré.');
                }
        console.log('🔄 Tentative de l\'URL suivante...');
      }
    }
    
    // Si on arrive ici, lancer une erreur
    console.log('🛡️ Fallback de sécurité - Erreur de connexion');
    throw new Error('Impossible de se connecter à l\'API. Vérifiez votre connexion internet et que le serveur backend est démarré.');
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
