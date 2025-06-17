/**
 * Sync Service - Rotary Club Mobile
 * Service synchronisation avec queue, conflict resolution et retry logic
 */

import NetInfo from '@react-native-community/netinfo';
import { databaseService } from './databaseService';
import { apiClient } from './apiClient';

// Types
export interface SyncAction {
  id?: number;
  action_type: 'CREATE' | 'UPDATE' | 'DELETE';
  table_name: string;
  record_id: string;
  data: any;
  priority: number;
  retry_count: number;
  created_at: string;
}

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  percentage: number;
  currentAction?: string;
}

export interface ConflictResolution {
  strategy: 'server_wins' | 'client_wins' | 'manual' | 'merge';
  serverData: any;
  clientData: any;
  resolvedData?: any;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  conflicts: ConflictResolution[];
  errors: string[];
}

// Constants
const SYNC_PRIORITIES = {
  CRITICAL: 1,    // Attendance, QR scans
  HIGH: 2,        // Member updates, reunion changes
  NORMAL: 3,      // Profile updates, settings
  LOW: 4,         // Notifications, cache
} as const;

const MAX_RETRY_COUNT = 3;
const RETRY_DELAYS = [1000, 5000, 15000]; // 1s, 5s, 15s
const BATCH_SIZE = 10;

class SyncService {
  private isOnline = false;
  private isSyncing = false;
  private syncProgress: SyncProgress = {
    total: 0,
    completed: 0,
    failed: 0,
    percentage: 0,
  };
  private listeners: Array<(progress: SyncProgress) => void> = [];
  private conflictListeners: Array<(conflicts: ConflictResolution[]) => void> = [];

  constructor() {
    this.initializeNetworkMonitoring();
  }

