/**
 * Auth Service - Rotary Club Mobile
 * Service authentification avec JWT, biométrie et storage sécurisé
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import CryptoJS from 'crypto-js';
import { apiService } from './apiService';
import type { User, LoginForm, ApiResponse } from '../types';

// Configuration depuis .env
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'rotary_club_mobile_secret_key_2024';
const BIOMETRIC_PROMPT_TITLE = process.env.BIOMETRIC_PROMPT_TITLE || 'Authentification Rotary';
const BIOMETRIC_PROMPT_SUBTITLE = process.env.BIOMETRIC_PROMPT_SUBTITLE || 'Utilisez votre empreinte ou reconnaissance faciale';

// Clés de stockage
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  LAST_LOGIN: 'last_login',
} as const;

// Types pour les réponses d'authentification
interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

interface BiometricConfig {
  title: string;
  subtitle: string;
  description?: string;
  fallbackLabel?: string;
  negativeText?: string;
}

class AuthService {
  /**
   * Connexion avec email/password
   */
  async loginAsync(credentials: LoginForm): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', {
        email: credentials.email.toLowerCase().trim(),
        password: credentials.password,
        deviceInfo: await this.getDeviceInfo(),
      });

      if (response.success && response.data) {
        // Stocker les tokens de manière sécurisée
        await this.storeTokens(response.data.token, response.data.refreshToken);
        
        // Stocker les données utilisateur
        await this.storeUserData(response.data.user);
        
        // Enregistrer la date de dernière connexion
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_LOGIN, new Date().toISOString());

        if (__DEV__) {
          console.log('✅ Login successful for:', credentials.email);
        }
      }

      return response;
    } catch (error) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de connexion',
        timestamp: new Date().toISOString(),
        requestId: 'auth_login_error',
      };
    }
  }

  /**
   * Déconnexion
   */
  async logoutAsync(): Promise<ApiResponse<boolean>> {
    try {
      // Notifier le serveur de la déconnexion
      const token = await this.getStoredToken();
      if (token) {
        await apiService.post('/auth/logout', { token });
      }

      // Nettoyer le stockage local
      await this.clearStoredData();

      if (__DEV__) {
        console.log('✅ Logout successful');
      }

      return {
        success: true,
        data: true,
        timestamp: new Date().toISOString(),
        requestId: 'auth_logout_success',
      };
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // Même en cas d'erreur, nettoyer localement
      await this.clearStoredData();
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de déconnexion',
        timestamp: new Date().toISOString(),
        requestId: 'auth_logout_error',
      };
    }
  }

  /**
   * Rafraîchir le token
   */
  async refreshTokenAsync(): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    try {
      const refreshToken = await this.getStoredRefreshToken();
      
      if (!refreshToken) {
        throw new Error('Aucun refresh token disponible');
      }

      const response = await apiService.post<{ token: string; refreshToken: string }>('/auth/refresh', {
        refreshToken,
        deviceInfo: await this.getDeviceInfo(),
      });

      if (response.success && response.data) {
        // Stocker les nouveaux tokens
        await this.storeTokens(response.data.token, response.data.refreshToken);
        
        if (__DEV__) {
          console.log('✅ Token refresh successful');
        }
      }

      return response;
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de rafraîchissement',
        timestamp: new Date().toISOString(),
        requestId: 'auth_refresh_error',
      };
    }
  }

  /**
   * Configuration de la biométrie
   */
  async setupBiometricAsync(enable: boolean): Promise<ApiResponse<boolean>> {
    try {
      if (enable) {
        // Vérifier la disponibilité de la biométrie
        const biometryType = await Keychain.getSupportedBiometryType();
        
        if (!biometryType) {
          throw new Error('Biométrie non disponible sur cet appareil');
        }

        // Tester l'authentification biométrique
        const credentials = await this.authenticateWithBiometric();
        if (!credentials) {
          throw new Error('Échec de l\'authentification biométrique');
        }
      }

      // Sauvegarder la préférence
      await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, enable.toString());

      if (__DEV__) {
        console.log(`✅ Biometric ${enable ? 'enabled' : 'disabled'}`);
      }

      return {
        success: true,
        data: enable,
        timestamp: new Date().toISOString(),
        requestId: 'auth_biometric_setup',
      };
    } catch (error) {
      console.error('❌ Biometric setup error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de configuration biométrique',
        timestamp: new Date().toISOString(),
        requestId: 'auth_biometric_error',
      };
    }
  }

  /**
   * Authentification avec biométrie
   */
  async authenticateWithBiometricAsync(): Promise<ApiResponse<boolean>> {
    try {
      const isBiometricEnabled = await this.isBiometricEnabled();
      
      if (!isBiometricEnabled) {
        throw new Error('Biométrie non activée');
      }

      const credentials = await this.authenticateWithBiometric();
      
      if (!credentials) {
        throw new Error('Authentification biométrique échouée');
      }

      return {
        success: true,
        data: true,
        timestamp: new Date().toISOString(),
        requestId: 'auth_biometric_success',
      };
    } catch (error) {
      console.error('❌ Biometric auth error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur d\'authentification biométrique',
        timestamp: new Date().toISOString(),
        requestId: 'auth_biometric_auth_error',
      };
    }
  }

  /**
   * Vérifier si la biométrie est activée
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking biometric status:', error);
      return false;
    }
  }

  /**
   * Obtenir le token stocké
   */
  async getStoredToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getInternetCredentials(STORAGE_KEYS.AUTH_TOKEN);
      if (credentials && credentials.password) {
        return this.decrypt(credentials.password);
      }
      return null;
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  /**
   * Obtenir le refresh token stocké
   */
  async getStoredRefreshToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getInternetCredentials(STORAGE_KEYS.REFRESH_TOKEN);
      if (credentials && credentials.password) {
        return this.decrypt(credentials.password);
      }
      return null;
    } catch (error) {
      console.error('Error getting stored refresh token:', error);
      return null;
    }
  }

  /**
   * Obtenir les données utilisateur stockées
   */
  async getStoredUserData(): Promise<User | null> {
    try {
      const encryptedData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (encryptedData) {
        const decryptedData = this.decrypt(encryptedData);
        return JSON.parse(decryptedData);
      }
      return null;
    } catch (error) {
      console.error('Error getting stored user data:', error);
      return null;
    }
  }

  /**
   * Stocker les tokens de manière sécurisée
   */
  private async storeTokens(token: string, refreshToken: string): Promise<void> {
    try {
      // Stocker le token principal dans le Keychain
      await Keychain.setInternetCredentials(
        STORAGE_KEYS.AUTH_TOKEN,
        'token',
        this.encrypt(token)
      );

      // Stocker le refresh token dans le Keychain
      await Keychain.setInternetCredentials(
        STORAGE_KEYS.REFRESH_TOKEN,
        'refreshToken',
        this.encrypt(refreshToken)
      );
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw error;
    }
  }

  /**
   * Stocker les données utilisateur
   */
  private async storeUserData(user: User): Promise<void> {
    try {
      const encryptedData = this.encrypt(JSON.stringify(user));
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, encryptedData);
    } catch (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
  }

  /**
   * Nettoyer toutes les données stockées
   */
  private async clearStoredData(): Promise<void> {
    try {
      // Supprimer du Keychain
      await Keychain.resetInternetCredentials(STORAGE_KEYS.AUTH_TOKEN);
      await Keychain.resetInternetCredentials(STORAGE_KEYS.REFRESH_TOKEN);

      // Supprimer d'AsyncStorage
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.LAST_LOGIN,
      ]);
    } catch (error) {
      console.error('Error clearing stored data:', error);
    }
  }

  /**
   * Authentification biométrique avec Keychain
   */
  private async authenticateWithBiometric(): Promise<Keychain.UserCredentials | false> {
    try {
      const config: BiometricConfig = {
        title: BIOMETRIC_PROMPT_TITLE,
        subtitle: BIOMETRIC_PROMPT_SUBTITLE,
        description: 'Authentifiez-vous pour accéder à votre compte Rotary',
        fallbackLabel: 'Utiliser le mot de passe',
        negativeText: 'Annuler',
      };

      const credentials = await Keychain.getInternetCredentials(
        STORAGE_KEYS.AUTH_TOKEN,
        {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
          authenticatePrompt: config.title,
        }
      );

      return credentials || false;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  }

  /**
   * Chiffrer une chaîne
   */
  private encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  }

  /**
   * Déchiffrer une chaîne
   */
  private decrypt(encryptedText: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Obtenir les informations de l'appareil
   */
  private async getDeviceInfo(): Promise<object> {
    // Ici on pourrait utiliser react-native-device-info
    return {
      platform: 'android',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}

// Instance singleton
export const authService = new AuthService();
export default authService;
