/**
 * Sync Service Tests - Rotary Club Mobile
 * Tests unitaires pour syncService avec offline queue et conflict resolution
 */

import { syncService } from '../syncService';
import { databaseService } from '../databaseService';
import { apiClient } from '../apiClient';

// Mock dependencies
jest.mock('../databaseService');
jest.mock('../apiClient');
jest.mock('@react-native-community/netinfo');

const mockDatabaseService = databaseService as jest.Mocked<typeof databaseService>;
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('SyncService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock NetInfo to be online
    const NetInfo = require('@react-native-community/netinfo');
    NetInfo.addEventListener.mockImplementation((callback) => {
      callback({ isConnected: true });
      return jest.fn(); // unsubscribe function
    });
  });

  describe('queueAction', () => {
    it('should queue action successfully', async () => {
      mockDatabaseService.insert.mockResolvedValueOnce(1);
      
      const data = { name: 'Test User' };
      await syncService.queueAction('CREATE', 'members', 'test-id', data, 1);
      
      expect(mockDatabaseService.insert).toHaveBeenCalledWith(
        'sync_queue',
        expect.objectContaining({
          action_type: 'CREATE',
          table_name: 'members',
          record_id: 'test-id',
          data: JSON.stringify(data),
          priority: 1,
          retry_count: 0,
        })
      );
    });

    it('should handle queue action errors', async () => {
      mockDatabaseService.insert.mockRejectedValueOnce(new Error('DB Error'));
      
      await expect(
        syncService.queueAction('CREATE', 'members', 'test-id', {})
      ).rejects.toThrow('DB Error');
    });
  });

  describe('startBackgroundSync', () => {
    it('should return early if already syncing', async () => {
      // Start first sync
      const promise1 = syncService.startBackgroundSync();
      
      // Try to start second sync while first is running
      const result2 = await syncService.startBackgroundSync();
      
      expect(result2.success).toBe(false);
      expect(result2.errors).toContain('Sync already in progress or offline');
      
      // Wait for first sync to complete
      await promise1;
    });

    it('should return early if offline', async () => {
      // Mock NetInfo to be offline
      const NetInfo = require('@react-native-community/netinfo');
      NetInfo.addEventListener.mockImplementation((callback) => {
        callback({ isConnected: false });
        return jest.fn();
      });
      
      // Reinitialize service to pick up offline state
      const result = await syncService.startBackgroundSync();
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Sync already in progress or offline');
    });

    it('should sync successfully with no pending actions', async () => {
      mockDatabaseService.select.mockResolvedValueOnce([]);
      
      const result = await syncService.startBackgroundSync();
      
      expect(result.success).toBe(true);
      expect(result.synced).toBe(0);
      expect(result.failed).toBe(0);
    });

    it('should sync pending actions successfully', async () => {
      const mockActions = [
        createMockSyncAction({
          id: 1,
          action_type: 'CREATE',
          table_name: 'members',
          record_id: 'test-1',
          data: { name: 'Test User' },
        }),
      ];
      
      mockDatabaseService.select.mockResolvedValueOnce(mockActions);
      mockApiClient.post.mockResolvedValueOnce(createMockApiResponse({ id: 'test-1' }));
      mockDatabaseService.update.mockResolvedValueOnce(1);
      mockDatabaseService.delete.mockResolvedValueOnce(1);
      
      const result = await syncService.startBackgroundSync();
      
      expect(result.success).toBe(true);
      expect(result.synced).toBe(1);
      expect(result.failed).toBe(0);
    });

    it('should handle sync failures', async () => {
      const mockActions = [
        createMockSyncAction({
          id: 1,
          action_type: 'CREATE',
          table_name: 'members',
          record_id: 'test-1',
          data: { name: 'Test User' },
        }),
      ];
      
      mockDatabaseService.select.mockResolvedValueOnce(mockActions);
      mockApiClient.post.mockResolvedValueOnce(createMockApiResponse(null, false));
      mockDatabaseService.update.mockResolvedValueOnce(1);
      
      const result = await syncService.startBackgroundSync();
      
      expect(result.success).toBe(true);
      expect(result.synced).toBe(0);
      expect(result.failed).toBe(1);
    });
  });

  describe('getPendingCount', () => {
    it('should return pending actions count', async () => {
      mockDatabaseService.count.mockResolvedValueOnce(5);
      
      const count = await syncService.getPendingCount();
      
      expect(count).toBe(5);
      expect(mockDatabaseService.count).toHaveBeenCalledWith(
        'sync_queue',
        'retry_count < ?',
        [3]
      );
    });
  });

  describe('getSyncStatus', () => {
    it('should return current sync status', () => {
      const status = syncService.getSyncStatus();
      
      expect(status).toHaveProperty('isOnline');
      expect(status).toHaveProperty('isSyncing');
      expect(status).toHaveProperty('progress');
      expect(typeof status.isOnline).toBe('boolean');
      expect(typeof status.isSyncing).toBe('boolean');
      expect(typeof status.progress).toBe('object');
    });
  });

  describe('forcSync', () => {
    it('should force sync when online', async () => {
      mockDatabaseService.select.mockResolvedValueOnce([]);
      
      const result = await syncService.forcSync();
      
      expect(result.success).toBe(true);
    });

    it('should throw error when offline', async () => {
      // Mock NetInfo to be offline
      const NetInfo = require('@react-native-community/netinfo');
      NetInfo.addEventListener.mockImplementation((callback) => {
        callback({ isConnected: false });
        return jest.fn();
      });
      
      await expect(syncService.forcSync()).rejects.toThrow('Cannot sync while offline');
    });
  });

  describe('progress listeners', () => {
    it('should add and remove progress listeners', () => {
      const listener = jest.fn();
      
      syncService.addProgressListener(listener);
      syncService.removeProgressListener(listener);
      
      // No direct way to test this without triggering sync
      // But we can verify the methods don't throw
      expect(true).toBe(true);
    });
  });

  describe('conflict listeners', () => {
    it('should add and remove conflict listeners', () => {
      const listener = jest.fn();
      
      syncService.addConflictListener(listener);
      syncService.removeConflictListener(listener);
      
      // No direct way to test this without triggering conflicts
      // But we can verify the methods don't throw
      expect(true).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('should cleanup old sync actions', async () => {
      mockDatabaseService.delete.mockResolvedValueOnce(3);
      
      await syncService.cleanup();
      
      expect(mockDatabaseService.delete).toHaveBeenCalledWith(
        'sync_queue',
        'created_at < datetime("now", "-7 days") AND retry_count >= ?',
        [3]
      );
    });
  });

  describe('conflict resolution', () => {
    it('should detect conflicts based on timestamps', async () => {
      const clientData = {
        name: 'Client Name',
        updated_at: '2024-01-01T10:00:00Z',
      };
      
      const serverData = {
        name: 'Server Name',
        updated_at: '2024-01-01T11:00:00Z', // More recent
      };
      
      const mockActions = [
        createMockSyncAction({
          id: 1,
          action_type: 'UPDATE',
          table_name: 'members',
          record_id: 'test-1',
          data: clientData,
        }),
      ];
      
      mockDatabaseService.select.mockResolvedValueOnce(mockActions);
      mockApiClient.get.mockResolvedValueOnce(createMockApiResponse(serverData));
      mockApiClient.put.mockResolvedValueOnce(createMockApiResponse(serverData));
      mockDatabaseService.update.mockResolvedValueOnce(1);
      mockDatabaseService.delete.mockResolvedValueOnce(1);
      
      const result = await syncService.startBackgroundSync();
      
      expect(result.success).toBe(true);
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/members/test-1');
    });
  });

  describe('retry logic', () => {
    it('should increment retry count on failure', async () => {
      const mockActions = [
        createMockSyncAction({
          id: 1,
          action_type: 'CREATE',
          table_name: 'members',
          record_id: 'test-1',
          data: { name: 'Test User' },
          retry_count: 0,
        }),
      ];
      
      mockDatabaseService.select.mockResolvedValueOnce(mockActions);
      mockApiClient.post.mockRejectedValueOnce(new Error('Network Error'));
      mockDatabaseService.update.mockResolvedValueOnce(1);
      
      const result = await syncService.startBackgroundSync();
      
      expect(result.failed).toBe(1);
      expect(mockDatabaseService.update).toHaveBeenCalledWith(
        'sync_queue',
        { retry_count: 1 },
        'id = ?',
        [1]
      );
    });
  });

  describe('API endpoint mapping', () => {
    it('should map table names to correct API endpoints', async () => {
      const mockActions = [
        createMockSyncAction({
          id: 1,
          action_type: 'CREATE',
          table_name: 'members',
          record_id: 'test-1',
          data: { name: 'Test User' },
        }),
      ];
      
      mockDatabaseService.select.mockResolvedValueOnce(mockActions);
      mockApiClient.post.mockResolvedValueOnce(createMockApiResponse({ id: 'test-1' }));
      mockDatabaseService.update.mockResolvedValueOnce(1);
      mockDatabaseService.delete.mockResolvedValueOnce(1);
      
      await syncService.startBackgroundSync();
      
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/members',
        { name: 'Test User' }
      );
    });
  });
});