  /**
   * Initialiser le monitoring réseau
   */
  private initializeNetworkMonitoring(): void {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected === true;
      
      console.log(`📡 Network status: ${this.isOnline ? 'Online' : 'Offline'}`);
      
      // Démarrer la sync automatique si on vient de se reconnecter
      if (!wasOnline && this.isOnline) {
        setTimeout(() => {
          this.startBackgroundSync();
        }, 2000); // Délai pour stabiliser la connexion
      }
    });
  }

  /**
   * Ajouter une action à la queue de synchronisation
   */
  async queueAction(
    actionType: SyncAction['action_type'],
    tableName: string,
    recordId: string,
    data: any,
    priority: number = SYNC_PRIORITIES.NORMAL
  ): Promise<void> {
    try {
      await databaseService.insert('sync_queue', {
        action_type: actionType,
        table_name: tableName,
        record_id: recordId,
        data: JSON.stringify(data),
        priority,
        retry_count: 0,
        created_at: new Date().toISOString(),
      });

      console.log(`📤 Queued ${actionType} action for ${tableName}:${recordId}`);

      // Démarrer la sync si on est en ligne
      if (this.isOnline && !this.isSyncing) {
        setTimeout(() => this.startBackgroundSync(), 1000);
      }
    } catch (error) {
      console.error('Error queueing sync action:', error);
      throw error;
    }
  }

  /**
   * Démarrer la synchronisation en arrière-plan
   */
  async startBackgroundSync(): Promise<SyncResult> {
    if (this.isSyncing || !this.isOnline) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        conflicts: [],
        errors: ['Sync already in progress or offline'],
      };
    }

    try {
      this.isSyncing = true;
      console.log('🔄 Starting background sync...');

      // Obtenir les actions en attente
      const pendingActions = await this.getPendingActions();
      
      if (pendingActions.length === 0) {
        console.log('✅ No pending actions to sync');
        return {
          success: true,
          synced: 0,
          failed: 0,
          conflicts: [],
          errors: [],
        };
      }

      // Initialiser le progress
      this.syncProgress = {
        total: pendingActions.length,
        completed: 0,
        failed: 0,
        percentage: 0,
      };
      this.notifyProgressListeners();

      const result: SyncResult = {
        success: true,
        synced: 0,
        failed: 0,
        conflicts: [],
        errors: [],
      };

      // Traiter les actions par batch
      for (let i = 0; i < pendingActions.length; i += BATCH_SIZE) {
        const batch = pendingActions.slice(i, i + BATCH_SIZE);
        
        for (const action of batch) {
          try {
            this.syncProgress.currentAction = `${action.action_type} ${action.table_name}`;
            this.notifyProgressListeners();

            const actionResult = await this.processAction(action);
            
            if (actionResult.success) {
              await this.removeFromQueue(action.id!);
              result.synced++;
              this.syncProgress.completed++;
            } else {
              await this.handleActionFailure(action, actionResult.error);
              result.failed++;
              this.syncProgress.failed++;
              
              if (actionResult.conflict) {
                result.conflicts.push(actionResult.conflict);
              }
              
              if (actionResult.error) {
                result.errors.push(actionResult.error);
              }
            }
          } catch (error) {
            console.error(`Error processing action ${action.id}:`, error);
            result.failed++;
            this.syncProgress.failed++;
            result.errors.push(error instanceof Error ? error.message : 'Unknown error');
          }

          // Mettre à jour le pourcentage
          this.syncProgress.percentage = Math.round(
            ((this.syncProgress.completed + this.syncProgress.failed) / this.syncProgress.total) * 100
          );
          this.notifyProgressListeners();
        }

        // Pause entre les batches pour éviter de surcharger le serveur
        if (i + BATCH_SIZE < pendingActions.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Notifier les conflits s'il y en a
      if (result.conflicts.length > 0) {
        this.notifyConflictListeners(result.conflicts);
      }

      console.log(`✅ Sync completed: ${result.synced} synced, ${result.failed} failed`);
      return result;

    } catch (error) {
      console.error('❌ Background sync failed:', error);
      return {
        success: false,
        synced: 0,
        failed: 0,
        conflicts: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    } finally {
      this.isSyncing = false;
      this.syncProgress.currentAction = undefined;
      this.notifyProgressListeners();
    }
  }

  /**
   * Obtenir les actions en attente
   */
  private async getPendingActions(): Promise<SyncAction[]> {
    const actions = await databaseService.select(
      'sync_queue',
      '*',
      'retry_count < ?',
      [MAX_RETRY_COUNT],
      'priority ASC, created_at ASC'
    );

    return actions.map(action => ({
      ...action,
      data: JSON.parse(action.data),
    }));
  }

  /**
   * Traiter une action de synchronisation
   */
  private async processAction(action: SyncAction): Promise<{
    success: boolean;
    error?: string;
    conflict?: ConflictResolution;
  }> {
    try {
      switch (action.action_type) {
        case 'CREATE':
          return await this.syncCreate(action);
        case 'UPDATE':
          return await this.syncUpdate(action);
        case 'DELETE':
          return await this.syncDelete(action);
        default:
          return {
            success: false,
            error: `Unknown action type: ${action.action_type}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Synchroniser une création
   */
  private async syncCreate(action: SyncAction): Promise<{
    success: boolean;
    error?: string;
    conflict?: ConflictResolution;
  }> {
    try {
      const endpoint = this.getApiEndpoint(action.table_name);
      const response = await apiClient.post(endpoint, action.data);

      if (response.success) {
        // Mettre à jour l'ID local avec l'ID serveur si nécessaire
        if (response.data.id !== action.record_id) {
          await databaseService.update(
            action.table_name,
            { id: response.data.id, synced: 1 },
            'id = ?',
            [action.record_id]
          );
        } else {
          await databaseService.update(
            action.table_name,
            { synced: 1 },
            'id = ?',
            [action.record_id]
          );
        }

        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || 'Create failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Synchroniser une mise à jour
   */
  private async syncUpdate(action: SyncAction): Promise<{
    success: boolean;
    error?: string;
    conflict?: ConflictResolution;
  }> {
    try {
      const endpoint = `${this.getApiEndpoint(action.table_name)}/${action.record_id}`;
      
      // Vérifier s'il y a un conflit
      const serverData = await this.fetchServerData(action.table_name, action.record_id);
      
      if (serverData && this.hasConflict(action.data, serverData)) {
        const resolution = await this.resolveConflict(action.data, serverData, action.table_name);
        
        if (resolution.strategy === 'manual') {
          return {
            success: false,
            conflict: resolution,
          };
        }
        
        // Appliquer la résolution automatique
        const dataToSync = resolution.resolvedData || 
          (resolution.strategy === 'server_wins' ? serverData : action.data);
        
        const response = await apiClient.put(endpoint, dataToSync);
        
        if (response.success) {
          await databaseService.update(
            action.table_name,
            { ...dataToSync, synced: 1 },
            'id = ?',
            [action.record_id]
          );
          return { success: true };
        }
      } else {
        // Pas de conflit, sync normale
        const response = await apiClient.put(endpoint, action.data);
        
        if (response.success) {
          await databaseService.update(
            action.table_name,
            { synced: 1 },
            'id = ?',
            [action.record_id]
          );
          return { success: true };
        }
      }

      return {
        success: false,
        error: 'Update failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Synchroniser une suppression
   */
  private async syncDelete(action: SyncAction): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const endpoint = `${this.getApiEndpoint(action.table_name)}/${action.record_id}`;
      const response = await apiClient.delete(endpoint);

      if (response.success || response.status === 404) {
        // Succès ou déjà supprimé
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || 'Delete failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Obtenir l'endpoint API pour une table
   */
  private getApiEndpoint(tableName: string): string {
    const endpoints: Record<string, string> = {
      members: '/api/members',
      reunions: '/api/reunions',
      attendance: '/api/attendance',
      notifications_cache: '/api/notifications',
    };

    return endpoints[tableName] || `/api/${tableName}`;
  }

  /**
   * Récupérer les données du serveur
   */
  private async fetchServerData(tableName: string, recordId: string): Promise<any> {
    try {
      const endpoint = `${this.getApiEndpoint(tableName)}/${recordId}`;
      const response = await apiClient.get(endpoint);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error fetching server data:', error);
      return null;
    }
  }

  /**
   * Vérifier s'il y a un conflit
   */
  private hasConflict(clientData: any, serverData: any): boolean {
    // Comparer les timestamps de mise à jour
    const clientUpdated = new Date(clientData.updated_at || clientData.created_at);
    const serverUpdated = new Date(serverData.updated_at || serverData.created_at);
    
    // Il y a conflit si les données serveur sont plus récentes
    return serverUpdated > clientUpdated;
  }

  /**
   * Résoudre un conflit
   */
  private async resolveConflict(
    clientData: any,
    serverData: any,
    tableName: string
  ): Promise<ConflictResolution> {
    // Stratégies de résolution par table
    const strategies: Record<string, ConflictResolution['strategy']> = {
      members: 'manual',        // Données critiques
      reunions: 'server_wins',  // Données référentielles
      attendance: 'client_wins', // Données locales prioritaires
      app_settings: 'client_wins', // Préférences utilisateur
    };

    const strategy = strategies[tableName] || 'manual';

    const resolution: ConflictResolution = {
      strategy,
      serverData,
      clientData,
    };

    if (strategy === 'merge') {
      // Fusionner les données (logique spécifique par table)
      resolution.resolvedData = { ...serverData, ...clientData };
    }

    return resolution;
  }

  /**
   * Gérer l'échec d'une action
   */
  private async handleActionFailure(action: SyncAction, error?: string): Promise<void> {
    const newRetryCount = action.retry_count + 1;
    
    if (newRetryCount >= MAX_RETRY_COUNT) {
      console.error(`❌ Action ${action.id} failed permanently:`, error);
      // Marquer comme échoué définitivement
      await databaseService.update(
        'sync_queue',
        { retry_count: newRetryCount },
        'id = ?',
        [action.id!]
      );
    } else {
      // Programmer un retry avec délai exponentiel
      const delay = RETRY_DELAYS[newRetryCount - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
      
      setTimeout(async () => {
        await databaseService.update(
          'sync_queue',
          { retry_count: newRetryCount },
          'id = ?',
          [action.id!]
        );
      }, delay);
      
      console.log(`🔄 Scheduling retry ${newRetryCount} for action ${action.id} in ${delay}ms`);
    }
  }

  /**
   * Supprimer une action de la queue
   */
  private async removeFromQueue(actionId: number): Promise<void> {
    await databaseService.delete('sync_queue', 'id = ?', [actionId]);
  }

  /**
   * Obtenir le statut de synchronisation
   */
  getSyncStatus(): {
    isOnline: boolean;
    isSyncing: boolean;
    progress: SyncProgress;
  } {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      progress: this.syncProgress,
    };
  }

  /**
   * Obtenir le nombre d'actions en attente
   */
  async getPendingCount(): Promise<number> {
    return await databaseService.count(
      'sync_queue',
      'retry_count < ?',
      [MAX_RETRY_COUNT]
    );
  }

  /**
   * Forcer la synchronisation manuelle
   */
  async forcSync(): Promise<SyncResult> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }
    
    return await this.startBackgroundSync();
  }

  /**
   * Ajouter un listener de progress
   */
  addProgressListener(listener: (progress: SyncProgress) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Supprimer un listener de progress
   */
  removeProgressListener(listener: (progress: SyncProgress) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Ajouter un listener de conflits
   */
  addConflictListener(listener: (conflicts: ConflictResolution[]) => void): void {
    this.conflictListeners.push(listener);
  }

  /**
   * Supprimer un listener de conflits
   */
  removeConflictListener(listener: (conflicts: ConflictResolution[]) => void): void {
    const index = this.conflictListeners.indexOf(listener);
    if (index > -1) {
      this.conflictListeners.splice(index, 1);
    }
  }

  /**
   * Notifier les listeners de progress
   */
  private notifyProgressListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.syncProgress);
      } catch (error) {
        console.error('Error in progress listener:', error);
      }
    });
  }

  /**
   * Notifier les listeners de conflits
   */
  private notifyConflictListeners(conflicts: ConflictResolution[]): void {
    this.conflictListeners.forEach(listener => {
      try {
        listener(conflicts);
      } catch (error) {
        console.error('Error in conflict listener:', error);
      }
    });
  }

  /**
   * Nettoyer les actions anciennes
   */
  async cleanup(): Promise<void> {
    await databaseService.delete(
      'sync_queue',
      'created_at < datetime("now", "-7 days") AND retry_count >= ?',
      [MAX_RETRY_COUNT]
    );
  }
}

// Instance singleton
export const syncService = new SyncService();

export default syncService;
