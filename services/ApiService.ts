import * as SecureStore from 'expo-secure-store';
import { API_CONFIG, DEMO_DATA } from '../config/api-config';

// Types pour les données
interface LoginData {
  email: string;
  password: string;
  clubId: string;
}

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  clubId: string;
  clubName: string;
  numeroMembre: string;
  roles: string[];
  dateAnniversaire?: string;
}

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
  roles: string[];
  profilePictureUrl?: string;
  fullName: string;
  numeroMembre: string;
  dateAnniversaire?: string;
  userJoinedDate?: string;
  clubJoinedDate?: string;
  clubId: string;
  clubName: string;
}

interface EmailData {
  clubId: string;
  membresIds: string[];
  messagePersonnalise?: string;
}

interface CalendrierData {
  clubId: string;
  mois: number;
  messagePersonnalise?: string;
  membresIds: string[];
  envoyerATousLesMembres: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

export class ApiService {
  async getToken(): Promise<string | null> {
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

  async setToken(token: string): Promise<void> {
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

  async removeToken(): Promise<void> {
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

  async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
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
        if (response.status === 404) {
          console.log('⚠️ Endpoint non trouvé (404)');
          throw new Error(`Endpoint non trouvé: ${response.status}`);
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

  async login(loginData: LoginData): Promise<UserData> {
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
      const userData: UserData = {
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

  async register(userData: any): Promise<UserData> {
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
      const userDataResult: UserData = {
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

      console.log('👤 Données utilisateur formatées:', userDataResult);
      return userDataResult;
    } catch (error) {
      console.error('❌ Erreur register:', error);
      throw error;
    }
  }

  async logout(): Promise<{ success: boolean }> {
    try {
      await this.removeToken();
      return { success: true };
    } catch (error) {
      console.error('Erreur logout:', error);
      throw error;
    }
  }

  async getClubs(): Promise<any[]> {
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

  async getMembers(clubId: string): Promise<Member[]> {
    try {
      console.log('👥 Récupération des membres pour le club:', clubId);
      
      // Endpoint correct pour récupérer les membres d'un club
      const endpoint = `/Auth/club/${clubId}/members`;
      console.log('🌐 Endpoint membres:', endpoint);
      
      const response = await this.makeRequest(endpoint);
      console.log('✅ Réponse API membres:', response);
      
      // Vérifier la structure de réponse
      if (response && response.success && Array.isArray(response.members)) {
        console.log('✅ Membres récupérés:', response.members.length);
        return response.members;
      } else if (Array.isArray(response)) {
        console.log('✅ Membres récupérés (format tableau):', response.length);
        return response;
      } else {
        console.log('⚠️ Structure de réponse inattendue:', response);
        return [];
      }
    } catch (error) {
      console.error('❌ Erreur getMembers:', error);
      return [];
    }
  }

  async getReunions(clubId: string): Promise<any[]> {
    try {
      console.log('📅 Récupération des réunions pour le club:', clubId);
      
      // Essayer différents endpoints possibles pour les réunions
      const endpoints = [
        `/Auth/club/${clubId}/reunions`,
        `/Reunions/club/${clubId}`,
        `/Reunions/${clubId}`,
        `/Club/${clubId}/reunions`
      ];
      
      for (let i = 0; i < endpoints.length; i++) {
        try {
          console.log(`🔄 Tentative ${i + 1}/${endpoints.length} - Endpoint:`, endpoints[i]);
          const response = await this.makeRequest(endpoints[i]);
          console.log('✅ Réponse API réunions:', response);
          
          // Vérifier la structure de réponse
          if (response && response.success && Array.isArray(response.reunions)) {
            console.log('✅ Réunions récupérées:', response.reunions.length);
            return response.reunions;
          } else if (Array.isArray(response)) {
            console.log('✅ Réunions récupérées (format tableau):', response.length);
            return response;
          } else {
            console.log('⚠️ Structure de réponse inattendue:', response);
            return [];
          }
        } catch (error) {
          console.log(`❌ Endpoint ${endpoints[i]} échoué:`, error.message);
          if (i === endpoints.length - 1) {
            console.log('⚠️ Aucun endpoint de réunions ne fonctionne, retour de données vides');
            return [];
          }
        }
      }
    } catch (error) {
      console.error('❌ Erreur getReunions:', error);
      return [];
    }
  }

  async getCotisations(clubId: string): Promise<any[]> {
    try {
      console.log('💰 Récupération des cotisations pour le club:', clubId);
      
      // Essayer différents endpoints possibles pour les cotisations
      const endpoints = [
        `/Auth/club/${clubId}/cotisations`,
        `/Cotisations/club/${clubId}`,
        `/Cotisations/${clubId}`,
        `/Club/${clubId}/cotisations`
      ];
      
      for (let i = 0; i < endpoints.length; i++) {
        try {
          console.log(`🔄 Tentative ${i + 1}/${endpoints.length} - Endpoint:`, endpoints[i]);
          const response = await this.makeRequest(endpoints[i]);
          console.log('✅ Réponse API cotisations:', response);
          
          // Vérifier la structure de réponse
          if (response && response.success && Array.isArray(response.cotisations)) {
            console.log('✅ Cotisations récupérées:', response.cotisations.length);
            return response.cotisations;
          } else if (Array.isArray(response)) {
            console.log('✅ Cotisations récupérées (format tableau):', response.length);
            return response;
          } else {
            console.log('⚠️ Structure de réponse inattendue:', response);
            return [];
          }
        } catch (error) {
          console.log(`❌ Endpoint ${endpoints[i]} échoué:`, error.message);
          if (i === endpoints.length - 1) {
            console.log('⚠️ Aucun endpoint de cotisations ne fonctionne, retour de données vides');
            return [];
          }
        }
      }
    } catch (error) {
      console.error('❌ Erreur getCotisations:', error);
      return [];
    }
  }

  async updateProfile(userData: any): Promise<any> {
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

  async changePassword(passwordData: any): Promise<any> {
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

  async sendSituationCotisation(emailData: EmailData): Promise<ApiResponse> {
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

  async sendCalendrier(emailData: CalendrierData): Promise<ApiResponse> {
    try {
      console.log('📅 Envoi du calendrier pour le mois:', emailData.mois);
      
      const response = await this.makeRequest('/CalendrierEmail/envoyer-calendrier', {
        method: 'POST',
        body: JSON.stringify({
          clubId: emailData.clubId,
          mois: emailData.mois,
          messagePersonnalise: emailData.messagePersonnalise,
          membresIds: emailData.membresIds,
          envoyerATousLesMembres: emailData.envoyerATousLesMembres
        }),
      });
      
      console.log('✅ Réponse envoi calendrier:', response);
      return response;
    } catch (error) {
      console.error('❌ Erreur sendCalendrier:', error);
      throw error;
    }
  }

  // Alias pour getMembers (pour compatibilité)
  async getClubMembers(clubId: string): Promise<Member[]> {
    return this.getMembers(clubId);
  }

  // Méthode pour envoyer des emails de club
  async sendClubEmail(emailData: any): Promise<ApiResponse> {
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
  async sendWhatsAppMessage(messageData: any): Promise<ApiResponse> {
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
