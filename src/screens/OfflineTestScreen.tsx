/**
 * Offline Test Screen - Rotary Club Mobile
 * Écran de test pour les fonctionnalités offline
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { THEME } from '../config/theme';
import { Button, Card } from '../components/ui';
import { SyncStatusIndicator } from '../components/offline';
import { databaseService } from '../services/databaseService';
import { syncService } from '../services/syncService';
import { offlineMemberService } from '../services/offlineMemberService';
import { useOfflineSync } from '../hooks/useOfflineSync';

export const OfflineTestScreen: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const offlineSync = useOfflineSync();

  useEffect(() => {
    // Test initial de la base de données
    testDatabaseConnection();
  }, []);

  // Test de connexion à la base de données
  const testDatabaseConnection = async () => {
    try {
      const isReady = databaseService.isReady();
      addTestResult(`Database ready: ${isReady ? '✅' : '❌'}`);
      
      if (isReady) {
        // Test simple de requête
        const result = await databaseService.executeSql('SELECT 1 as test');
        addTestResult(`Database query test: ${result.rows.length > 0 ? '✅' : '❌'}`);
      }
    } catch (error) {
      addTestResult(`Database error: ❌ ${error}`);
    }
  };

  // Test CRUD des membres
  const testMemberCRUD = async () => {
    try {
      setIsRunning(true);
      addTestResult('🧪 Testing Member CRUD operations...');

      // 1. Créer un membre de test
      const testMember = await offlineMemberService.createMember({
        name: 'Test Member',
        email: 'test@example.com',
        phone: '+33123456789',
        club_id: 'test-club-001',
        role: 'member',
      });
      addTestResult(`Create member: ✅ ID: ${testMember.id}`);

      // 2. Récupérer le membre
      const retrievedMember = await offlineMemberService.getMemberById(testMember.id);
      addTestResult(`Get member: ${retrievedMember ? '✅' : '❌'}`);

      // 3. Mettre à jour le membre
      if (retrievedMember) {
        const updatedMember = await offlineMemberService.updateMember(testMember.id, {
          name: 'Updated Test Member',
          phone: '+33987654321',
        });
        addTestResult(`Update member: ✅ Name: ${updatedMember.name}`);
      }

      // 4. Rechercher le membre
      const searchResults = await offlineMemberService.searchMembers('Updated Test');
      addTestResult(`Search member: ${searchResults.length > 0 ? '✅' : '❌'} Found: ${searchResults.length}`);

      // 5. Obtenir les statistiques
      const stats = await offlineMemberService.getMemberStats();
      addTestResult(`Member stats: ✅ Total: ${stats.total}, Active: ${stats.active}, Unsynced: ${stats.unsynced}`);

      // 6. Supprimer le membre
      await offlineMemberService.deleteMember(testMember.id);
      addTestResult(`Delete member: ✅`);

      addTestResult('🎉 Member CRUD tests completed successfully!');
    } catch (error) {
      addTestResult(`❌ Member CRUD test failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Test de la queue de synchronisation
  const testSyncQueue = async () => {
    try {
      setIsRunning(true);
      addTestResult('🧪 Testing Sync Queue...');

      // 1. Ajouter des actions à la queue
      await syncService.queueAction('CREATE', 'test_table', 'test-id-1', { name: 'Test 1' }, 1);
      await syncService.queueAction('UPDATE', 'test_table', 'test-id-2', { name: 'Test 2' }, 2);
      await syncService.queueAction('DELETE', 'test_table', 'test-id-3', { id: 'test-id-3' }, 3);
      addTestResult('Queue actions: ✅ Added 3 actions');

      // 2. Vérifier le nombre d'actions en attente
      const pendingCount = await syncService.getPendingCount();
      addTestResult(`Pending actions: ✅ Count: ${pendingCount}`);

      // 3. Obtenir le statut de sync
      const syncStatus = syncService.getSyncStatus();
      addTestResult(`Sync status: ✅ Online: ${syncStatus.isOnline}, Syncing: ${syncStatus.isSyncing}`);

      addTestResult('🎉 Sync Queue tests completed!');
    } catch (error) {
      addTestResult(`❌ Sync Queue test failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Test des migrations de base de données
  const testDatabaseMigrations = async () => {
    try {
      setIsRunning(true);
      addTestResult('🧪 Testing Database Migrations...');

      // Vérifier les tables créées
      const tables = [
        'members',
        'reunions', 
        'attendance',
        'sync_queue',
        'notifications_cache',
        'app_settings',
        'schema_version'
      ];

      for (const table of tables) {
        try {
          const result = await databaseService.executeSql(
            `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
            [table]
          );
          addTestResult(`Table ${table}: ${result.rows.length > 0 ? '✅' : '❌'}`);
        } catch (error) {
          addTestResult(`Table ${table}: ❌ ${error}`);
        }
      }

      // Vérifier les index
      const indexes = [
        'idx_members_club_id',
        'idx_members_email',
        'idx_reunions_club_id',
        'idx_attendance_reunion_id',
        'idx_sync_queue_priority'
      ];

      for (const index of indexes) {
        try {
          const result = await databaseService.executeSql(
            `SELECT name FROM sqlite_master WHERE type='index' AND name=?`,
            [index]
          );
          addTestResult(`Index ${index}: ${result.rows.length > 0 ? '✅' : '❌'}`);
        } catch (error) {
          addTestResult(`Index ${index}: ❌ ${error}`);
        }
      }

      addTestResult('🎉 Database Migration tests completed!');
    } catch (error) {
      addTestResult(`❌ Database Migration test failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Test de performance
  const testPerformance = async () => {
    try {
      setIsRunning(true);
      addTestResult('🧪 Testing Performance...');

      // Test d'insertion en lot
      const startTime = Date.now();
      const batchSize = 100;
      
      await databaseService.executeTransaction(async (tx) => {
        for (let i = 0; i < batchSize; i++) {
          await databaseService.insert('members', {
            id: `perf-test-${i}`,
            name: `Performance Test ${i}`,
            email: `perf${i}@test.com`,
            club_id: 'perf-test-club',
            role: 'member',
            is_active: 1,
            synced: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      });

      const insertTime = Date.now() - startTime;
      addTestResult(`Batch insert (${batchSize} records): ✅ ${insertTime}ms`);

      // Test de sélection
      const selectStartTime = Date.now();
      const results = await databaseService.select(
        'members',
        '*',
        'club_id = ?',
        ['perf-test-club']
      );
      const selectTime = Date.now() - selectStartTime;
      addTestResult(`Select query (${results.length} records): ✅ ${selectTime}ms`);

      // Nettoyer les données de test
      await databaseService.delete('members', 'club_id = ?', ['perf-test-club']);
      addTestResult('Cleanup: ✅');

      addTestResult('🎉 Performance tests completed!');
    } catch (error) {
      addTestResult(`❌ Performance test failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Test de nettoyage
  const testCleanup = async () => {
    try {
      setIsRunning(true);
      addTestResult('🧪 Testing Cleanup...');

      // Nettoyer la base de données
      await databaseService.cleanup();
      addTestResult('Database cleanup: ✅');

      // Nettoyer le cache des membres
      await offlineMemberService.cleanupCache();
      addTestResult('Member cache cleanup: ✅');

      // Nettoyer la queue de sync
      await syncService.cleanup();
      addTestResult('Sync queue cleanup: ✅');

      addTestResult('🎉 Cleanup tests completed!');
    } catch (error) {
      addTestResult(`❌ Cleanup test failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Ajouter un résultat de test
  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  // Effacer les résultats
  const clearResults = () => {
    setTestResults([]);
  };

  // Exécuter tous les tests
  const runAllTests = async () => {
    clearResults();
    addTestResult('🚀 Starting comprehensive offline tests...');
    
    await testDatabaseConnection();
    await testDatabaseMigrations();
    await testMemberCRUD();
    await testSyncQueue();
    await testPerformance();
    await testCleanup();
    
    addTestResult('🏁 All tests completed!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Tests Offline</Text>
          <Text style={styles.subtitle}>
            Tests d'intégration pour les fonctionnalités offline
          </Text>
        </View>

        {/* Sync Status */}
        <SyncStatusIndicator showDetails style={styles.syncStatus} />

        {/* Test Buttons */}
        <Card style={styles.testCard}>
          <Text style={styles.cardTitle}>Tests Individuels</Text>
          
          <View style={styles.buttonGrid}>
            <Button
              title="DB Connection"
              onPress={testDatabaseConnection}
              variant="outline"
              size="small"
              disabled={isRunning}
              style={styles.testButton}
            />
            
            <Button
              title="DB Migrations"
              onPress={testDatabaseMigrations}
              variant="outline"
              size="small"
              disabled={isRunning}
              style={styles.testButton}
            />
            
            <Button
              title="Member CRUD"
              onPress={testMemberCRUD}
              variant="outline"
              size="small"
              disabled={isRunning}
              style={styles.testButton}
            />
            
            <Button
              title="Sync Queue"
              onPress={testSyncQueue}
              variant="outline"
              size="small"
              disabled={isRunning}
              style={styles.testButton}
            />
            
            <Button
              title="Performance"
              onPress={testPerformance}
              variant="outline"
              size="small"
              disabled={isRunning}
              style={styles.testButton}
            />
            
            <Button
              title="Cleanup"
              onPress={testCleanup}
              variant="outline"
              size="small"
              disabled={isRunning}
              style={styles.testButton}
            />
          </View>

          <View style={styles.mainActions}>
            <Button
              title="Tous les Tests"
              onPress={runAllTests}
              variant="primary"
              disabled={isRunning}
              style={styles.mainButton}
            />
            
            <Button
              title="Effacer"
              onPress={clearResults}
              variant="outline"
              disabled={isRunning}
              style={styles.mainButton}
            />
          </View>
        </Card>

        {/* Test Results */}
        <Card style={styles.resultsCard}>
          <Text style={styles.cardTitle}>Résultats des Tests</Text>
          
          {testResults.length === 0 ? (
            <Text style={styles.noResults}>
              Aucun test exécuté. Cliquez sur un bouton pour commencer.
            </Text>
          ) : (
            <ScrollView style={styles.resultsList} nestedScrollEnabled>
              {testResults.map((result, index) => (
                <Text key={index} style={styles.resultItem}>
                  {result}
                </Text>
              ))}
            </ScrollView>
          )}
        </Card>

        {/* Offline Sync Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>État Offline Sync</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Statut:</Text>
            <Text style={styles.infoValue}>{offlineSync.getConnectionStatus()}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Actions en attente:</Text>
            <Text style={styles.infoValue}>{offlineSync.pendingCount}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Conflits:</Text>
            <Text style={styles.infoValue}>{offlineSync.conflicts.length}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dernière sync:</Text>
            <Text style={styles.infoValue}>{offlineSync.getTimeSinceLastSync()}</Text>
          </View>

          {offlineSync.isOnline && (
            <Button
              title="Forcer Sync"
              onPress={() => offlineSync.actions.forceSync()}
              variant="primary"
              size="small"
              disabled={offlineSync.isSyncing}
              style={styles.syncButton}
            />
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.BACKGROUND,
  },

  scrollView: {
    flex: 1,
  },

  header: {
    padding: THEME.spacing.LG,
    alignItems: 'center',
  },

  title: {
    fontSize: THEME.typography.FONT_SIZE.XXL,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_SURFACE,
    marginBottom: THEME.spacing.SM,
  },

  subtitle: {
    fontSize: THEME.typography.FONT_SIZE.MD,
    color: THEME.colors.GRAY_600,
    textAlign: 'center',
  },

  syncStatus: {
    marginHorizontal: THEME.spacing.MD,
    marginBottom: THEME.spacing.MD,
  },

  testCard: {
    margin: THEME.spacing.MD,
  },

  cardTitle: {
    fontSize: THEME.typography.FONT_SIZE.LG,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_SURFACE,
    marginBottom: THEME.spacing.MD,
  },

  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.SM,
    marginBottom: THEME.spacing.LG,
  },

  testButton: {
    width: '48%',
  },

  mainActions: {
    flexDirection: 'row',
    gap: THEME.spacing.SM,
  },

  mainButton: {
    flex: 1,
  },

  resultsCard: {
    margin: THEME.spacing.MD,
    maxHeight: 300,
  },

  noResults: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_500,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  resultsList: {
    maxHeight: 200,
  },

  resultItem: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.ON_SURFACE,
    marginBottom: THEME.spacing.XS,
    fontFamily: 'monospace',
  },

  infoCard: {
    margin: THEME.spacing.MD,
    marginBottom: THEME.spacing.XXL,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.SM,
  },

  infoLabel: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_600,
  },

  infoValue: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
    color: THEME.colors.ON_SURFACE,
  },

  syncButton: {
    marginTop: THEME.spacing.MD,
  },
});

export default OfflineTestScreen;
