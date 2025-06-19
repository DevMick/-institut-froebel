import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Reunion, Club, PresenceReunion, InviteReunion } from '../types';
import { ApiService } from '../services/ApiService';

interface ReunionsScreenProps {
  club: Club;
  onBack: () => void;
}

export const ReunionsScreen: React.FC<ReunionsScreenProps> = ({ club, onBack }) => {
  const [reunions, setReunions] = useState<Reunion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReunion, setSelectedReunion] = useState<Reunion | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const apiService = new ApiService();

  useEffect(() => {
    loadReunions();
  }, [club.id]);

  const loadReunions = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des réunions...');
      
      // Pour l'instant, on utilise des données de démonstration
      // car l'endpoint des réunions n'est pas encore implémenté
      const mockReunions: Reunion[] = [
        {
          id: '1',
          clubId: club.id,
          date: '2024-06-25',
          heure: '19:00',
          typeReunionId: '1',
          typeReunionLibelle: 'Réunion hebdomadaire',
          ordresDuJour: ['Ouverture', 'Rapport du président', 'Projets en cours', 'Divers'],
          presences: [
            { id: '1', reunionId: '1', membreId: '1', nomMembre: 'Jean Dupont', present: true, excuse: false },
            { id: '2', reunionId: '1', membreId: '2', nomMembre: 'Marie Martin', present: false, excuse: true, commentaire: 'Voyage professionnel' },
          ],
          invites: [
            { id: '1', reunionId: '1', nom: 'Kouassi', prenom: 'Yves', email: 'yves.kouassi@example.com', organisation: 'Mairie d\'Abidjan' },
          ],
          lieu: 'Hôtel Ivoire',
          description: 'Réunion hebdomadaire du club',
          statut: 'programmee',
        },
        {
          id: '2',
          clubId: club.id,
          date: '2024-06-18',
          heure: '19:00',
          typeReunionId: '1',
          typeReunionLibelle: 'Réunion hebdomadaire',
          ordresDuJour: ['Ouverture', 'Présentation nouveau membre', 'Action humanitaire', 'Clôture'],
          presences: [
            { id: '3', reunionId: '2', membreId: '1', nomMembre: 'Jean Dupont', present: true, excuse: false },
            { id: '4', reunionId: '2', membreId: '2', nomMembre: 'Marie Martin', present: true, excuse: false },
          ],
          invites: [],
          lieu: 'Hôtel Ivoire',
          description: 'Réunion avec présentation nouveau membre',
          statut: 'terminee',
        },
      ];
      
      setReunions(mockReunions);
      console.log('✅ Réunions chargées:', mockReunions.length);
    } catch (error: any) {
      console.error('❌ Erreur chargement réunions:', error);
      Alert.alert('Erreur', 'Impossible de charger les réunions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (statut?: string) => {
    switch (statut) {
      case 'programmee': return '#007AFF';
      case 'en_cours': return '#FF9500';
      case 'terminee': return '#34C759';
      case 'annulee': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (statut?: string) => {
    switch (statut) {
      case 'programmee': return 'Programmée';
      case 'en_cours': return 'En cours';
      case 'terminee': return 'Terminée';
      case 'annulee': return 'Annulée';
      default: return 'Inconnue';
    }
  };

  const handleReunionPress = (reunion: Reunion) => {
    setSelectedReunion(reunion);
    setShowDetailModal(true);
  };

  const renderReunion = ({ item }: { item: Reunion }) => (
    <TouchableOpacity
      style={styles.reunionCard}
      onPress={() => handleReunionPress(item)}
    >
      <View style={styles.reunionHeader}>
        <View style={styles.reunionInfo}>
          <Text style={styles.reunionType}>{item.typeReunionLibelle}</Text>
          <Text style={styles.reunionDate}>{formatDate(item.date)}</Text>
          <Text style={styles.reunionTime}>{item.heure} • {item.lieu}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.statut) }]}>
          <Text style={styles.statusText}>{getStatusText(item.statut)}</Text>
        </View>
      </View>

      <View style={styles.reunionStats}>
        <View style={styles.statItem}>
          <Ionicons name="list" size={16} color="#666" />
          <Text style={styles.statText}>{item.ordresDuJour.length} points</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="people" size={16} color="#666" />
          <Text style={styles.statText}>{item.presences.length} présences</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="person-add" size={16} color="#666" />
          <Text style={styles.statText}>{item.invites.length} invités</Text>
        </View>
      </View>

      <View style={styles.reunionFooter}>
        <Text style={styles.reunionDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      </View>
    </TouchableOpacity>
  );

  const renderDetailModal = () => {
    if (!selectedReunion) return null;

    return (
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Détails de la réunion</Text>
            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Info générale */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Informations générales</Text>
              <Text style={styles.detailText}>Type: {selectedReunion.typeReunionLibelle}</Text>
              <Text style={styles.detailText}>Date: {formatDate(selectedReunion.date)}</Text>
              <Text style={styles.detailText}>Heure: {selectedReunion.heure}</Text>
              <Text style={styles.detailText}>Lieu: {selectedReunion.lieu}</Text>
              <Text style={styles.detailText}>Statut: {getStatusText(selectedReunion.statut)}</Text>
            </View>

            {/* Ordre du jour */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Ordre du jour ({selectedReunion.ordresDuJour.length} points)</Text>
              {selectedReunion.ordresDuJour.map((point, index) => (
                <View key={index} style={styles.agendaItem}>
                  <Text style={styles.agendaNumber}>{index + 1}.</Text>
                  <Text style={styles.agendaText}>{point}</Text>
                </View>
              ))}
            </View>

            {/* Présences */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Présences ({selectedReunion.presences.length})</Text>
              {selectedReunion.presences.map((presence) => (
                <View key={presence.id} style={styles.presenceItem}>
                  <Ionicons 
                    name={presence.present ? "checkmark-circle" : presence.excuse ? "time" : "close-circle"} 
                    size={20} 
                    color={presence.present ? "#34C759" : presence.excuse ? "#FF9500" : "#FF3B30"} 
                  />
                  <Text style={styles.presenceText}>{presence.nomMembre}</Text>
                  {presence.commentaire && (
                    <Text style={styles.presenceComment}>({presence.commentaire})</Text>
                  )}
                </View>
              ))}
            </View>

            {/* Invités */}
            {selectedReunion.invites.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Invités ({selectedReunion.invites.length})</Text>
                {selectedReunion.invites.map((invite) => (
                  <View key={invite.id} style={styles.inviteItem}>
                    <Text style={styles.inviteName}>{invite.prenom} {invite.nom}</Text>
                    {invite.organisation && (
                      <Text style={styles.inviteOrg}>{invite.organisation}</Text>
                    )}
                    {invite.email && (
                      <Text style={styles.inviteEmail}>{invite.email}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Réunions</Text>
          <Text style={styles.subtitle}>{club.name}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {reunions.length} réunion{reunions.length > 1 ? 's' : ''} • 
          {reunions.filter(r => r.statut === 'programmee').length} programmée{reunions.filter(r => r.statut === 'programmee').length > 1 ? 's' : ''}
        </Text>
      </View>

      {/* Reunions List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#005AA9" />
          <Text style={styles.loadingText}>Chargement des réunions...</Text>
        </View>
      ) : (
        <FlatList
          data={reunions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
          renderItem={renderReunion}
          keyExtractor={(item) => item.id}
          style={styles.reunionsList}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadReunions}
        />
      )}

      {renderDetailModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#005AA9',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginTop: 2,
  },
  statsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
  },
  reunionsList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  reunionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reunionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  reunionInfo: {
    flex: 1,
  },
  reunionType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  reunionDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  reunionTime: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  reunionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  reunionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  reunionDescription: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 15,
  },
  detailSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#005AA9',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  agendaItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  agendaNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#005AA9',
    marginRight: 8,
    minWidth: 20,
  },
  agendaText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  presenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  presenceText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  presenceComment: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  inviteItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  inviteName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  inviteOrg: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  inviteEmail: {
    fontSize: 12,
    color: '#007AFF',
  },
});
