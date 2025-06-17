/**
 * Network Service - Rotary Club Mobile
 * Service réseau avec monitoring offline et queue management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { apiService } from './apiService';

// Configuration depuis .env
const OFFLINE_QUEUE_SIZE = parseInt(process.env.OFFLINE_QUEUE_SIZE || '100', 10);

// Types pour la queue offline
interface QueuedRequest {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  data?: any;
  priority: 'urgent' | 'normal' | 'low';
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface NetworkStatus {
  isConnected: boolean;
  type: string;
  isInternetReachable: boolean;
  bandwidth?: number;
  quality: 'excellent' | 'good' | 'poor' | 'offline';
}

// Clés de stockage
const STORAGE_KEYS = {
  OFFLINE_QUEUE: 'offline_queue',
  NETWORK_STATS: 'network_stats',
  LAST_SYNC: 'last_sync',
} as const;

class NetworkService {
  private isOnline: boolean = true;
  private networkStatus: NetworkStatus = {
    isConnected: true,
    type: 'unknown',
    isInternetReachable: true,
    quality: 'good',
  };
  private offlineQueue: QueuedRequest[] = [];
  private listeners: Array<(status: NetworkStatus) => void> = [];
  private syncInProgress: boolean = false;

  constructor() {
    this.initializeNetworkMonitoring();
    this.loadOfflineQueue();
  }

  /**
   * Initialiser le monitoring réseau
   */
  private async initializeNetworkMonitoring(): Promise<void> {
    try {
      // État initial du réseau
      const state = await NetInfo.fetch();
      this.updateNetworkStatus(state);

      // Écouter les changements de réseau
      NetInfo.addEventListener(this.handleNetworkChange.bind(this));

      if (__DEV__) {
        console.log('🌐 Network monitoring initialized');
      }
    } catch (error) {
      console.error('❌ Network monitoring initialization error:', error);
    }
  }

  /**
   * Gérer les changements de réseau
   */
  private handleNetworkChange(state: NetInfoState): void {
    const wasOnline = this.isOnline;
    this.updateNetworkStatus(state);

    // Si on revient en ligne, traiter la queue offline
    if (!wasOnline && this.isOnline && this.offlineQueue.length > 0) {
      this.processOfflineQueue();
    }

    // Notifier les listeners
    this.notifyListeners();

    if (__DEV__) {
      console.log('🌐 Network status changed:', this.networkStatus);
    }
  }

  /**
   * Mettre à jour le statut réseau
   */
  private updateNetworkStatus(state: NetInfoState): void {
    this.isOnline = state.isConnected === true && state.isInternetReachable === true;
    
    this.networkStatus = {
      isConnected: state.isConnected === true,
      type: state.type || 'unknown',
      isInternetReachable: state.isInternetReachable === true,
      bandwidth: this.estimateBandwidth(state),
      quality: this.determineQuality(state),
    };
  }

  /**
   * Estimer la bande passante
   */
  private estimateBandwidth(state: NetInfoState): number | undefined {
    // Estimation basée sur le type de connexion
    switch (state.type) {
      case 'wifi':
        return 50; // Mbps estimé
      case 'cellular':
        if (state.details && 'cellularGeneration' in state.details) {
          switch (state.details.cellularGeneration) {
            case '5g': return 100;
            case '4g': return 25;
            case '3g': return 5;
            case '2g': return 0.5;
            default: return 10;
          }
        }
        return 10;
      default:
        return undefined;
    }
  }

  /**
   * Déterminer la qualité de connexion
   */
  private determineQuality(state: NetInfoState): 'excellent' | 'good' | 'poor' | 'offline' {
    if (!state.isConnected || !state.isInternetReachable) {
      return 'offline';
    }

    const bandwidth = this.estimateBandwidth(state) || 0;
    
    if (bandwidth >= 50) return 'excellent';
    if (bandwidth >= 10) return 'good';
    if (bandwidth >= 1) return 'poor';
    return 'offline';
  }

  /**
   * Ajouter une requête à la queue offline
   */
  async addToOfflineQueue(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    priority: 'urgent' | 'normal' | 'low' = 'normal'
  ): Promise<string> {
    const request: QueuedRequest = {
      id: this.generateRequestId(),
      method,
      endpoint,
      data,
      priority,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3,
    };

    // Ajouter à la queue avec priorité
    this.offlineQueue.push(request);
    this.sortQueueByPriority();

    // Limiter la taille de la queue
    if (this.offlineQueue.length > OFFLINE_QUEUE_SIZE) {
      this.offlineQueue = this.offlineQueue.slice(0, OFFLINE_QUEUE_SIZE);
    }

    // Sauvegarder la queue
    await this.saveOfflineQueue();

    if (__DEV__) {
      console.log('📦 Request added to offline queue:', request.id);
    }

    return request.id;
  }

  /**
   * Traiter la queue offline
   */
  private async processOfflineQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline || this.offlineQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;

    if (__DEV__) {
      console.log('🔄 Processing offline queue:', this.offlineQueue.length, 'requests');
    }

    const processedRequests: string[] = [];
    const failedRequests: QueuedRequest[] = [];

    for (const request of this.offlineQueue) {
      try {
        await this.executeQueuedRequest(request);
        processedRequests.push(request.id);
        
        if (__DEV__) {
          console.log('✅ Offline request processed:', request.id);
        }
      } catch (error) {
        request.retryCount++;
        
        if (request.retryCount >= request.maxRetries) {
          processedRequests.push(request.id);
          console.error('❌ Offline request failed permanently:', request.id, error);
        } else {
          failedRequests.push(request);
          console.warn('⚠️ Offline request failed, will retry:', request.id, error);
        }
      }

      // Pause entre les requêtes pour éviter de surcharger le serveur
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Mettre à jour la queue
    this.offlineQueue = failedRequests;
    await this.saveOfflineQueue();

    // Enregistrer la dernière sync
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());

    this.syncInProgress = false;

    if (__DEV__) {
      console.log('🔄 Offline queue processed. Remaining:', this.offlineQueue.length);
    }
  }

  /**
   * Exécuter une requête de la queue
   */
  private async executeQueuedRequest(request: QueuedRequest): Promise<any> {
    switch (request.method) {
      case 'GET':
        return await apiService.get(request.endpoint, request.data);
      case 'POST':
        return await apiService.post(request.endpoint, request.data);
      case 'PUT':
        return await apiService.put(request.endpoint, request.data);
      case 'DELETE':
        return await apiService.delete(request.endpoint);
      default:
        throw new Error(`Unsupported method: ${request.method}`);
    }
  }

  /**
   * Trier la queue par priorité
   */
  private sortQueueByPriority(): void {
    const priorityOrder = { urgent: 0, normal: 1, low: 2 };
    
    this.offlineQueue.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Si même priorité, trier par timestamp
      return a.timestamp - b.timestamp;
    });
  }

  /**
   * Charger la queue offline depuis le stockage
   */
  private async loadOfflineQueue(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      if (queueData) {
        this.offlineQueue = JSON.parse(queueData);
        
        if (__DEV__) {
          console.log('📦 Loaded offline queue:', this.offlineQueue.length, 'requests');
        }
      }
    } catch (error) {
      console.error('❌ Error loading offline queue:', error);
      this.offlineQueue = [];
    }
  }

  /**
   * Sauvegarder la queue offline
   */
  private async saveOfflineQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('❌ Error saving offline queue:', error);
    }
  }

  /**
   * Générer un ID unique pour la requête
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Notifier les listeners des changements de réseau
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.networkStatus);
      } catch (error) {
        console.error('❌ Error notifying network listener:', error);
      }
    });
  }

  // ===== API PUBLIQUE =====

  /**
   * Obtenir le statut réseau actuel
   */
  getNetworkStatus(): NetworkStatus {
    return { ...this.networkStatus };
  }

  /**
   * Vérifier si on est en ligne
   */
  isOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Ajouter un listener pour les changements de réseau
   */
  addNetworkListener(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.push(listener);
    
    // Retourner une fonction pour supprimer le listener
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Forcer la synchronisation de la queue offline
   */
  async forceSyncOfflineQueue(): Promise<void> {
    if (this.isOnline) {
      await this.processOfflineQueue();
    }
  }

  /**
   * Obtenir les statistiques de la queue offline
   */
  getOfflineQueueStats(): {
    total: number;
    byPriority: Record<'urgent' | 'normal' | 'low', number>;
    oldestRequest?: number;
  } {
    const stats = {
      total: this.offlineQueue.length,
      byPriority: { urgent: 0, normal: 0, low: 0 },
      oldestRequest: undefined as number | undefined,
    };

    this.offlineQueue.forEach(request => {
      stats.byPriority[request.priority]++;
      
      if (!stats.oldestRequest || request.timestamp < stats.oldestRequest) {
        stats.oldestRequest = request.timestamp;
      }
    });

    return stats;
  }

  /**
   * Vider la queue offline
   */
  async clearOfflineQueue(): Promise<void> {
    this.offlineQueue = [];
    await this.saveOfflineQueue();
    
    if (__DEV__) {
      console.log('🗑️ Offline queue cleared');
    }
  }

  /**
   * Tester la connectivité réseau
   */
  async testConnectivity(): Promise<{
    isConnected: boolean;
    latency?: number;
    error?: string;
  }> {
    try {
      const startTime = Date.now();
      
      // Test simple avec une requête ping
      const response = await apiService.get('/ping');
      
      const latency = Date.now() - startTime;
      
      return {
        isConnected: response.success,
        latency,
      };
    } catch (error) {
      return {
        isConnected: false,
        error: error instanceof Error ? error.message : 'Network test failed',
      };
    }
  }
}

// Instance singleton
export const networkService = new NetworkService();
export default networkService;
