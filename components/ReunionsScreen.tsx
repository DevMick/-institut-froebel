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
import { OrdreJourRapportService } from '../services/OrdreJourRapportService';

interface ReunionsScreenProps {
  club: Club;
  onBack: () => void;
}

export const ReunionsScreen: React.FC<ReunionsScreenProps> = ({ club, onBack }) => {
  const [reunions, setReunions] = useState<Reunion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReunion, setSelectedReunion] = useState<Reunion | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [compteRendu, setCompteRendu] = useState<any>(null);
  const [loadingCompteRendu, setLoadingCompteRendu] = useState(false);
  const [showCompteRendu, setShowCompteRendu] = useState(false);

  const apiService = new ApiService();
  const rapportService = new OrdreJourRapportService();

  useEffect(() => {
    loadReunions();
  }, [club.id]);

  const loadReunions = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des réunions...');

      // Charger les vraies réunions depuis l'API
      const reunionsData = await apiService.getClubReunions(club.id);
      console.log('✅ Réunions chargées:', reunionsData.length);
      console.log('🔍 Première réunion API:', JSON.stringify(reunionsData[0], null, 2));

      // TEMPORAIRE: Forcer l'utilisation des données de démonstration pour debug
      if (true || reunionsData.length === 0) {
        console.log('📝 Utilisation des données de démonstration');
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
        {
          id: '3',
          clubId: club.id,
          date: '2024-06-11',
          heure: '19:00',
          typeReunionId: '1',
          typeReunionLibelle: 'Réunion hebdomadaire',
          ordresDuJour: ['Ouverture', 'Rapport financier', 'Projets communautaires', 'Clôture'],
          presences: [
            { id: '5', reunionId: '3', membreId: '1', nomMembre: 'Jean Dupont', present: true, excuse: false },
            { id: '6', reunionId: '3', membreId: '3', nomMembre: 'Paul Kouame', present: true, excuse: false },
          ],
          invites: [
            { id: '2', reunionId: '3', nom: 'Traore', prenom: 'Aminata', email: 'aminata.traore@ong.ci', organisation: 'ONG Espoir' },
          ],
          lieu: 'Hôtel Ivoire',
          description: 'Réunion avec focus sur les projets communautaires',
          statut: 'terminee',
        },
      ];

        setReunions(mockReunions);
        console.log('✅ Données de démonstration chargées:', mockReunions.length);
      }
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



  const handleReunionPress = async (reunion: Reunion) => {
    setSelectedReunion(reunion);
    setShowDetailModal(true);
    setShowCompteRendu(true);

    // Charger directement le compte-rendu
    await loadCompteRendu(reunion);
  };

  const loadCompteRendu = async (reunion: Reunion) => {
    try {
      setLoadingCompteRendu(true);
      console.log('🔄 Chargement compte-rendu pour réunion:', reunion.id);

      // Récupérer les détails de la réunion
      let reunionData;
      try {
        reunionData = await apiService.getReunionDetails(club.id, reunion.id);
      } catch (error) {
        console.log('⚠️ Impossible de charger les détails, utilisation des données de base');
        reunionData = reunion;
      }

      // Charger le contenu pour chaque ordre du jour
      const ordresDuJour = reunionData.ordresDuJour || reunion.ordresDuJour || [];
      console.log('📋 Structure des ordres du jour:', JSON.stringify(ordresDuJour, null, 2));
      console.log('📋 Données de réunion complètes:', JSON.stringify(reunionData, null, 2));

      let ordresAvecContenu = [];
      let diversExistant = '';

      if (ordresDuJour.length > 0) {
        // Mapper les ordres du jour pour s'assurer qu'ils ont les bonnes propriétés
        const ordresMapped = ordresDuJour.map((ordre: any, index: number) => {
          console.log(`📋 Ordre ${index + 1} original:`, JSON.stringify(ordre, null, 2));

          // Essayer différentes propriétés possibles pour l'ID et la description
          const ordreId = ordre.id || ordre.ordreId || ordre.numero || (index + 1).toString();
          const description = ordre.description || ordre.titre || ordre.libelle || ordre.sujet || `Ordre du jour ${index + 1}`;

          const ordreMapped = {
            id: ordreId,
            description: description,
            numero: ordre.numero || (index + 1)
          };

          console.log(`📋 Ordre ${index + 1} mappé:`, JSON.stringify(ordreMapped, null, 2));
          return ordreMapped;
        });

        const rapportResult = await rapportService.getAllRapportsForReunion(
          club.id,
          reunion.id,
          ordresMapped
        );
        ordresAvecContenu = rapportResult.ordresAvecContenu || [];
        diversExistant = rapportResult.diversExistant || '';
      }

      const compteRenduData = {
        reunion: {
          id: reunion.id,
          date: reunion.date,
          heure: reunion.heure,
          typeReunion: reunion.typeReunionLibelle,
          lieu: reunion.lieu
        },
        presences: (reunionData.presences || reunion.presences || []).map((p: any) => ({
          membreId: p.membreId,
          nomComplet: p.nomMembre || p.nomCompletMembre || p.nomComplet
        })),
        invites: (reunionData.invites || reunion.invites || []).map((i: any) => ({
          id: i.id,
          nom: i.nom,
          prenom: i.prenom,
          organisation: i.organisation,
          email: i.email
        })),
        ordresDuJour: ordresAvecContenu,
        divers: diversExistant,
        statistiques: {
          totalPresences: (reunionData.presences || reunion.presences || []).length,
          totalInvites: (reunionData.invites || reunion.invites || []).length,
          totalOrdresDuJour: ordresAvecContenu.length,
          ordresAvecContenu: ordresAvecContenu.filter(o => o.hasContent).length
        }
      };

      setCompteRendu(compteRenduData);
      console.log('✅ Compte-rendu chargé:', compteRenduData.statistiques);
    } catch (error: any) {
      console.error('❌ Erreur chargement compte-rendu:', error);
      setCompteRendu(null);
    } finally {
      setLoadingCompteRendu(false);
    }
  };

  const renderReunion = ({ item }: { item: Reunion }) => (
    <TouchableOpacity
      style={styles.reunionCard}
      onPress={() => handleReunionPress(item)}
    >
      {/* Header avec type et heure */}
      <View style={styles.reunionHeader}>
        <Text style={styles.reunionType}>{item.typeReunionLibelle}</Text>
        <View style={styles.timeBadge}>
          <Text style={styles.timeText}>{item.heure}</Text>
        </View>
      </View>

      {/* Date */}
      <Text style={styles.reunionDate}>{formatDate(item.date)}</Text>

      {/* Statistiques simples */}
      <View style={styles.reunionStats}>
        <View style={styles.statItem}>
          <Ionicons name="people" size={16} color="#005AA9" />
          <Text style={styles.statText}>
            {(item.presences || []).length} présences
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="person-add" size={16} color="#005AA9" />
          <Text style={styles.statText}>
            {(item.invites || []).length} invités
          </Text>
        </View>
      </View>

      {/* Debug - à supprimer plus tard */}
      {__DEV__ && (
        <Text style={{ fontSize: 10, color: 'red' }}>
          Debug: presences={JSON.stringify(item.presences?.length || 0)}, invites={JSON.stringify(item.invites?.length || 0)}
        </Text>
      )}

      {/* Bouton pour voir le compte-rendu */}
      <View style={styles.reunionFooter}>
        <Text style={styles.compteRenduText}>Voir le Compte-Rendu</Text>
        <Ionicons name="chevron-forward" size={20} color="#005AA9" />
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
            <Text style={styles.modalTitle}>Compte-Rendu</Text>
            <TouchableOpacity onPress={() => {
              setShowDetailModal(false);
              setCompteRendu(null);
              setShowCompteRendu(false);
            }}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Chargement du compte-rendu */}
            {loadingCompteRendu && (
              <View style={styles.loadingSection}>
                <ActivityIndicator size="large" color="#005AA9" />
                <Text style={styles.loadingText}>Chargement du compte-rendu...</Text>
              </View>
            )}

            {/* Contenu du compte-rendu */}
            {compteRendu && !loadingCompteRendu && (
              <>
                {/* Header du compte-rendu */}
                <View style={styles.compteRenduHeader}>
                  <Text style={styles.clubNameHeader}>{club.name}</Text>
                  <Text style={styles.compteRenduTitle}>COMPTE-RENDU DE RÉUNION</Text>
                  <Text style={styles.reunionInfoHeader}>
                    {selectedReunion?.typeReunionLibelle} du {formatDate(selectedReunion?.date || '')} à {selectedReunion?.heure}
                  </Text>
                </View>

                {/* Présences du compte-rendu */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>👥 Présences ({compteRendu.statistiques.totalPresences})</Text>
                  {compteRendu.presences.map((presence: any, index: number) => (
                    <View key={presence.membreId || index} style={styles.presenceItem}>
                      <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                      <Text style={styles.presenceText}>{presence.nomComplet}</Text>
                    </View>
                  ))}
                </View>

                {/* Invités du compte-rendu */}
                {compteRendu.invites.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>🎯 Invités ({compteRendu.statistiques.totalInvites})</Text>
                    {compteRendu.invites.map((invite: any) => (
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

                {/* Ordres du jour avec contenu */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>📋 Ordres du jour avec contenu ({compteRendu.statistiques.totalOrdresDuJour})</Text>
                  {compteRendu.ordresDuJour.map((ordre: any) => (
                    <View key={ordre.id} style={styles.ordreCard}>
                      <View style={styles.ordreHeader}>
                        <Text style={styles.ordreTitle}>{ordre.numero}. {ordre.description}</Text>
                        {ordre.hasContent ? (
                          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                        ) : (
                          <Ionicons name="alert-circle" size={20} color="#FF9500" />
                        )}
                      </View>
                      {ordre.contenu ? (
                        <Text style={styles.ordreContent}>{ordre.contenu}</Text>
                      ) : (
                        <Text style={styles.ordreNoContent}>📝 Aucun contenu enregistré</Text>
                      )}
                    </View>
                  ))}
                </View>

                {/* Points divers */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>📝 Points divers</Text>
                  {compteRendu.divers ? (
                    <Text style={styles.diversContent}>{compteRendu.divers}</Text>
                  ) : (
                    <Text style={styles.diversNoContent}>Aucun point divers enregistré.</Text>
                  )}
                </View>
              </>
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
          <Text style={styles.title}>Réunions & Comptes-Rendus</Text>
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
          data={reunions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())}
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
  loadingSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#005AA9',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  ordreCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  ordreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ordreTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  ordreContent: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  ordreNoContent: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  diversContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  diversNoContent: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
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
    alignItems: 'center',
    marginBottom: 8,
  },
  reunionType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  reunionDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  timeBadge: {
    backgroundColor: '#005AA9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  timeText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  reunionStats: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  reunionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  compteRenduText: {
    fontSize: 14,
    color: '#005AA9',
    fontWeight: '600',
  },
  compteRenduHeader: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  clubNameHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  compteRenduTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005AA9',
    marginBottom: 8,
  },
  reunionInfoHeader: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
