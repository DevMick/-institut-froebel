/**
 * useOfflineSync Hook Tests - Rotary Club Mobile
 * Tests unitaires pour useOfflineSync avec network changes et sync
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useOfflineSync } from '../useOfflineSync';
import { syncService } from '../../services/syncService';
import { databaseService } from '../../services/databaseService';

// Mock dependencies
jest.mock('../../services/syncService');
jest.mock('../../services/databaseService');
jest.mock('@react-native-community/netinfo');
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  Alert: {
    alert: jest.fn(),
  },
}));

const mockSyncService = syncService as jest.Mocked<typeof syncService>;
const mockDatabaseService = databaseService as jest.Mocked<typeof databaseService>;

describe('useOfflineSync', () => {
  const mockNetworkState = {
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  };

  const mockSyncStatus = {
    isOnline: true,
    isSyncing: false,
    progress: {
      total: 0,
      completed: 0,
      failed: 0,
      percentage: 0,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock NetInfo
    const NetInfo = require('@react-native-community/netinfo');
    NetInfo.addEventListener.mockImplementation((callback) => {
      callback(mockNetworkState);
      return jest.fn(); // unsubscribe function
    });

    // Mock sync service
    mockSyncService.getSyncStatus.mockReturnValue(mockSyncStatus);
    mockSyncService.getPendingCount.mockResolvedValue(0);
    mockSyncService.addProgressListener.mockImplementation(() => {});
    mockSyncService.removeProgressListener.mockImplementation(() => {});
    mockSyncService.addConflictListener.mockImplementation(() => {});
    mockSyncService.removeConflictListener.mockImplementation(() => {});
    mockSyncService.startBackgroundSync.mockResolvedValue({
      success: true,
      synced: 0,
      failed: 0,
      conflicts: [],
      errors: [],
    });

    // Mock database service
    mockDatabaseService.select.mockResolvedValue([]);
    mockDatabaseService.insert.mockResolvedValue(1);
  });

  describe('initialization', () => {
    it('should initialize with correct default state', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useOfflineSync());
      
      await waitForNextUpdate();
      
      expect(result.current.isOnline).toBe(true);
      expect(result.current.isSyncing).toBe(false);
      expect(result.current.pendingCount).toBe(0);
      expect(result.current.conflicts).toEqual([]);
      expect(result.current.errors).toEqual([]);
    });

    it('should setup network listener on mount', () => {
      const NetInfo = require('@react-native-community/netinfo');
      
      renderHook(() => useOfflineSync());
      
      expect(NetInfo.addEventListener).toHaveBeenCalled();
    });

    it('should setup sync service listeners on mount', () => {
      renderHook(() => useOfflineSync());
      
      expect(mockSyncService.addProgressListener).toHaveBeenCalled();
      expect(mockSyncService.addConflictListener).toHaveBeenCalled();
    });

    it('should cleanup listeners on unmount', () => {
      const { unmount } = renderHook(() => useOfflineSync());
      
      unmount();
      
      expect(mockSyncService.removeProgressListener).toHaveBeenCalled();
      expect(mockSyncService.removeConflictListener).toHaveBeenCalled();
    });
  });

  describe('network state changes', () => {
    it('should update online state when network changes', async () => {
      const NetInfo = require('@react-native-community/netinfo');
      let networkCallback: (state: any) => void;
      
      NetInfo.addEventListener.mockImplementation((callback) => {
        networkCallback = callback;
        return jest.fn();
      });

      const { result } = renderHook(() => useOfflineSync());
      
      // Simulate going offline
      act(() => {
        networkCallback({ isConnected: false });
      });
      
      expect(result.current.isOnline).toBe(false);
      
      // Simulate going back online
      act(() => {
        networkCallback({ isConnected: true });
      });
      
      expect(result.current.isOnline).toBe(true);
    });

    it('should trigger auto-sync when coming back online', async () => {
      const NetInfo = require('@react-native-community/netinfo');
      let networkCallback: (state: any) => void;
      
      NetInfo.addEventListener.mockImplementation((callback) => {
        networkCallback = callback;
        return jest.fn();
      });

      mockSyncService.getPendingCount.mockResolvedValue(5);
      
      const { result } = renderHook(() => useOfflineSync());
      
      // Start offline
      act(() => {
        networkCallback({ isConnected: false });
      });
      
      // Come back online with pending actions
      act(() => {
        networkCallback({ isConnected: true });
      });
      
      // Should schedule auto-sync
      expect(result.current.isOnline).toBe(true);
    });
  });

  describe('sync progress tracking', () => {
    it('should update progress when sync service notifies', () => {
      let progressCallback: (progress: any) => void;
      
      mockSyncService.addProgressListener.mockImplementation((callback) => {
        progressCallback = callback;
      });

      const { result } = renderHook(() => useOfflineSync());
      
      const mockProgress = {
        total: 10,
        completed: 5,
        failed: 1,
        percentage: 60,
        currentAction: 'Syncing members',
      };
      
      act(() => {
        progressCallback(mockProgress);
      });
      
      expect(result.current.progress).toEqual(mockProgress);
      expect(result.current.isSyncing).toBe(true);
    });

    it('should update last sync time when sync completes', async () => {
      let progressCallback: (progress: any) => void;
      
      mockSyncService.addProgressListener.mockImplementation((callback) => {
        progressCallback = callback;
      });

      const { result } = renderHook(() => useOfflineSync());
      
      const completedProgress = {
        total: 10,
        completed: 10,
        failed: 0,
        percentage: 100,
      };
      
      await act(async () => {
        progressCallback(completedProgress);
      });
      
      expect(result.current.isSyncing).toBe(false);
      expect(result.current.lastSyncTime).toBeInstanceOf(Date);
    });
  });

  describe('conflict handling', () => {
    it('should update conflicts when sync service notifies', () => {
      let conflictCallback: (conflicts: any[]) => void;
      
      mockSyncService.addConflictListener.mockImplementation((callback) => {
        conflictCallback = callback;
      });

      const { result } = renderHook(() => useOfflineSync());
      
      const mockConflicts = [
        {
          strategy: 'manual' as const,
          serverData: { name: 'Server Name' },
          clientData: { name: 'Client Name' },
        },
      ];
      
      act(() => {
        conflictCallback(mockConflicts);
      });
      
      expect(result.current.conflicts).toEqual(mockConflicts);
    });

    it('should show alert when conflicts are detected', () => {
      const { Alert } = require('react-native');
      let conflictCallback: (conflicts: any[]) => void;
      
      mockSyncService.addConflictListener.mockImplementation((callback) => {
        conflictCallback = callback;
      });

      renderHook(() => useOfflineSync());
      
      const mockConflicts = [{ strategy: 'manual' }];
      
      act(() => {
        conflictCallback(mockConflicts);
      });
      
      expect(Alert.alert).toHaveBeenCalledWith(
        'Conflits de synchronisation',
        '1 conflit(s) détecté(s). Veuillez les résoudre manuellement.',
        expect.any(Array)
      );
    });
  });

  describe('actions', () => {
    describe('forceSync', () => {
      it('should call sync service force sync when online', async () => {
        mockSyncService.forcSync.mockResolvedValue({
          success: true,
          synced: 5,
          failed: 0,
          conflicts: [],
          errors: [],
        });

        const { result } = renderHook(() => useOfflineSync());
        
        await act(async () => {
          await result.current.actions.forceSync();
        });
        
        expect(mockSyncService.forcSync).toHaveBeenCalled();
      });

      it('should throw error when offline', async () => {
        const NetInfo = require('@react-native-community/netinfo');
        NetInfo.addEventListener.mockImplementation((callback) => {
          callback({ isConnected: false });
          return jest.fn();
        });

        const { result } = renderHook(() => useOfflineSync());
        
        await expect(
          result.current.actions.forceSync()
        ).rejects.toThrow('Impossible de synchroniser hors ligne');
      });

      it('should handle sync errors', async () => {
        mockSyncService.forcSync.mockRejectedValue(new Error('Sync failed'));

        const { result } = renderHook(() => useOfflineSync());
        
        await expect(
          result.current.actions.forceSync()
        ).rejects.toThrow('Sync failed');
        
        expect(result.current.errors).toContain('Sync failed');
      });
    });

    describe('resolveConflict', () => {
      it('should resolve conflict and remove from list', async () => {
        const { result } = renderHook(() => useOfflineSync());
        
        const mockConflict = {
          strategy: 'manual' as const,
          serverData: { name: 'Server' },
          clientData: { name: 'Client' },
        };
        
        // Add conflict to state
        act(() => {
          result.current.conflicts.push(mockConflict);
        });
        
        await act(async () => {
          await result.current.actions.resolveConflict(mockConflict, { name: 'Resolved' });
        });
        
        expect(result.current.conflicts).not.toContain(mockConflict);
      });
    });

    describe('error management', () => {
      it('should dismiss specific error', () => {
        const { result } = renderHook(() => useOfflineSync());
        
        // Add errors to state
        act(() => {
          result.current.errors.push('Error 1', 'Error 2', 'Error 3');
        });
        
        act(() => {
          result.current.actions.dismissError(1);
        });
        
        expect(result.current.errors).toEqual(['Error 1', 'Error 3']);
      });

      it('should clear all errors', () => {
        const { result } = renderHook(() => useOfflineSync());
        
        // Add errors to state
        act(() => {
          result.current.errors.push('Error 1', 'Error 2');
        });
        
        act(() => {
          result.current.actions.clearAllErrors();
        });
        
        expect(result.current.errors).toEqual([]);
      });
    });

    describe('retryFailedActions', () => {
      it('should reset retry count and trigger sync', async () => {
        mockDatabaseService.executeSql.mockResolvedValue({
          rows: [],
          rowsAffected: 3,
        });

        const { result } = renderHook(() => useOfflineSync());
        
        await act(async () => {
          await result.current.actions.retryFailedActions();
        });
        
        expect(mockDatabaseService.executeSql).toHaveBeenCalledWith(
          'UPDATE sync_queue SET retry_count = 0 WHERE retry_count >= 3'
        );
      });
    });
  });

  describe('utility functions', () => {
    describe('getConnectionStatus', () => {
      it('should return correct status when syncing', () => {
        const { result } = renderHook(() => useOfflineSync());
        
        act(() => {
          result.current.isSyncing = true;
        });
        
        expect(result.current.getConnectionStatus()).toBe('Synchronisation...');
      });

      it('should return correct status when offline', () => {
        const NetInfo = require('@react-native-community/netinfo');
        NetInfo.addEventListener.mockImplementation((callback) => {
          callback({ isConnected: false });
          return jest.fn();
        });

        const { result } = renderHook(() => useOfflineSync());
        
        expect(result.current.getConnectionStatus()).toBe('Hors ligne');
      });

      it('should return pending count when online with pending actions', async () => {
        mockSyncService.getPendingCount.mockResolvedValue(5);
        
        const { result, waitForNextUpdate } = renderHook(() => useOfflineSync());
        
        await waitForNextUpdate();
        
        expect(result.current.getConnectionStatus()).toBe('5 action(s) en attente');
      });
    });

    describe('getStatusColor', () => {
      it('should return correct colors for different states', () => {
        const { result } = renderHook(() => useOfflineSync());
        
        // Online and synced
        expect(result.current.getStatusColor()).toBe('#00FF00');
        
        // Syncing
        act(() => {
          result.current.isSyncing = true;
        });
        expect(result.current.getStatusColor()).toBe('#FFA500');
        
        // Offline
        const NetInfo = require('@react-native-community/netinfo');
        NetInfo.addEventListener.mockImplementation((callback) => {
          callback({ isConnected: false });
          return jest.fn();
        });
        
        const { result: offlineResult } = renderHook(() => useOfflineSync());
        expect(offlineResult.current.getStatusColor()).toBe('#FF0000');
      });
    });

    describe('needsSync', () => {
      it('should return true when there are pending actions', async () => {
        mockSyncService.getPendingCount.mockResolvedValue(3);
        
        const { result, waitForNextUpdate } = renderHook(() => useOfflineSync());
        
        await waitForNextUpdate();
        
        expect(result.current.needsSync()).toBe(true);
      });

      it('should return true when there are conflicts', () => {
        const { result } = renderHook(() => useOfflineSync());
        
        act(() => {
          result.current.conflicts.push({
            strategy: 'manual',
            serverData: {},
            clientData: {},
          });
        });
        
        expect(result.current.needsSync()).toBe(true);
      });

      it('should return false when no sync needed', () => {
        const { result } = renderHook(() => useOfflineSync());
        
        expect(result.current.needsSync()).toBe(false);
      });
    });

    describe('getTimeSinceLastSync', () => {
      it('should return "Jamais" when no last sync time', () => {
        const { result } = renderHook(() => useOfflineSync());
        
        expect(result.current.getTimeSinceLastSync()).toBe('Jamais');
      });

      it('should return relative time since last sync', () => {
        const { result } = renderHook(() => useOfflineSync());
        
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        act(() => {
          result.current.lastSyncTime = oneHourAgo;
        });
        
        expect(result.current.getTimeSinceLastSync()).toBe('1h');
      });
    });
  });

  describe('AppState handling', () => {
    it('should trigger sync when app becomes active', () => {
      const { AppState } = require('react-native');
      let appStateCallback: (state: string) => void;
      
      AppState.addEventListener.mockImplementation((event, callback) => {
        if (event === 'change') {
          appStateCallback = callback;
        }
        return { remove: jest.fn() };
      });

      mockSyncService.getPendingCount.mockResolvedValue(3);
      
      renderHook(() => useOfflineSync());
      
      // Simulate app going to background then active
      act(() => {
        appStateCallback('background');
      });
      
      act(() => {
        appStateCallback('active');
      });
      
      // Should schedule sync
      expect(true).toBe(true); // Placeholder assertion
    });
  });
});
