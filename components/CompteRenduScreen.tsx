import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Reunion, Club } from '../types';
import { ApiService } from '../services/ApiService';
import { OrdreJourRapportService } from '../services/OrdreJourRapportService';

interface CompteRenduScreenProps {
  club: Club;
  onBack: () => void;
}

interface CompteRenduComplet {
  reunion: {
    id: string;
    date: string;
    heure: string;
    typeReunion: string;
    lieu?: string;
  };
  presences: {
    membreId: string;
    nomComplet: string;
  }[];
  invites: {
    id: string;
    nom: string;
    prenom: string;
    organisation?: string;
    email?: string;
  }[];
  ordresDuJour: {
    numero: number;
    id: string;
    description: string;
    contenu: string;
    hasContent: boolean;
  }[];
  divers: string;
  statistiques: {
    totalPresences: number;
    totalInvites: number;
    totalParticipants: number;
    totalOrdresDuJour: number;
    ordresAvecContenu: number;
  };
}

export const CompteRenduScreen: React.FC<CompteRenduScreenProps> = ({ club, onBack }) => {
  const [reunions, setReunions] = useState<Reunion[]>([]);
  const [selectedReunion, setSelectedReunion] = useState<Reunion | null>(null);
  const [compteRendu, setCompteRendu] = useState<CompteRenduComplet | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingReunions, setLoadingReunions] = useState(false);
  const [showReunionModal, setShowReunionModal] = useState(false);

  const apiService = new ApiService();
  const rapportService = new OrdreJourRapportService();

  useEffect(() => {
    loadReunions();
  }, [club.id]);

  const loadReunions = async () => {
    try {
      setLoadingReunions(true);
      console.log('🔄 Chargement des réunions pour le club:', club.id);
      
      const reunionsData = await apiService.getClubReunions(club.id);
      console.log('✅ Réunions chargées:', reunionsData.length);
      
      // Trier par date décroissante (plus récentes en premier)
      const reunionsSorted = reunionsData.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setReunions(reunionsSorted);
    } catch (error: any) {
      console.error('❌ Erreur chargement réunions:', error);
      Alert.alert('Erreur', 'Impossible de charger les réunions');
    } finally {
      setLoadingReunions(false);
    }
  };

  const loadCompteRenduComplet = async (reunion: Reunion) => {
    try {
      setLoading(true);
      console.log('=== DÉBUT CHARGEMENT COMPTE-RENDU ===');
      console.log('Réunion sélectionnée:', reunion);

      // ÉTAPE 1 : Récupérer les données de base de la réunion
      const reunionData = await apiService.getReunionDetails(club.id, reunion.id);
      console.log('Données de base reçues:', reunionData);

      // ÉTAPE 2 : Charger le contenu pour chaque ordre du jour
      const { ordresAvecContenu, diversExistant } = await rapportService.getAllRapportsForReunion(
        club.id,
        reunion.id,
        reunionData.ordresDuJour || reunion.ordresDuJour || []
      );

      // ÉTAPE 3 : Construire l'objet final
      const compteRenduComplet: CompteRenduComplet = {
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
          totalParticipants: (reunionData.presences || reunion.presences || []).length + 
                           (reunionData.invites || reunion.invites || []).length,
          totalOrdresDuJour: ordresAvecContenu.length,
          ordresAvecContenu: ordresAvecContenu.filter(o => o.hasContent).length
        }
      };

      console.log('=== COMPTE-RENDU COMPLET CONSTRUIT ===');
      console.log('Statistiques:', compteRenduComplet.statistiques);
      
      setCompteRendu(compteRenduComplet);
      setSelectedReunion(reunion);

    } catch (error: any) {
      console.error('❌ Erreur lors du chargement du compte-rendu:', error);
      Alert.alert('Erreur', 'Impossible de charger le compte-rendu de cette réunion');
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

  const renderReunionSelector = () => (
    <TouchableOpacity
      style={styles.reunionSelector}
      onPress={() => setShowReunionModal(true)}
    >
      <View style={styles.selectorContent}>
        <Text style={styles.selectorLabel}>Réunion sélectionnée</Text>
        <Text style={styles.selectorValue}>
          {selectedReunion 
            ? `${formatDate(selectedReunion.date)} - ${selectedReunion.typeReunionLibelle}`
            : 'Choisir une réunion'
          }
        </Text>
      </View>
      <Ionicons name="chevron-down" size={20} color="#666" />
    </TouchableOpacity>
  );

  const renderReunionModal = () => (
    <Modal
      visible={showReunionModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowReunionModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sélectionner une réunion</Text>
            <TouchableOpacity onPress={() => setShowReunionModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.reunionList}>
            {reunions.map((reunion) => (
              <TouchableOpacity
                key={reunion.id}
                style={styles.reunionItem}
                onPress={() => {
                  setShowReunionModal(false);
                  loadCompteRenduComplet(reunion);
                }}
              >
                <Text style={styles.reunionDate}>{formatDate(reunion.date)}</Text>
                <Text style={styles.reunionType}>{reunion.typeReunionLibelle}</Text>
                <Text style={styles.reunionTime}>{reunion.heure} • {reunion.lieu}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Comptes-Rendus</Text>
          <Text style={styles.subtitle}>{club.name}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Sélecteur de réunion */}
        {renderReunionSelector()}

        {/* Chargement */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#005AA9" />
            <Text style={styles.loadingText}>Chargement du compte-rendu...</Text>
          </View>
        )}

        {/* Compte-rendu */}
        {compteRendu && !loading && (
          <View style={styles.compteRenduContainer}>
            {/* Informations générales */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📅 Informations de la réunion</Text>
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>Date: {formatDate(compteRendu.reunion.date)}</Text>
                <Text style={styles.infoText}>Heure: {compteRendu.reunion.heure}</Text>
                <Text style={styles.infoText}>Type: {compteRendu.reunion.typeReunion}</Text>
                {compteRendu.reunion.lieu && (
                  <Text style={styles.infoText}>Lieu: {compteRendu.reunion.lieu}</Text>
                )}
              </View>
            </View>

            {/* Statistiques */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Statistiques</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{compteRendu.statistiques.totalPresences}</Text>
                  <Text style={styles.statLabel}>Présents</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{compteRendu.statistiques.totalInvites}</Text>
                  <Text style={styles.statLabel}>Invités</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{compteRendu.statistiques.ordresAvecContenu}</Text>
                  <Text style={styles.statLabel}>Ordres traités</Text>
                </View>
              </View>
            </View>

            {/* Présences */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                👥 Présences ({compteRendu.statistiques.totalPresences})
              </Text>
              <View style={styles.listCard}>
                {compteRendu.presences.map((presence, index) => (
                  <Text key={presence.membreId} style={styles.listItem}>
                    • {presence.nomComplet}
                  </Text>
                ))}
              </View>
            </View>

            {/* Invités */}
            {compteRendu.invites.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  🎯 Invités ({compteRendu.statistiques.totalInvites})
                </Text>
                <View style={styles.listCard}>
                  {compteRendu.invites.map((invite) => (
                    <View key={invite.id} style={styles.inviteItem}>
                      <Text style={styles.inviteName}>
                        • {invite.prenom} {invite.nom}
                      </Text>
                      {invite.organisation && (
                        <Text style={styles.inviteOrg}>  {invite.organisation}</Text>
                      )}
                      {invite.email && (
                        <Text style={styles.inviteEmail}>  {invite.email}</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Ordres du jour */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                📋 Ordres du jour ({compteRendu.statistiques.totalOrdresDuJour})
              </Text>
              {compteRendu.ordresDuJour.map((ordre) => (
                <View key={ordre.id} style={styles.ordreCard}>
                  <View style={styles.ordreHeader}>
                    <Text style={styles.ordreTitle}>
                      {ordre.numero}. {ordre.description}
                    </Text>
                    {ordre.hasContent ? (
                      <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                    ) : (
                      <Ionicons name="alert-circle" size={20} color="#FF9500" />
                    )}
                  </View>
                  {ordre.contenu ? (
                    <Text style={styles.ordreContent}>{ordre.contenu}</Text>
                  ) : (
                    <Text style={styles.ordreNoContent}>
                      📝 Aucun contenu enregistré pour cet ordre du jour
                    </Text>
                  )}
                </View>
              ))}
            </View>

            {/* Points divers */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 Points divers</Text>
              <View style={styles.diversCard}>
                {compteRendu.divers ? (
                  <Text style={styles.diversContent}>{compteRendu.divers}</Text>
                ) : (
                  <Text style={styles.diversNoContent}>
                    Aucun point divers enregistré pour cette réunion.
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* État initial */}
        {!selectedReunion && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text" size={80} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>Aucune réunion sélectionnée</Text>
            <Text style={styles.emptySubtitle}>
              Sélectionnez une réunion pour voir son compte-rendu
            </Text>
          </View>
        )}
      </ScrollView>

      {renderReunionModal()}
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
  content: {
    flex: 1,
    padding: 15,
  },
  reunionSelector: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectorContent: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  selectorValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  reunionList: {
    maxHeight: 400,
  },
  reunionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reunionDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  reunionType: {
    fontSize: 14,
    color: '#005AA9',
    marginBottom: 2,
  },
  reunionTime: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  compteRenduContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#005AA9',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  listCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  inviteItem: {
    marginBottom: 8,
  },
  inviteName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  inviteOrg: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  inviteEmail: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 2,
  },
  ordreCard: {
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
  ordreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ordreTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  ordreContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  ordreNoContent: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  diversCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
