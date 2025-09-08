import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Club, User } from '../types';
import { cotisationService, SituationCotisation, Paiement } from '../services/CotisationService';

interface CotisationsScreenProps {
  club: Club;
  user: User;
  onBack: () => void;
}

export default function CotisationsScreen({ club, user, onBack }: CotisationsScreenProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [situation, setSituation] = useState<SituationCotisation | null>(null);
  const [showPaiements, setShowPaiements] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement données cotisations...');
      
      // Charger ma situation (inclut déjà les paiements)
      const maSituation = await cotisationService.getMaSituation(club.id, user.id);
      setSituation(maSituation);
      
      console.log('✅ Données cotisations chargées');
    } catch (error: any) {
      console.error('❌ Erreur chargement cotisations:', error);
      Alert.alert('Erreur', 'Impossible de charger les données de cotisations');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [club.id, user.id]);

  const renderSituationCard = () => {
    if (!situation) {
      return (
        <View style={styles.card}>
          <Text style={styles.noDataText}>Aucune donnée de cotisation disponible</Text>
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="wallet" size={24} color="#005AA9" />
          <Text style={styles.cardTitle}>Ma situation</Text>
        </View>
        
        <View style={styles.situationRow}>
          <Text style={styles.situationLabel}>Montant total dû:</Text>
          <Text style={styles.situationValue}>
            {cotisationService.formatMontant(situation.resume.montantTotalCotisations)}
          </Text>
        </View>

        <View style={styles.situationRow}>
          <Text style={styles.situationLabel}>Montant total payé:</Text>
          <Text style={[styles.situationValue, { color: '#34C759' }]}>
            {cotisationService.formatMontant(situation.resume.montantTotalPaiements)}
          </Text>
        </View>

        <View style={styles.situationRow}>
          <Text style={styles.situationLabel}>Solde restant:</Text>
          <Text style={[
            styles.situationValue,
            { color: situation.resume.solde > 0 ? '#FF3B30' : '#34C759' }
          ]}>
            {cotisationService.formatMontant(situation.resume.solde)}
          </Text>
        </View>

        <View style={styles.situationRow}>
          <Text style={styles.situationLabel}>Taux de recouvrement:</Text>
          <Text style={[styles.situationValue, { color: '#005AA9' }]}>
            {situation.resume.tauxRecouvrement.toFixed(1)}%
          </Text>
        </View>

        <View style={styles.statutContainer}>
          <Text style={styles.situationLabel}>Statut:</Text>
          <View style={[
            styles.statutBadge,
            { backgroundColor: situation.resume.solde <= 0 ? '#34C759' : situation.resume.montantTotalPaiements > 0 ? '#FF9500' : '#FF3B30' }
          ]}>
            <Text style={styles.statutText}>
              {situation.resume.solde <= 0 ? 'À jour' : situation.resume.montantTotalPaiements > 0 ? 'Partiellement payé' : 'En retard'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPaiementsSection = () => {
    return (
      <View style={styles.card}>
        <TouchableOpacity 
          style={styles.cardHeader}
          onPress={() => setShowPaiements(!showPaiements)}
        >
          <Ionicons name="receipt" size={24} color="#005AA9" />
          <Text style={styles.cardTitle}>Mes paiements ({situation?.historiquePaiements.length || 0})</Text>
          <Ionicons 
            name={showPaiements ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#666" 
          />
        </TouchableOpacity>
        
        {showPaiements && (
          <View style={styles.paiementsContainer}>
            {!situation?.historiquePaiements || situation.historiquePaiements.length === 0 ? (
              <Text style={styles.noDataText}>Aucun paiement enregistré</Text>
            ) : (
              situation.historiquePaiements.map((paiement, index) => (
                <View key={paiement.id || index} style={styles.paiementCard}>
                  <View style={styles.paiementHeader}>
                    <Text style={styles.paiementMontant}>
                      {cotisationService.formatMontant(paiement.montant)}
                    </Text>
                    <Text style={styles.paiementDate}>
                      {cotisationService.formatDate(paiement.date)}
                    </Text>
                  </View>
                  {paiement.commentaires && (
                    <Text style={styles.paiementCommentaire}>
                      {paiement.commentaires}
                    </Text>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Mes cotisations</Text>
          <Text style={styles.subtitle}>{club.name}</Text>
        </View>
      </View>

      {renderSituationCard()}
      {renderPaiementsSection()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#005AA9',
    padding: 20,
    paddingTop: 60,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  situationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  situationLabel: {
    fontSize: 16,
    color: '#666',
  },
  situationValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statutContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  statutBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  paiementsContainer: {
    marginTop: 10,
  },
  paiementCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  paiementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paiementMontant: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34C759',
  },
  paiementDate: {
    fontSize: 14,
    color: '#666',
  },
  paiementCommentaire: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
