/**
 * Presence Screen - Rotary Club Mobile
 * Écran présence avec scanner, liste participants et admin controls
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  RefreshControl,
  SafeAreaView,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { THEME } from '../config/theme';
import { Button, Card } from '../components/ui';
import { QRScanner } from '../components/qr/QRScanner';
import { QRGenerator } from '../components/qr/QRGenerator';
import { qrService, QRValidationResult, QRGenerationOptions } from '../services/qrService';
import type { MainTabScreenProps } from '../navigation/types';

type Props = MainTabScreenProps<'Presence'>;

interface Participant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'present' | 'absent' | 'late';
  arrivalTime?: Date;
  role: 'member' | 'guest' | 'organizer';
}

interface ReunionStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

export const PresenceScreen: React.FC<Props> = ({ navigation, route }) => {
  const [mode, setMode] = useState<'organizer' | 'participant'>('participant');
  const [showScanner, setShowScanner] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [stats, setStats] = useState<ReunionStats>({ total: 0, present: 0, absent: 0, late: 0, percentage: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [showManualPresence, setShowManualPresence] = useState(false);

  // Animation pour les succès
  const successAnim = React.useRef(new Animated.Value(0)).current;

  // Données de test
  const mockReunion = {
    id: 'reunion-001',
    title: 'Réunion Hebdomadaire',
    location: 'Hôtel Central',
    date: new Date(),
    organizerId: 'user-001',
  };

  useEffect(() => {
    loadParticipants();
    // Déterminer le mode selon le rôle de l'utilisateur
    // TODO: Récupérer depuis le store Redux
    setMode('organizer'); // Pour la démo
  }, []);

  useEffect(() => {
    calculateStats();
  }, [participants]);

  // Charger la liste des participants
  const loadParticipants = async () => {
    try {
      // TODO: Charger depuis l'API
      const mockParticipants: Participant[] = [
        {
          id: '1',
          name: 'Jean Dupont',
          email: 'jean.dupont@email.com',
          status: 'present',
          arrivalTime: new Date(),
          role: 'member',
        },
        {
          id: '2',
          name: 'Marie Martin',
          email: 'marie.martin@email.com',
          status: 'absent',
          role: 'member',
        },
        {
          id: '3',
          name: 'Pierre Durand',
          email: 'pierre.durand@email.com',
          status: 'late',
          arrivalTime: new Date(Date.now() - 15 * 60 * 1000), // 15 min de retard
          role: 'guest',
        },
      ];
      
      setParticipants(mockParticipants);
    } catch (error) {
      console.error('Error loading participants:', error);
      Alert.alert('Erreur', 'Impossible de charger la liste des participants');
    }
  };

  // Calculer les statistiques
  const calculateStats = () => {
    const total = participants.length;
    const present = participants.filter(p => p.status === 'present').length;
    const absent = participants.filter(p => p.status === 'absent').length;
    const late = participants.filter(p => p.status === 'late').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    setStats({ total, present, absent, late, percentage });
  };

  // Gérer le scan QR réussi
  const handleScanSuccess = useCallback((result: QRValidationResult) => {
    if (!result.valid || !result.data) {
      Alert.alert('QR Code invalide', result.error || 'Le QR Code scanné n\'est pas valide');
      return;
    }

    // Marquer la présence
    markPresence(result.data.reunionId);
    
    // Animation de succès
    Animated.sequence([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(successAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setShowScanner(false);
  }, []);

  // Gérer l'erreur de scan
  const handleScanError = useCallback((error: string) => {
    Alert.alert('Erreur de scan', error);
  }, []);

  // Marquer la présence
  const markPresence = async (reunionId: string) => {
    try {
      // TODO: Appeler l'API pour marquer la présence
      console.log('Marking presence for reunion:', reunionId);
      
      Alert.alert(
        'Présence confirmée',
        'Votre présence a été enregistrée avec succès !',
        [{ text: 'OK' }]
      );
      
      // Recharger les participants
      await loadParticipants();
    } catch (error) {
      console.error('Error marking presence:', error);
      Alert.alert('Erreur', 'Impossible d\'enregistrer votre présence');
    }
  };

  // Marquer présence manuelle (admin)
  const markManualPresence = (participantId: string, status: Participant['status']) => {
    setParticipants(prev => 
      prev.map(p => 
        p.id === participantId 
          ? { ...p, status, arrivalTime: status === 'present' ? new Date() : undefined }
          : p
      )
    );
    
    Alert.alert('Présence mise à jour', 'Le statut du participant a été modifié');
  };

  // Exporter la liste de présence
  const exportPresenceList = async () => {
    try {
      // TODO: Implémenter l'export
      Alert.alert('Export', 'La liste de présence sera exportée prochainement');
    } catch (error) {
      console.error('Error exporting presence list:', error);
      Alert.alert('Erreur', 'Impossible d\'exporter la liste');
    }
  };

  // Refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadParticipants();
    setRefreshing(false);
  }, []);

  // Render participant item
  const renderParticipantItem = ({ item }: { item: Participant }) => {
    const getStatusColor = () => {
      switch (item.status) {
        case 'present': return THEME.colors.SUCCESS;
        case 'late': return THEME.colors.WARNING;
        case 'absent': return THEME.colors.ERROR;
        default: return THEME.colors.GRAY_400;
      }
    };

    const getStatusIcon = () => {
      switch (item.status) {
        case 'present': return 'check-circle';
        case 'late': return 'schedule';
        case 'absent': return 'cancel';
        default: return 'help';
      }
    };

    const getStatusText = () => {
      switch (item.status) {
        case 'present': return 'Présent';
        case 'late': return 'En retard';
        case 'absent': return 'Absent';
        default: return 'Inconnu';
      }
    };

    return (
      <TouchableOpacity
        style={styles.participantItem}
        onPress={() => mode === 'organizer' && setSelectedParticipant(item)}
        disabled={mode !== 'organizer'}
      >
        <View style={styles.participantInfo}>
          <View style={styles.participantHeader}>
            <Text style={styles.participantName}>{item.name}</Text>
            <View style={styles.participantRole}>
              <Text style={styles.participantRoleText}>
                {item.role === 'member' ? 'Membre' : item.role === 'guest' ? 'Invité' : 'Organisateur'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.participantEmail}>{item.email}</Text>
          
          {item.arrivalTime && (
            <Text style={styles.arrivalTime}>
              Arrivée: {item.arrivalTime.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          )}
        </View>

        <View style={styles.participantStatus}>
          <Icon 
            name={getStatusIcon()} 
            size={24} 
            color={getStatusColor()} 
          />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Render stats header
  const renderStatsHeader = () => (
    <Card style={styles.statsCard}>
      <View style={styles.statsHeader}>
        <Text style={styles.statsTitle}>Statistiques de présence</Text>
        <Text style={styles.statsPercentage}>{stats.percentage}%</Text>
      </View>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: THEME.colors.SUCCESS }]}>
            {stats.present}
          </Text>
          <Text style={styles.statLabel}>Présents</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: THEME.colors.WARNING }]}>
            {stats.late}
          </Text>
          <Text style={styles.statLabel}>En retard</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: THEME.colors.ERROR }]}>
            {stats.absent}
          </Text>
          <Text style={styles.statLabel}>Absents</Text>
        </View>
      </View>
    </Card>
  );

  // Render admin controls
  const renderAdminControls = () => {
    if (mode !== 'organizer') return null;

    return (
      <View style={styles.adminControls}>
        <Button
          title="Générer QR Code"
          onPress={() => setShowGenerator(true)}
          variant="primary"
          icon="qr-code"
          style={styles.adminButton}
        />
        
        <Button
          title="Présence manuelle"
          onPress={() => setShowManualPresence(true)}
          variant="outline"
          icon="edit"
          style={styles.adminButton}
        />
        
        <Button
          title="Exporter liste"
          onPress={exportPresenceList}
          variant="outline"
          icon="download"
          style={styles.adminButton}
        />
      </View>
    );
  };

  // Render participant controls
  const renderParticipantControls = () => {
    if (mode !== 'participant') return null;

    return (
      <View style={styles.participantControls}>
        <Button
          title="Scanner QR Code"
          onPress={() => setShowScanner(true)}
          variant="primary"
          icon="qr-code-scanner"
          size="large"
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{mockReunion.title}</Text>
          <Text style={styles.headerSubtitle}>{mockReunion.location}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.modeToggle}
          onPress={() => setMode(prev => prev === 'organizer' ? 'participant' : 'organizer')}
        >
          <Icon 
            name={mode === 'organizer' ? 'admin-panel-settings' : 'person'} 
            size={24} 
            color={THEME.colors.PRIMARY} 
          />
          <Text style={styles.modeText}>
            {mode === 'organizer' ? 'Admin' : 'Participant'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      {renderStatsHeader()}

      {/* Controls */}
      {renderAdminControls()}
      {renderParticipantControls()}

      {/* Participants List */}
      <FlatList
        data={participants}
        renderItem={renderParticipantItem}
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
          instructions="Scannez le QR Code de présence"
        />
      </Modal>

      {/* QR Generator Modal */}
      <Modal
        visible={showGenerator}
        animationType="slide"
        onRequestClose={() => setShowGenerator(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Générateur QR Code</Text>
            <TouchableOpacity onPress={() => setShowGenerator(false)}>
              <Icon name="close" size={24} color={THEME.colors.ON_SURFACE} />
            </TouchableOpacity>
          </View>
          
          <QRGenerator
            options={{
              reunionId: mockReunion.id,
              clubId: 'club-001',
              reunionTitle: mockReunion.title,
              location: mockReunion.location,
              organizerId: mockReunion.organizerId,
              validityMinutes: 120,
              maxParticipants: 50,
            }}
            onGenerated={(qrData) => {
              console.log('QR Generated:', qrData);
            }}
            onError={(error) => {
              Alert.alert('Erreur', error);
            }}
          />
        </SafeAreaView>
      </Modal>

      {/* Success Animation */}
      <Animated.View
        style={[
          styles.successOverlay,
          {
            opacity: successAnim,
            transform: [{ scale: successAnim }],
          },
        ]}
        pointerEvents="none"
      >
        <Icon name="check-circle" size={64} color={THEME.colors.SUCCESS} />
        <Text style={styles.successText}>Présence confirmée !</Text>
      </Animated.View>
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

  headerSubtitle: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_600,
    marginTop: THEME.spacing.XS,
  },

  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: THEME.spacing.SM,
    borderRadius: THEME.radius.MD,
    backgroundColor: THEME.colors.PRIMARY_CONTAINER,
  },

  modeText: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.PRIMARY,
    marginLeft: THEME.spacing.XS,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
  },

  statsCard: {
    margin: THEME.spacing.MD,
  },

  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.MD,
  },

  statsTitle: {
    fontSize: THEME.typography.FONT_SIZE.LG,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_SURFACE,
  },

  statsPercentage: {
    fontSize: THEME.typography.FONT_SIZE.XXL,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.PRIMARY,
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

  adminControls: {
    flexDirection: 'row',
    paddingHorizontal: THEME.spacing.MD,
    marginBottom: THEME.spacing.MD,
    gap: THEME.spacing.SM,
  },

  adminButton: {
    flex: 1,
  },

  participantControls: {
    padding: THEME.spacing.LG,
    alignItems: 'center',
  },

  listContent: {
    paddingBottom: THEME.spacing.XXL,
  },

  participantItem: {
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

  participantInfo: {
    flex: 1,
  },

  participantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.XS,
  },

  participantName: {
    fontSize: THEME.typography.FONT_SIZE.MD,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
    color: THEME.colors.ON_SURFACE,
    flex: 1,
  },

  participantRole: {
    backgroundColor: THEME.colors.SECONDARY_CONTAINER,
    paddingHorizontal: THEME.spacing.SM,
    paddingVertical: 2,
    borderRadius: THEME.radius.SM,
  },

  participantRoleText: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    color: THEME.colors.ON_SECONDARY_CONTAINER,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
  },

  participantEmail: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_600,
    marginBottom: THEME.spacing.XS,
  },

  arrivalTime: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    color: THEME.colors.GRAY_500,
  },

  participantStatus: {
    alignItems: 'center',
    marginLeft: THEME.spacing.MD,
  },

  statusText: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    marginTop: THEME.spacing.XS,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: THEME.colors.BACKGROUND,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: THEME.spacing.LG,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.OUTLINE_VARIANT,
  },

  modalTitle: {
    fontSize: THEME.typography.FONT_SIZE.XL,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_SURFACE,
  },

  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  successText: {
    fontSize: THEME.typography.FONT_SIZE.LG,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.WHITE,
    marginTop: THEME.spacing.MD,
  },
});

export default PresenceScreen;
