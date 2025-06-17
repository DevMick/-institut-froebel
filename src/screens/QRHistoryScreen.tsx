/**
 * QR History Screen - Rotary Club Mobile
 * Écran historique QR codes avec filtres et analytics
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SafeAreaView,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { THEME } from '../config/theme';
import { Button, Card } from '../components/ui';
import { QRScanner } from '../components/qr/QRScanner';
import { qrService, QRValidationResult } from '../services/qrService';
import type { MainTabScreenProps } from '../navigation/types';

type Props = MainTabScreenProps<'QRHistory'>;

interface QRHistoryItem {
  id: string;
  action: 'generated' | 'scanned';
  data: any;
  timestamp: string;
}

interface QRStats {
  totalGenerated: number;
  totalScanned: number;
  successRate: number;
  recentActivity: QRHistoryItem[];
}

type FilterType = 'all' | 'generated' | 'scanned';
type SortType = 'newest' | 'oldest' | 'type';

export const QRHistoryScreen: React.FC<Props> = ({ navigation }) => {
  const [history, setHistory] = useState<QRHistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<QRHistoryItem[]>([]);
  const [stats, setStats] = useState<QRStats>({
    totalGenerated: 0,
    totalScanned: 0,
    successRate: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [showScanner, setShowScanner] = useState(false);
  const [selectedItem, setSelectedItem] = useState<QRHistoryItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadHistory();
    loadStats();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [history, filter, sort]);

  // Charger l'historique
  const loadHistory = async () => {
    try {
      setLoading(true);
      const historyData = await qrService.getQRHistory();
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading QR history:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'historique');
    } finally {
      setLoading(false);
    }
  };

  // Charger les statistiques
  const loadStats = async () => {
    try {
      const statsData = await qrService.getQRStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading QR stats:', error);
    }
  };

  // Appliquer les filtres et le tri
  const applyFiltersAndSort = () => {
    let filtered = [...history];

    // Appliquer le filtre
    if (filter !== 'all') {
      filtered = filtered.filter(item => item.action === filter);
    }

    // Appliquer le tri
    filtered.sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case 'type':
          return a.action.localeCompare(b.action);
        default:
          return 0;
      }
    });

    setFilteredHistory(filtered);
  };

  // Refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadHistory(), loadStats()]);
    setRefreshing(false);
  }, []);

  // Gérer le scan QR réussi
  const handleScanSuccess = useCallback((result: QRValidationResult) => {
    if (!result.valid || !result.data) {
      Alert.alert('QR Code invalide', result.error || 'Le QR Code scanné n\'est pas valide');
      return;
    }

    Alert.alert(
      'QR Code valide',
      `Type: ${result.data.type}\nRéunion: ${result.data.metadata.reunionTitle}\nLieu: ${result.data.metadata.location}`,
      [
        { text: 'Fermer', style: 'cancel' },
        { 
          text: 'Marquer présence', 
          onPress: () => {
            // TODO: Marquer la présence
            console.log('Mark presence for:', result.data?.reunionId);
          }
        },
      ]
    );

    setShowScanner(false);
    // Recharger l'historique pour inclure le nouveau scan
    loadHistory();
  }, []);

  // Gérer l'erreur de scan
  const handleScanError = useCallback((error: string) => {
    Alert.alert('Erreur de scan', error);
  }, []);

  // Supprimer un élément de l'historique
  const deleteHistoryItem = (itemId: string) => {
    Alert.alert(
      'Supprimer l\'élément',
      'Êtes-vous sûr de vouloir supprimer cet élément de l\'historique ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setHistory(prev => prev.filter(item => item.id !== itemId));
            Alert.alert('Supprimé', 'L\'élément a été supprimé de l\'historique');
          },
        },
      ]
    );
  };

  // Nettoyer l'historique
  const clearHistory = () => {
    Alert.alert(
      'Vider l\'historique',
      'Êtes-vous sûr de vouloir supprimer tout l\'historique ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implémenter la suppression côté service
              setHistory([]);
              Alert.alert('Historique vidé', 'L\'historique a été supprimé');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de vider l\'historique');
            }
          },
        },
      ]
    );
  };

  // Render stats header
  const renderStatsHeader = () => (
    <Card style={styles.statsCard}>
      <Text style={styles.statsTitle}>Statistiques QR Code</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.totalGenerated}</Text>
          <Text style={styles.statLabel}>Générés</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: THEME.colors.SUCCESS }]}>
            {stats.totalScanned}
          </Text>
          <Text style={styles.statLabel}>Scannés</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: THEME.colors.PRIMARY }]}>
            {Math.round(stats.successRate)}%
          </Text>
          <Text style={styles.statLabel}>Taux succès</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{history.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>
    </Card>
  );

  // Render filter controls
  const renderFilterControls = () => (
    <View style={styles.filterContainer}>
      <View style={styles.filterButtons}>
        {(['all', 'generated', 'scanned'] as FilterType[]).map(filterType => (
          <TouchableOpacity
            key={filterType}
            style={[
              styles.filterButton,
              filter === filterType && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(filterType)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === filterType && styles.filterButtonTextActive,
              ]}
            >
              {filterType === 'all' ? 'Tous' : 
               filterType === 'generated' ? 'Générés' : 'Scannés'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.sortButton}
        onPress={() => setShowFilters(true)}
      >
        <Icon name="sort" size={20} color={THEME.colors.PRIMARY} />
      </TouchableOpacity>
    </View>
  );

  // Render history item
  const renderHistoryItem = ({ item }: { item: QRHistoryItem }) => {
    const isGenerated = item.action === 'generated';
    const iconName = isGenerated ? 'qr-code' : 'qr-code-scanner';
    const iconColor = isGenerated ? THEME.colors.PRIMARY : THEME.colors.SUCCESS;
    
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays === 0) {
        if (diffHours === 0) {
          const diffMinutes = Math.floor(diffMs / (1000 * 60));
          return diffMinutes < 1 ? 'À l\'instant' : `${diffMinutes}min`;
        }
        return `${diffHours}h`;
      } else if (diffDays === 1) {
        return 'Hier';
      } else if (diffDays < 7) {
        return `${diffDays}j`;
      } else {
        return date.toLocaleDateString('fr-FR');
      }
    };

    return (
      <TouchableOpacity
        style={styles.historyItem}
        onPress={() => setSelectedItem(item)}
        onLongPress={() => deleteHistoryItem(item.id)}
      >
        <View style={[styles.historyIcon, { backgroundColor: `${iconColor}20` }]}>
          <Icon name={iconName} size={24} color={iconColor} />
        </View>

        <View style={styles.historyContent}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyAction}>
              {isGenerated ? 'QR Code généré' : 'QR Code scanné'}
            </Text>
            <Text style={styles.historyTime}>
              {formatDate(item.timestamp)}
            </Text>
          </View>

          <Text style={styles.historyTitle}>
            {item.data.metadata?.reunionTitle || 'Réunion'}
          </Text>
          
          <Text style={styles.historyLocation}>
            {item.data.metadata?.location || 'Lieu non spécifié'}
          </Text>
        </View>

        <Icon name="chevron-right" size={20} color={THEME.colors.GRAY_400} />
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="history" size={64} color={THEME.colors.GRAY_400} />
      <Text style={styles.emptyTitle}>Aucun historique</Text>
      <Text style={styles.emptyText}>
        Vos QR Codes générés et scannés apparaîtront ici.
      </Text>
      
      <Button
        title="Scanner un QR Code"
        onPress={() => setShowScanner(true)}
        variant="primary"
        style={styles.emptyButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historique QR</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowScanner(true)}
          >
            <Icon name="qr-code-scanner" size={24} color={THEME.colors.PRIMARY} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={clearHistory}
          >
            <Icon name="delete-sweep" size={24} color={THEME.colors.ERROR} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      {renderStatsHeader()}

      {/* Filters */}
      {renderFilterControls()}

      {/* History List */}
      {filteredHistory.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredHistory}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[THEME.colors.PRIMARY]}
              tintColor={THEME.colors.PRIMARY}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* QR Scanner Modal */}
      <Modal
        visible={showScanner}
        animationType="slide"
        onRequestClose={() => setShowScanner(false)}
      >
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onScanError={handleScanError}
          onClose={() => setShowScanner(false)}
          instructions="Scannez un QR Code depuis l'historique"
        />
      </Modal>

      {/* Sort Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Trier par</Text>
            
            {(['newest', 'oldest', 'type'] as SortType[]).map(sortType => (
              <TouchableOpacity
                key={sortType}
                style={[
                  styles.sortOption,
                  sort === sortType && styles.sortOptionActive,
                ]}
                onPress={() => {
                  setSort(sortType);
                  setShowFilters(false);
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sort === sortType && styles.sortOptionTextActive,
                  ]}
                >
                  {sortType === 'newest' ? 'Plus récent' :
                   sortType === 'oldest' ? 'Plus ancien' : 'Type'}
                </Text>
                
                {sort === sortType && (
                  <Icon name="check" size={20} color={THEME.colors.PRIMARY} />
                )}
              </TouchableOpacity>
            ))}
            
            <Button
              title="Fermer"
              onPress={() => setShowFilters(false)}
              variant="outline"
              style={styles.modalCloseButton}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.BACKGROUND,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: THEME.spacing.LG,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.OUTLINE_VARIANT,
  },

  headerTitle: {
    fontSize: THEME.typography.FONT_SIZE.XL,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_SURFACE,
  },

  headerActions: {
    flexDirection: 'row',
    gap: THEME.spacing.SM,
  },

  headerButton: {
    padding: THEME.spacing.SM,
  },

  statsCard: {
    margin: THEME.spacing.MD,
  },

  statsTitle: {
    fontSize: THEME.typography.FONT_SIZE.LG,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_SURFACE,
    marginBottom: THEME.spacing.MD,
    textAlign: 'center',
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  statItem: {
    alignItems: 'center',
  },

  statNumber: {
    fontSize: THEME.typography.FONT_SIZE.XL,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_SURFACE,
  },

  statLabel: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    color: THEME.colors.GRAY_600,
    marginTop: THEME.spacing.XS,
  },

  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.MD,
    marginBottom: THEME.spacing.MD,
  },

  filterButtons: {
    flexDirection: 'row',
    gap: THEME.spacing.SM,
  },

  filterButton: {
    paddingHorizontal: THEME.spacing.MD,
    paddingVertical: THEME.spacing.SM,
    borderRadius: THEME.radius.MD,
    backgroundColor: THEME.colors.SURFACE,
    borderWidth: 1,
    borderColor: THEME.colors.OUTLINE_VARIANT,
  },

  filterButtonActive: {
    backgroundColor: THEME.colors.PRIMARY,
    borderColor: THEME.colors.PRIMARY,
  },

  filterButtonText: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.ON_SURFACE,
  },

  filterButtonTextActive: {
    color: THEME.colors.WHITE,
  },

  sortButton: {
    padding: THEME.spacing.SM,
  },

  listContent: {
    paddingBottom: THEME.spacing.XXL,
  },

  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: THEME.spacing.MD,
    marginHorizontal: THEME.spacing.MD,
    marginVertical: THEME.spacing.XS,
    backgroundColor: THEME.colors.SURFACE,
    borderRadius: THEME.radius.MD,
    elevation: 1,
    shadowColor: THEME.colors.SHADOW,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.spacing.MD,
  },

  historyContent: {
    flex: 1,
  },

  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.XS,
  },

  historyAction: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
    color: THEME.colors.ON_SURFACE,
  },

  historyTime: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    color: THEME.colors.GRAY_500,
  },

  historyTitle: {
    fontSize: THEME.typography.FONT_SIZE.MD,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
    color: THEME.colors.ON_SURFACE,
    marginBottom: THEME.spacing.XS,
  },

  historyLocation: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_600,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.XXL,
  },

  emptyTitle: {
    fontSize: THEME.typography.FONT_SIZE.XL,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.GRAY_600,
    marginTop: THEME.spacing.LG,
    marginBottom: THEME.spacing.SM,
  },

  emptyText: {
    fontSize: THEME.typography.FONT_SIZE.MD,
    color: THEME.colors.GRAY_500,
    textAlign: 'center',
    lineHeight: THEME.typography.LINE_HEIGHT.MD,
    marginBottom: THEME.spacing.XXL,
  },

  emptyButton: {
    minWidth: 200,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: THEME.colors.SURFACE,
    borderRadius: THEME.radius.LG,
    padding: THEME.spacing.XXL,
    margin: THEME.spacing.LG,
    width: '80%',
    maxWidth: 300,
  },

  modalTitle: {
    fontSize: THEME.typography.FONT_SIZE.LG,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_SURFACE,
    textAlign: 'center',
    marginBottom: THEME.spacing.LG,
  },

  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: THEME.spacing.MD,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.OUTLINE_VARIANT,
  },

  sortOptionActive: {
    backgroundColor: THEME.colors.PRIMARY_CONTAINER,
  },

  sortOptionText: {
    fontSize: THEME.typography.FONT_SIZE.MD,
    color: THEME.colors.ON_SURFACE,
  },

  sortOptionTextActive: {
    color: THEME.colors.PRIMARY,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
  },

  modalCloseButton: {
    marginTop: THEME.spacing.LG,
  },
});

export default QRHistoryScreen;
