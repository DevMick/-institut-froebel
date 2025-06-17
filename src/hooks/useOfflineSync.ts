/**
 * useOfflineSync Hook - Rotary Club Mobile
 * Hook monitoring réseau, sync progress et conflict resolution UI
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { syncService, SyncProgress, ConflictResolution, SyncResult } from '../services/syncService';
import { databaseService } from '../services/databaseService';

export interface OfflineSyncState {
  isOnline: boolean;
  isSyncing: boolean;
  progress: SyncProgress;
  pendingCount: number;
  lastSyncTime: Date | null;
  conflicts: ConflictResolution[];
  errors: string[];
}

export interface OfflineSyncActions {
  forceSync: () => Promise<SyncResult>;
  resolveConflict: (conflict: ConflictResolution, resolution: any) => Promise<void>;
  dismissError: (index: number) => void;
  clearAllErrors: () => void;
  retryFailedActions: () => Promise<void>;
}

export const useOfflineSync = () => {
  const [state, setState] = useState<OfflineSyncState>({
    isOnline: false,
    isSyncing: false,
    progress: {
      total: 0,
      completed: 0,
      failed: 0,
      percentage: 0,
    },
    pendingCount: 0,
    lastSyncTime: null,
    conflicts: [],
    errors: [],
  });

  const appStateRef = useRef<AppStateStatus>('active');
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialisation
  useEffect(() => {
    initializeSync();
    setupAppStateListener();
    
    return () => {
      cleanup();
    };
  }, []);

  // Monitoring réseau
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(netState => {
      const isOnline = netState.isConnected === true;
      
      setState(prev => ({
        ...prev,
        isOnline,
      }));

      // Auto-sync quand on revient en ligne
      if (isOnline && !state.isOnline) {
        scheduleAutoSync();
      }
    });

    return unsubscribe;
  }, [state.isOnline]);

  // Listeners de synchronisation
  useEffect(() => {
    const progressListener = (progress: SyncProgress) => {
      setState(prev => ({
        ...prev,
        progress,
        isSyncing: progress.total > 0 && progress.completed + progress.failed < progress.total,
      }));

      // Mettre à jour le temps de dernière sync quand terminé
      if (progress.total > 0 && progress.completed + progress.failed >= progress.total) {
        setState(prev => ({
          ...prev,
          lastSyncTime: new Date(),
          isSyncing: false,
        }));
        
        // Mettre à jour le nombre d'actions en attente
        updatePendingCount();
      }
    };

    const conflictListener = (conflicts: ConflictResolution[]) => {
      setState(prev => ({
        ...prev,
        conflicts: [...prev.conflicts, ...conflicts],
      }));

      // Notifier l'utilisateur des conflits
      if (conflicts.length > 0) {
        showConflictNotification(conflicts.length);
      }
    };

    syncService.addProgressListener(progressListener);
    syncService.addConflictListener(conflictListener);

    return () => {
      syncService.removeProgressListener(progressListener);
      syncService.removeConflictListener(conflictListener);
    };
  }, []);

  /**
   * Initialiser la synchronisation
   */
  const initializeSync = async () => {
    try {
      // Obtenir le statut initial
      const syncStatus = syncService.getSyncStatus();
      const pendingCount = await syncService.getPendingCount();
      
      setState(prev => ({
        ...prev,
        isOnline: syncStatus.isOnline,
        isSyncing: syncStatus.isSyncing,
        progress: syncStatus.progress,
        pendingCount,
      }));

      // Récupérer le temps de dernière sync depuis les paramètres
      const lastSyncSetting = await databaseService.select(
        'app_settings',
        'value',
        'key = ?',
        ['last_sync_time']
      );
      
      if (lastSyncSetting.length > 0) {
        setState(prev => ({
          ...prev,
          lastSyncTime: new Date(lastSyncSetting[0].value),
        }));
      }
    } catch (error) {
      console.error('Error initializing sync:', error);
    }
  };

  /**
   * Configurer le listener d'état de l'app
   */
  const setupAppStateListener = () => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // Sync quand l'app revient au premier plan
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        if (state.isOnline && state.pendingCount > 0) {
          scheduleAutoSync();
        }
      }
      
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  };

  /**
   * Programmer une synchronisation automatique
   */
  const scheduleAutoSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      if (state.isOnline && !state.isSyncing) {
        try {
          await syncService.startBackgroundSync();
        } catch (error) {
          console.error('Auto-sync failed:', error);
          addError('Synchronisation automatique échouée');
        }
      }
    }, 2000); // Délai de 2 secondes
  }, [state.isOnline, state.isSyncing]);

  /**
   * Mettre à jour le nombre d'actions en attente
   */
  const updatePendingCount = useCallback(async () => {
    try {
      const count = await syncService.getPendingCount();
      setState(prev => ({
        ...prev,
        pendingCount: count,
      }));
    } catch (error) {
      console.error('Error updating pending count:', error);
    }
  }, []);

  /**
   * Forcer la synchronisation manuelle
   */
  const forceSync = useCallback(async (): Promise<SyncResult> => {
    if (!state.isOnline) {
      throw new Error('Impossible de synchroniser hors ligne');
    }

    try {
      setState(prev => ({
        ...prev,
        isSyncing: true,
        errors: [], // Effacer les erreurs précédentes
      }));

      const result = await syncService.forcSync();
      
      // Sauvegarder le temps de sync
      await databaseService.insert('app_settings', {
        key: 'last_sync_time',
        value: new Date().toISOString(),
      });

      // Ajouter les erreurs s'il y en a
      if (result.errors.length > 0) {
        setState(prev => ({
          ...prev,
          errors: result.errors,
        }));
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de synchronisation';
      addError(errorMessage);
      throw error;
    }
  }, [state.isOnline]);

  /**
   * Résoudre un conflit
   */
  const resolveConflict = useCallback(async (
    conflict: ConflictResolution,
    resolution: any
  ): Promise<void> => {
    try {
      // TODO: Implémenter la résolution de conflit
      // Mettre à jour les données locales avec la résolution
      // Supprimer le conflit de la liste
      
      setState(prev => ({
        ...prev,
        conflicts: prev.conflicts.filter(c => c !== conflict),
      }));

      console.log('Conflict resolved:', { conflict, resolution });
    } catch (error) {
      console.error('Error resolving conflict:', error);
      addError('Erreur lors de la résolution du conflit');
    }
  }, []);

  /**
   * Supprimer une erreur
   */
  const dismissError = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      errors: prev.errors.filter((_, i) => i !== index),
    }));
  }, []);

  /**
   * Effacer toutes les erreurs
   */
  const clearAllErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: [],
    }));
  }, []);

  /**
   * Réessayer les actions échouées
   */
  const retryFailedActions = useCallback(async (): Promise<void> => {
    try {
      // Réinitialiser le retry_count des actions échouées
      await databaseService.executeSql(
        'UPDATE sync_queue SET retry_count = 0 WHERE retry_count >= 3'
      );
      
      // Mettre à jour le nombre d'actions en attente
      await updatePendingCount();
      
      // Démarrer la sync si en ligne
      if (state.isOnline) {
        await forceSync();
      }
    } catch (error) {
      console.error('Error retrying failed actions:', error);
      addError('Erreur lors de la reprise des actions échouées');
    }
  }, [state.isOnline, forceSync, updatePendingCount]);

  /**
   * Ajouter une erreur
   */
  const addError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      errors: [...prev.errors, error],
    }));
  }, []);

  /**
   * Afficher une notification de conflit
   */
  const showConflictNotification = (count: number) => {
    Alert.alert(
      'Conflits de synchronisation',
      `${count} conflit(s) détecté(s). Veuillez les résoudre manuellement.`,
      [
        { text: 'Plus tard', style: 'cancel' },
        { text: 'Résoudre', onPress: () => {
          // TODO: Naviguer vers l'écran de résolution de conflits
          console.log('Navigate to conflict resolution');
        }},
      ]
    );
  };

  /**
   * Nettoyer les ressources
   */
  const cleanup = () => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
  };

  /**
   * Obtenir le statut de connexion formaté
   */
  const getConnectionStatus = useCallback((): string => {
    if (state.isSyncing) return 'Synchronisation...';
    if (!state.isOnline) return 'Hors ligne';
    if (state.pendingCount > 0) return `${state.pendingCount} action(s) en attente`;
    return 'Synchronisé';
  }, [state.isOnline, state.isSyncing, state.pendingCount]);

  /**
   * Obtenir la couleur du statut
   */
  const getStatusColor = useCallback((): string => {
    if (state.isSyncing) return '#FFA500'; // Orange
    if (!state.isOnline) return '#FF0000'; // Rouge
    if (state.pendingCount > 0) return '#FFA500'; // Orange
    return '#00FF00'; // Vert
  }, [state.isOnline, state.isSyncing, state.pendingCount]);

  /**
   * Vérifier si une sync est nécessaire
   */
  const needsSync = useCallback((): boolean => {
    return state.pendingCount > 0 || state.conflicts.length > 0;
  }, [state.pendingCount, state.conflicts.length]);

  /**
   * Obtenir le temps depuis la dernière sync
   */
  const getTimeSinceLastSync = useCallback((): string => {
    if (!state.lastSyncTime) return 'Jamais';
    
    const now = new Date();
    const diff = now.getTime() - state.lastSyncTime.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}j`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}min`;
    return 'À l\'instant';
  }, [state.lastSyncTime]);

  const actions: OfflineSyncActions = {
    forceSync,
    resolveConflict,
    dismissError,
    clearAllErrors,
    retryFailedActions,
  };

  return {
    ...state,
    actions,
    getConnectionStatus,
    getStatusColor,
    needsSync,
    getTimeSinceLastSync,
  };
};

export default useOfflineSync;
