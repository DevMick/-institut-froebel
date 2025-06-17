/**
 * API Service - Rotary Club Mobile
 * Service API principal avec Axios, interceptors, retry logic et token management
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { store } from '../store';
import { refreshTokenAsync, resetAuth } from '../store/slices/authSlice';
import type { ApiResponse } from '../types';

// Configuration depuis .env
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.rotaryclub.local/v1';
const API_TIMEOUT = parseInt(process.env.API_TIMEOUT || '30000', 10);
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || '3', 10);
const REQUEST_DELAY = parseInt(process.env.REQUEST_DELAY || '1000', 10);

// Interface pour les requêtes avec retry
interface RetryConfig {
  retries?: number;
  retryDelay?: number;
  retryCondition?: (error: AxiosError) => boolean;
}

// Interface pour le cache des requêtes
interface RequestCache {
  [key: string]: {
    data: any;
    timestamp: number;
    ttl: number;
  };
}

class ApiService {
  private axiosInstance: AxiosInstance;
  private requestCache: RequestCache = {};
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private cancelTokens: Map<string, AbortController> = new Map();

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-App-Version': '1.0.0',
        'X-Platform': 'react-native',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Configuration des interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Ajouter le token d'authentification
        const token = await this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Logging en développement
        if (__DEV__ && process.env.DEBUG_API === 'true') {
          console.log('🚀 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            data: config.data,
            headers: config.headers,
          });
        }

        // Ajouter timestamp et request ID
        config.headers['X-Request-ID'] = this.generateRequestId();
        config.headers['X-Request-Timestamp'] = new Date().toISOString();

        return config;
      },
      (error) => {
        if (__DEV__) {
          console.error('❌ Request Error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Logging en développement
        if (__DEV__ && process.env.DEBUG_API === 'true') {
          console.log('✅ API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data,
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Logging des erreurs
        if (__DEV__) {
          console.error('❌ API Error:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message,
            data: error.response?.data,
          });
        }

        // Gestion du token expiré (401)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Tenter de rafraîchir le token
            await store.dispatch(refreshTokenAsync()).unwrap();
            
            // Retry la requête originale avec le nouveau token
            const newToken = await this.getAuthToken();
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // Échec du refresh, déconnecter l'utilisateur
            store.dispatch(resetAuth());
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Obtenir le token d'authentification
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      const state = store.getState();
      return state.auth.token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Générer un ID unique pour la requête
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Créer une clé de cache pour la requête
   */
  private getCacheKey(method: string, url: string, params?: any): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${method}_${url}_${paramsStr}`;
  }

  /**
   * Vérifier si une réponse est en cache et valide
   */
  private getCachedResponse(cacheKey: string): any | null {
    const cached = this.requestCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    return null;
  }

  /**
   * Mettre en cache une réponse
   */
  private setCachedResponse(cacheKey: string, data: any, ttl: number = 300000): void {
    this.requestCache[cacheKey] = {
      data,
      timestamp: Date.now(),
      ttl,
    };
  }

  /**
   * Retry logic avec backoff exponentiel
   */
  private async retryRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    config: RetryConfig = {}
  ): Promise<AxiosResponse<T>> {
    const { retries = MAX_RETRIES, retryDelay = REQUEST_DELAY, retryCondition } = config;
    
    let lastError: AxiosError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as AxiosError;
        
        // Vérifier si on doit retry
        if (attempt === retries || (retryCondition && !retryCondition(lastError))) {
          throw lastError;
        }
        
        // Attendre avant le prochain essai (backoff exponentiel)
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  /**
   * Méthode GET avec cache et retry
   */
  async get<T>(
    endpoint: string,
    params?: any,
    config?: { cache?: boolean; cacheTtl?: number; retries?: number }
  ): Promise<ApiResponse<T>> {
    try {
      const cacheKey = this.getCacheKey('GET', endpoint, params);
      
      // Vérifier le cache si activé
      if (config?.cache) {
        const cachedResponse = this.getCachedResponse(cacheKey);
        if (cachedResponse) {
          return {
            success: true,
            data: cachedResponse,
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
          };
        }
      }

      // Éviter les requêtes en double
      if (this.pendingRequests.has(cacheKey)) {
        return await this.pendingRequests.get(cacheKey);
      }

      const requestPromise = this.retryRequest(
        () => this.axiosInstance.get<T>(endpoint, { params }),
        { retries: config?.retries }
      );

      this.pendingRequests.set(cacheKey, requestPromise);

      const response = await requestPromise;
      this.pendingRequests.delete(cacheKey);

      // Mettre en cache si activé
      if (config?.cache) {
        this.setCachedResponse(cacheKey, response.data, config.cacheTtl);
      }

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.response?.data?.message || axiosError.message || 'Network error',
        code: axiosError.response?.data?.code || 'NETWORK_ERROR',
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
      };
    }
  }

  /**
   * Méthode POST
   */
  async post<T>(
    endpoint: string,
    data?: any,
    config?: { retries?: number }
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.retryRequest(
        () => this.axiosInstance.post<T>(endpoint, data),
        { retries: config?.retries }
      );

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.response?.data?.message || axiosError.message || 'Network error',
        code: axiosError.response?.data?.code || 'NETWORK_ERROR',
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
      };
    }
  }

  /**
   * Méthode PUT
   */
  async put<T>(
    endpoint: string,
    data?: any,
    config?: { retries?: number }
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.retryRequest(
        () => this.axiosInstance.put<T>(endpoint, data),
        { retries: config?.retries }
      );

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.response?.data?.message || axiosError.message || 'Network error',
        code: axiosError.response?.data?.code || 'NETWORK_ERROR',
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
      };
    }
  }

  /**
   * Méthode DELETE
   */
  async delete<T>(
    endpoint: string,
    config?: { retries?: number }
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.retryRequest(
        () => this.axiosInstance.delete<T>(endpoint),
        { retries: config?.retries }
      );

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.response?.data?.message || axiosError.message || 'Network error',
        code: axiosError.response?.data?.code || 'NETWORK_ERROR',
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
      };
    }
  }

  /**
   * Annuler une requête
   */
  cancelRequest(requestId: string): void {
    const controller = this.cancelTokens.get(requestId);
    if (controller) {
      controller.abort();
      this.cancelTokens.delete(requestId);
    }
  }

  /**
   * Vider le cache
   */
  clearCache(): void {
    this.requestCache = {};
  }

  /**
   * Obtenir les statistiques du cache
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: Object.keys(this.requestCache).length,
      keys: Object.keys(this.requestCache),
    };
  }
}

// Instance singleton
export const apiService = new ApiService();
export default apiService;
