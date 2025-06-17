/**
 * Database Service - Rotary Club Mobile
 * Service SQLite avec initialization, migrations et CRUD optimisées
 */

import SQLite from 'react-native-sqlite-storage';
import { Platform } from 'react-native';

// Types
export interface DatabaseConfig {
  name: string;
  version: string;
  displayName: string;
  size: number;
}

export interface Migration {
  version: number;
  sql: string[];
}

export interface QueryResult {
  rows: any[];
  rowsAffected: number;
  insertId?: number;
}

export interface TransactionCallback {
  (tx: SQLite.Transaction): void;
}

// Configuration
const DB_CONFIG: DatabaseConfig = {
  name: 'RotaryClub.db',
  version: '1.0',
  displayName: 'Rotary Club Database',
  size: 200000, // 200KB
};

const DB_VERSION = 1;

// Migrations
const MIGRATIONS: Migration[] = [
  {
    version: 1,
    sql: [
      // Members table
      `CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT,
        photo_url TEXT,
        club_id TEXT NOT NULL,
        role TEXT DEFAULT 'member',
        is_active INTEGER DEFAULT 1,
        synced INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Reunions table
      `CREATE TABLE IF NOT EXISTS reunions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        location TEXT,
        qr_code TEXT,
        max_participants INTEGER,
        club_id TEXT NOT NULL,
        created_by TEXT,
        synced INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Attendance table
      `CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        reunion_id TEXT NOT NULL,
        member_id TEXT NOT NULL,
        status TEXT DEFAULT 'present',
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        synced INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reunion_id) REFERENCES reunions(id),
        FOREIGN KEY (member_id) REFERENCES members(id),
        UNIQUE(reunion_id, member_id)
      )`,
      
      // Offline actions queue
      `CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action_type TEXT NOT NULL,
        table_name TEXT NOT NULL,
        record_id TEXT NOT NULL,
        data TEXT NOT NULL,
        priority INTEGER DEFAULT 1,
        retry_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Notifications cache
      `CREATE TABLE IF NOT EXISTS notifications_cache (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        data TEXT,
        read INTEGER DEFAULT 0,
        synced INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // App settings
      `CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Indexes pour performance
      `CREATE INDEX IF NOT EXISTS idx_members_club_id ON members(club_id)`,
      `CREATE INDEX IF NOT EXISTS idx_members_email ON members(email)`,
      `CREATE INDEX IF NOT EXISTS idx_reunions_club_id ON reunions(club_id)`,
      `CREATE INDEX IF NOT EXISTS idx_reunions_date ON reunions(date)`,
      `CREATE INDEX IF NOT EXISTS idx_attendance_reunion_id ON attendance(reunion_id)`,
      `CREATE INDEX IF NOT EXISTS idx_attendance_member_id ON attendance(member_id)`,
      `CREATE INDEX IF NOT EXISTS idx_sync_queue_priority ON sync_queue(priority, created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications_cache(read, created_at)`,
    ],
  },
];

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  constructor() {
    // Configuration SQLite
    SQLite.DEBUG(false);
    SQLite.enablePromise(true);
  }

  /**
   * Initialiser la base de données
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🗄️ Initializing database...');
      
      // Ouvrir la base de données
      this.db = await SQLite.openDatabase(
        DB_CONFIG.name,
        DB_CONFIG.version,
        DB_CONFIG.displayName,
        DB_CONFIG.size
      );

      // Exécuter les migrations
      await this.runMigrations();

      // Optimisations SQLite
      await this.optimizeDatabase();

      this.isInitialized = true;
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Exécuter les migrations
   */
  private async runMigrations(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Créer la table de versions si elle n'existe pas
      await this.executeSql(`
        CREATE TABLE IF NOT EXISTS schema_version (
          version INTEGER PRIMARY KEY,
          applied_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Obtenir la version actuelle
      const result = await this.executeSql(
        'SELECT MAX(version) as current_version FROM schema_version'
      );
      
      const currentVersion = result.rows[0]?.current_version || 0;

      // Appliquer les migrations nécessaires
      for (const migration of MIGRATIONS) {
        if (migration.version > currentVersion) {
          console.log(`📦 Applying migration ${migration.version}...`);
          
          await this.executeTransaction(async (tx) => {
            // Exécuter toutes les requêtes de la migration
            for (const sql of migration.sql) {
              await this.executeSqlInTransaction(tx, sql);
            }
            
            // Enregistrer la version appliquée
            await this.executeSqlInTransaction(
              tx,
              'INSERT INTO schema_version (version) VALUES (?)',
              [migration.version]
            );
          });
          
          console.log(`✅ Migration ${migration.version} applied`);
        }
      }
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  /**
   * Optimiser la base de données
   */
  private async optimizeDatabase(): Promise<void> {
    if (!this.db) return;

    try {
      // Activer les clés étrangères
      await this.executeSql('PRAGMA foreign_keys = ON');
      
      // Optimiser les performances
      await this.executeSql('PRAGMA journal_mode = WAL');
      await this.executeSql('PRAGMA synchronous = NORMAL');
      await this.executeSql('PRAGMA cache_size = 10000');
      await this.executeSql('PRAGMA temp_store = MEMORY');
      
      console.log('✅ Database optimized');
    } catch (error) {
      console.error('❌ Database optimization failed:', error);
    }
  }

  /**
   * Exécuter une requête SQL
   */
  async executeSql(sql: string, params: any[] = []): Promise<QueryResult> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const [result] = await this.db.executeSql(sql, params);
      
      const rows: any[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        rows.push(result.rows.item(i));
      }

      return {
        rows,
        rowsAffected: result.rowsAffected,
        insertId: result.insertId,
      };
    } catch (error) {
      console.error('❌ SQL execution failed:', { sql, params, error });
      throw error;
    }
  }

  /**
   * Exécuter une requête dans une transaction
   */
  private async executeSqlInTransaction(
    tx: SQLite.Transaction,
    sql: string,
    params: any[] = []
  ): Promise<QueryResult> {
    return new Promise((resolve, reject) => {
      tx.executeSql(
        sql,
        params,
        (_, result) => {
          const rows: any[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            rows.push(result.rows.item(i));
          }
          
          resolve({
            rows,
            rowsAffected: result.rowsAffected,
            insertId: result.insertId,
          });
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  }

  /**
   * Exécuter une transaction
   */
  async executeTransaction(callback: TransactionCallback): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db!.transaction(
        callback,
        (error) => {
          console.error('❌ Transaction failed:', error);
          reject(error);
        },
        () => {
          resolve();
        }
      );
    });
  }

  /**
   * Insérer un enregistrement
   */
  async insert(table: string, data: Record<string, any>): Promise<number> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map(() => '?').join(', ');
    
    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
    const result = await this.executeSql(sql, values);
    
    return result.insertId || 0;
  }

  /**
   * Mettre à jour un enregistrement
   */
  async update(
    table: string,
    data: Record<string, any>,
    where: string,
    whereParams: any[] = []
  ): Promise<number> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map(col => `${col} = ?`).join(', ');
    
    const sql = `UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE ${where}`;
    const result = await this.executeSql(sql, [...values, ...whereParams]);
    
    return result.rowsAffected;
  }

  /**
   * Supprimer un enregistrement
   */
  async delete(table: string, where: string, whereParams: any[] = []): Promise<number> {
    const sql = `DELETE FROM ${table} WHERE ${where}`;
    const result = await this.executeSql(sql, whereParams);
    
    return result.rowsAffected;
  }

  /**
   * Sélectionner des enregistrements
   */
  async select(
    table: string,
    columns: string = '*',
    where?: string,
    whereParams: any[] = [],
    orderBy?: string,
    limit?: number
  ): Promise<any[]> {
    let sql = `SELECT ${columns} FROM ${table}`;
    
    if (where) {
      sql += ` WHERE ${where}`;
    }
    
    if (orderBy) {
      sql += ` ORDER BY ${orderBy}`;
    }
    
    if (limit) {
      sql += ` LIMIT ${limit}`;
    }
    
    const result = await this.executeSql(sql, whereParams);
    return result.rows;
  }

  /**
   * Compter les enregistrements
   */
  async count(table: string, where?: string, whereParams: any[] = []): Promise<number> {
    let sql = `SELECT COUNT(*) as count FROM ${table}`;
    
    if (where) {
      sql += ` WHERE ${where}`;
    }
    
    const result = await this.executeSql(sql, whereParams);
    return result.rows[0]?.count || 0;
  }

  /**
   * Vérifier si un enregistrement existe
   */
  async exists(table: string, where: string, whereParams: any[] = []): Promise<boolean> {
    const count = await this.count(table, where, whereParams);
    return count > 0;
  }

  /**
   * Obtenir la taille de la base de données
   */
  async getDatabaseSize(): Promise<number> {
    try {
      // TODO: Implémenter avec react-native-fs
      return 0;
    } catch (error) {
      console.error('Error getting database size:', error);
      return 0;
    }
  }

  /**
   * Sauvegarder la base de données
   */
  async backup(): Promise<string> {
    try {
      // TODO: Implémenter la sauvegarde
      console.log('Database backup not implemented yet');
      return '';
    } catch (error) {
      console.error('Error backing up database:', error);
      throw error;
    }
  }

  /**
   * Restaurer la base de données
   */
  async restore(backupPath: string): Promise<void> {
    try {
      // TODO: Implémenter la restauration
      console.log('Database restore not implemented yet');
    } catch (error) {
      console.error('Error restoring database:', error);
      throw error;
    }
  }

  /**
   * Nettoyer les données anciennes
   */
  async cleanup(): Promise<void> {
    try {
      await this.executeTransaction(async (tx) => {
        // Supprimer les notifications anciennes (> 30 jours)
        await this.executeSqlInTransaction(
          tx,
          `DELETE FROM notifications_cache 
           WHERE created_at < datetime('now', '-30 days')`
        );
        
        // Supprimer les actions de sync anciennes et réussies (> 7 jours)
        await this.executeSqlInTransaction(
          tx,
          `DELETE FROM sync_queue 
           WHERE created_at < datetime('now', '-7 days') 
           AND retry_count = 0`
        );
      });
      
      // Optimiser la base de données
      await this.executeSql('VACUUM');
      
      console.log('✅ Database cleanup completed');
    } catch (error) {
      console.error('❌ Database cleanup failed:', error);
    }
  }

  /**
   * Fermer la base de données
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      this.isInitialized = false;
      console.log('🗄️ Database closed');
    }
  }

  /**
   * Vérifier si la base de données est initialisée
   */
  isReady(): boolean {
    return this.isInitialized && this.db !== null;
  }
}

// Instance singleton
export const databaseService = new DatabaseService();

export default databaseService;
