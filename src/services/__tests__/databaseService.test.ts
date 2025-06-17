/**
 * Database Service Tests - Rotary Club Mobile
 * Tests unitaires pour databaseService avec CRUD operations et migrations
 */

import { databaseService } from '../databaseService';

// Mock SQLite
const mockExecuteSql = jest.fn();
const mockTransaction = jest.fn();
const mockClose = jest.fn();

const mockDb = {
  executeSql: mockExecuteSql,
  transaction: mockTransaction,
  close: mockClose,
};

jest.mock('react-native-sqlite-storage', () => ({
  DEBUG: jest.fn(),
  enablePromise: jest.fn(),
  openDatabase: jest.fn(() => Promise.resolve(mockDb)),
}));

describe('DatabaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExecuteSql.mockResolvedValue([{
      rows: {
        length: 0,
        item: jest.fn(),
      },
      rowsAffected: 0,
      insertId: null,
    }]);
  });

  describe('initialization', () => {
    it('should initialize database successfully', async () => {
      await databaseService.initialize();
      expect(databaseService.isReady()).toBe(true);
    });

    it('should handle initialization errors', async () => {
      const SQLite = require('react-native-sqlite-storage');
      SQLite.openDatabase.mockRejectedValueOnce(new Error('DB Error'));
      
      await expect(databaseService.initialize()).rejects.toThrow('DB Error');
    });
  });

  describe('executeSql', () => {
    beforeEach(async () => {
      await databaseService.initialize();
    });

    it('should execute SQL query successfully', async () => {
      const mockRows = [{ id: 1, name: 'Test' }];
      mockExecuteSql.mockResolvedValueOnce([{
        rows: {
          length: 1,
          item: (index) => mockRows[index],
        },
        rowsAffected: 1,
        insertId: 1,
      }]);

      const result = await databaseService.executeSql('SELECT * FROM test');
      
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]).toEqual({ id: 1, name: 'Test' });
      expect(result.rowsAffected).toBe(1);
      expect(result.insertId).toBe(1);
    });

    it('should handle SQL execution errors', async () => {
      mockExecuteSql.mockRejectedValueOnce(new Error('SQL Error'));
      
      await expect(
        databaseService.executeSql('INVALID SQL')
      ).rejects.toThrow('SQL Error');
    });

    it('should throw error if database not initialized', async () => {
      const uninitializedService = new (databaseService.constructor as any)();
      
      await expect(
        uninitializedService.executeSql('SELECT 1')
      ).rejects.toThrow('Database not initialized');
    });
  });

  describe('insert', () => {
    beforeEach(async () => {
      await databaseService.initialize();
    });

    it('should insert record successfully', async () => {
      mockExecuteSql.mockResolvedValueOnce([{
        rows: { length: 0, item: jest.fn() },
        rowsAffected: 1,
        insertId: 123,
      }]);

      const data = { name: 'Test User', email: 'test@example.com' };
      const insertId = await databaseService.insert('users', data);
      
      expect(insertId).toBe(123);
      expect(mockExecuteSql).toHaveBeenCalledWith(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        ['Test User', 'test@example.com']
      );
    });

    it('should handle insert with no insertId', async () => {
      mockExecuteSql.mockResolvedValueOnce([{
        rows: { length: 0, item: jest.fn() },
        rowsAffected: 1,
        insertId: null,
      }]);

      const insertId = await databaseService.insert('users', { name: 'Test' });
      expect(insertId).toBe(0);
    });
  });

  describe('update', () => {
    beforeEach(async () => {
      await databaseService.initialize();
    });

    it('should update record successfully', async () => {
      mockExecuteSql.mockResolvedValueOnce([{
        rows: { length: 0, item: jest.fn() },
        rowsAffected: 1,
        insertId: null,
      }]);

      const data = { name: 'Updated Name' };
      const rowsAffected = await databaseService.update(
        'users',
        data,
        'id = ?',
        [1]
      );
      
      expect(rowsAffected).toBe(1);
      expect(mockExecuteSql).toHaveBeenCalledWith(
        'UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['Updated Name', 1]
      );
    });

    it('should handle update with no affected rows', async () => {
      mockExecuteSql.mockResolvedValueOnce([{
        rows: { length: 0, item: jest.fn() },
        rowsAffected: 0,
        insertId: null,
      }]);

      const rowsAffected = await databaseService.update(
        'users',
        { name: 'Test' },
        'id = ?',
        [999]
      );
      
      expect(rowsAffected).toBe(0);
    });
  });

  describe('delete', () => {
    beforeEach(async () => {
      await databaseService.initialize();
    });

    it('should delete record successfully', async () => {
      mockExecuteSql.mockResolvedValueOnce([{
        rows: { length: 0, item: jest.fn() },
        rowsAffected: 1,
        insertId: null,
      }]);

      const rowsAffected = await databaseService.delete('users', 'id = ?', [1]);
      
      expect(rowsAffected).toBe(1);
      expect(mockExecuteSql).toHaveBeenCalledWith(
        'DELETE FROM users WHERE id = ?',
        [1]
      );
    });
  });

  describe('select', () => {
    beforeEach(async () => {
      await databaseService.initialize();
    });

    it('should select records successfully', async () => {
      const mockRows = [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' },
      ];
      
      mockExecuteSql.mockResolvedValueOnce([{
        rows: {
          length: 2,
          item: (index) => mockRows[index],
        },
        rowsAffected: 0,
        insertId: null,
      }]);

      const results = await databaseService.select(
        'users',
        '*',
        'active = ?',
        [1],
        'name ASC',
        10
      );
      
      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({ id: 1, name: 'User 1' });
      expect(results[1]).toEqual({ id: 2, name: 'User 2' });
      expect(mockExecuteSql).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE active = ? ORDER BY name ASC LIMIT 10',
        [1]
      );
    });

    it('should select all columns without conditions', async () => {
      mockExecuteSql.mockResolvedValueOnce([{
        rows: { length: 0, item: jest.fn() },
        rowsAffected: 0,
        insertId: null,
      }]);

      await databaseService.select('users');
      
      expect(mockExecuteSql).toHaveBeenCalledWith(
        'SELECT * FROM users',
        []
      );
    });
  });

  describe('count', () => {
    beforeEach(async () => {
      await databaseService.initialize();
    });

    it('should count records successfully', async () => {
      mockExecuteSql.mockResolvedValueOnce([{
        rows: {
          length: 1,
          item: () => ({ count: 5 }),
        },
        rowsAffected: 0,
        insertId: null,
      }]);

      const count = await databaseService.count('users', 'active = ?', [1]);
      
      expect(count).toBe(5);
      expect(mockExecuteSql).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM users WHERE active = ?',
        [1]
      );
    });

    it('should return 0 for empty result', async () => {
      mockExecuteSql.mockResolvedValueOnce([{
        rows: { length: 0, item: jest.fn() },
        rowsAffected: 0,
        insertId: null,
      }]);

      const count = await databaseService.count('users');
      expect(count).toBe(0);
    });
  });

  describe('exists', () => {
    beforeEach(async () => {
      await databaseService.initialize();
    });

    it('should return true if record exists', async () => {
      mockExecuteSql.mockResolvedValueOnce([{
        rows: {
          length: 1,
          item: () => ({ count: 1 }),
        },
        rowsAffected: 0,
        insertId: null,
      }]);

      const exists = await databaseService.exists('users', 'id = ?', [1]);
      expect(exists).toBe(true);
    });

    it('should return false if record does not exist', async () => {
      mockExecuteSql.mockResolvedValueOnce([{
        rows: {
          length: 1,
          item: () => ({ count: 0 }),
        },
        rowsAffected: 0,
        insertId: null,
      }]);

      const exists = await databaseService.exists('users', 'id = ?', [999]);
      expect(exists).toBe(false);
    });
  });

  describe('executeTransaction', () => {
    beforeEach(async () => {
      await databaseService.initialize();
    });

    it('should execute transaction successfully', async () => {
      const mockTx = {
        executeSql: jest.fn((sql, params, success) => {
          success && success();
        }),
      };
      
      mockTransaction.mockImplementationOnce((callback, error, success) => {
        callback(mockTx);
        success && success();
      });

      const callback = jest.fn();
      await databaseService.executeTransaction(callback);
      
      expect(mockTransaction).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(mockTx);
    });

    it('should handle transaction errors', async () => {
      const error = new Error('Transaction failed');
      mockTransaction.mockImplementationOnce((callback, errorCallback) => {
        errorCallback && errorCallback(error);
      });

      const callback = jest.fn();
      await expect(
        databaseService.executeTransaction(callback)
      ).rejects.toThrow('Transaction failed');
    });
  });

  describe('cleanup', () => {
    beforeEach(async () => {
      await databaseService.initialize();
    });

    it('should cleanup old data successfully', async () => {
      mockTransaction.mockImplementationOnce((callback, error, success) => {
        const mockTx = {
          executeSql: jest.fn((sql, params, successCallback) => {
            successCallback && successCallback();
          }),
        };
        callback(mockTx);
        success && success();
      });

      // Mock VACUUM command
      mockExecuteSql.mockResolvedValueOnce([{
        rows: { length: 0, item: jest.fn() },
        rowsAffected: 0,
        insertId: null,
      }]);

      await databaseService.cleanup();
      
      expect(mockTransaction).toHaveBeenCalled();
      expect(mockExecuteSql).toHaveBeenCalledWith('VACUUM');
    });
  });

  describe('close', () => {
    it('should close database successfully', async () => {
      await databaseService.initialize();
      await databaseService.close();
      
      expect(mockClose).toHaveBeenCalled();
      expect(databaseService.isReady()).toBe(false);
    });

    it('should handle close when database not initialized', async () => {
      await databaseService.close();
      expect(mockClose).not.toHaveBeenCalled();
    });
  });
});
