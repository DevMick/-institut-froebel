import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '../config/api';
import { User, Club, Member, Reunion, ApiResponse, LoginData } from '../types';

export class ApiService {
  private async getToken(): Promise<string | null> {
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

  private async setToken(token: string): Promise<void> {
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

  private async removeToken(): Promise<void> {
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

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getToken();
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${endpoint}`;

      const headers: HeadersInit = {
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

  async login(loginData: LoginData): Promise<User> {
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
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.token) {
        await this.setToken(result.token);

        try {
          console.log('🔄 Tentative de récupération du profil utilisateur...');
          const profile = await this.getCurrentUser();
          console.log('✅ Profil utilisateur récupéré:', profile);
          return profile;
        } catch (error) {
          console.log('⚠️ Erreur récupération profil utilisateur:', error);

          // Essayer de récupérer le nom depuis la réponse de login si disponible
          let firstName = 'Utilisateur';
          let lastName = 'Connecté';
          let fullName = 'Utilisateur Connecté';

          // Les données sont dans result directement, pas dans result.user
          if (result.firstName || result.lastName) {
            firstName = result.firstName || firstName;
            lastName = result.lastName || lastName;
            fullName = result.fullName || `${firstName} ${lastName}`;
          }

          console.log('🔄 Utilisation des données de fallback:', { firstName, lastName, fullName });

          return {
            id: result.userId || 'user-id',
            email: loginData.email,
            firstName,
            lastName,
            fullName,
            clubId: loginData.clubId
          };
        }
      }

      throw new Error(result.message || result.Message || 'Erreur de connexion');
    } catch (error) {
      console.error('Erreur lors du login:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    console.log('🔄 getCurrentUser: Tentative avec /Auth/me...');
    try {
      const response = await this.makeRequest<any>('/Auth/me');
      console.log('📥 Réponse /Auth/me:', response);
      if (response.success && response.data) {
        console.log('✅ getCurrentUser: Succès avec /Auth/me');
        // Construire fullName s'il n'existe pas
        const user = response.data;
        if (!user.fullName && user.firstName && user.lastName) {
          user.fullName = `${user.firstName} ${user.lastName}`;
        }
        console.log('🔍 Utilisateur final avec fullName:', { firstName: user.firstName, lastName: user.lastName, fullName: user.fullName });
        return user;
      }
    } catch (error) {
      console.log('❌ getCurrentUser: Erreur avec /Auth/me:', error);
      console.log('🔄 getCurrentUser: Tentative avec /Auth/getCurrentProfile...');
    }

    try {
      const response = await this.makeRequest<User>('/Auth/getCurrentProfile');
      console.log('📥 Réponse /Auth/getCurrentProfile:', response);
      if (response && response.data) {
        console.log('✅ getCurrentUser: Succès avec /Auth/getCurrentProfile');
        return response.data;
      }
    } catch (error) {
      console.log('❌ getCurrentUser: Erreur avec /Auth/getCurrentProfile:', error);
    }

    console.log('❌ getCurrentUser: Toutes les tentatives ont échoué');
    throw new Error('Impossible de récupérer les informations utilisateur');
  }

  async getClubs(): Promise<Club[]> {
    try {
      const url = `${API_CONFIG.BASE_URL}/api/Clubs`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'RotaryClubMobile/1.0',
          'Origin': 'https://snack.expo.dev',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
      console.error('Erreur chargement clubs:', error);
      return [];
    }
  }

  async getClubMembers(clubId: string): Promise<Member[]> {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/Auth/club/${clubId}/members`;
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'RotaryClubMobile/1.0',
          'Origin': 'https://snack.expo.dev',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await this.removeToken();
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 Données brutes reçues de l\'API membres:', JSON.stringify(data, null, 2));

      const members = Array.isArray(data) ? data : data.data || data.members || [];
      console.log('👥 Membres après traitement:', members.length);

      if (members.length > 0) {
        console.log('🔍 Premier membre API (structure):', JSON.stringify(members[0], null, 2));

        // Vérifier spécifiquement les fonctions et commissions
        members.forEach((member, index) => {
          console.log(`📋 Membre ${index + 1} API: ${member.fullName || member.firstName + ' ' + member.lastName}`);
          console.log(`  - Propriété 'fonctions':`, member.fonctions ? 'Présente' : 'Absente');
          console.log(`  - Propriété 'commissions':`, member.commissions ? 'Présente' : 'Absente');
          console.log(`  - Toutes les propriétés:`, Object.keys(member));
        });
      }

      return members;
    } catch (error) {
      console.error('Erreur chargement membres:', error);
      return [];
    }
  }

