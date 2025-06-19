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
          const profile = await this.getCurrentUser();
          return profile;
        } catch (error) {
          return {
            id: 'user-id',
            email: loginData.email,
            firstName: 'Utilisateur',
            lastName: 'Connecté',
            fullName: 'Utilisateur Connecté',
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
    try {
      const response = await this.makeRequest<User>('/Auth/me');
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.log('Tentative avec getCurrentProfile...');
    }

    try {
      const response = await this.makeRequest<User>('/Auth/getCurrentProfile');
      if (response) {
        return response;
      }
    } catch (error) {
      console.log('getCurrentProfile échoué aussi');
    }

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
      throw error;
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
      return Array.isArray(data) ? data : data.data || data.members || [];
    } catch (error) {
      console.error('Erreur chargement membres:', error);
      throw error;
    }
  }

  async getClubReunions(clubId: string): Promise<Reunion[]> {
    try {
      const response = await this.makeRequest<Reunion[]>(`/clubs/${clubId}/reunions`);
      return response.data || [];
    } catch (error) {
      console.error('Erreur chargement réunions:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await this.removeToken();
  }
}