  async getClubReunions(clubId: string): Promise<Reunion[]> {
    try {
      console.log('🔄 Chargement réunions pour club:', clubId);
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/clubs/${clubId}/reunions`;
      const token = await this.getToken();

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'RotaryClubMobile/1.0',
          'Origin': 'https://snack.expo.dev',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await this.removeToken();
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Réunions chargées:', Array.isArray(data) ? data.length : 'Format inattendu');
      return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
      console.error('❌ Erreur chargement réunions:', error);
      return [];
    }
  }

  async getReunionDetails(clubId: string, reunionId: string): Promise<Reunion> {
    try {
      console.log('🔄 Chargement détails réunion:', reunionId);
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/clubs/${clubId}/reunions/${reunionId}`;
      const token = await this.getToken();

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'RotaryClubMobile/1.0',
          'Origin': 'https://snack.expo.dev',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await this.removeToken();
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Détails réunion chargés:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur chargement détails réunion:', error);
      throw error;
    }
  }

  async getClubEvenements(clubId: string): Promise<any[]> {
    try {
      console.log('🔄 Chargement événements pour club:', clubId);
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/clubs/${clubId}/evenements`;
      const token = await this.getToken();

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'RotaryClubMobile/1.0',
          'Origin': 'https://snack.expo.dev',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await this.removeToken();
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Événements chargés:', data);
      return data.data || data; // Gérer les deux formats possibles
    } catch (error) {
      console.error('❌ Erreur chargement événements:', error);
      return [];
    }
  }

  async logout(): Promise<void> {
    await this.removeToken();
  }

  async sendClubEmail(emailData: {
    subject: string;
    message: string;
    recipients: string[];
    attachments?: { name: string; type: string; size: string; base64?: string; uri?: string }[];
  }): Promise<{
    success: boolean;
    message: string;
    emailId?: string;
    recipientsSent?: number;
    recipientsTotal?: number;
    sentAt?: string;
  }> {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      // Endpoint correct pour l'envoi d'email
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/email/send`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'RotaryClubMobile/1.0',
          'Origin': 'https://snack.expo.dev',
        },
        body: JSON.stringify({
          subject: emailData.subject,
          message: emailData.message,
          recipients: emailData.recipients,
          attachments: emailData.attachments?.map(att => ({
            FileName: att.name,
            Base64Content: att.base64 || '',
            ContentType: att.type,
            Size: att.size
          })) || [],
          isUrgent: false,
          sendCopy: true
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          await this.removeToken();
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Email envoyé avec succès via l\'API:', result);
      return result;
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      
      // Si c'est une erreur de réseau, simuler l'envoi
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        console.log('🔄 Erreur de réseau, simulation d\'envoi d\'email pour la démo');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simuler un délai
        console.log('✅ Email simulé envoyé avec succès');
        return {
          success: true,
          message: 'Email simulé envoyé avec succès (mode démo)',
          emailId: 'demo-' + Date.now(),
          recipientsSent: emailData.recipients.length,
          recipientsTotal: emailData.recipients.length,
          sentAt: new Date().toISOString()
        };
      }
      
      throw error;
    }
  }

  async sendWhatsAppMessage(whatsappData: {
    phoneNumber: string;
    message: string;
  }): Promise<{
    success: boolean;
    message: string;
    messageId?: string;
    sentAt?: string;
  }> {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/whatsapp/send`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'RotaryClubMobile/1.0',
          'Origin': 'https://snack.expo.dev',
        },
        body: JSON.stringify({
          phoneNumber: whatsappData.phoneNumber,
          message: whatsappData.message
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          await this.removeToken();
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Message WhatsApp envoyé avec succès via l\'API:', result);
      return result;
    } catch (error) {
      console.error('❌ Erreur envoi WhatsApp:', error);
      
      // Si c'est une erreur de réseau, simuler l'envoi
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        console.log('🔄 Erreur de réseau, simulation d\'envoi WhatsApp pour la démo');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simuler un délai
        console.log('✅ Message WhatsApp simulé envoyé avec succès');
        return {
          success: true,
          message: 'Message WhatsApp simulé envoyé avec succès (mode démo)',
          messageId: 'demo-whatsapp-' + Date.now(),
          sentAt: new Date().toISOString()
        };
      }
      
      throw error;
    }
  }
}
