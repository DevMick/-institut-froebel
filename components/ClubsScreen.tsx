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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Club } from '../types';
import { ApiService } from '../services/ApiService';

interface ClubsScreenProps {
  onBack: () => void;
}

export const ClubsScreen: React.FC<ClubsScreenProps> = ({ onBack }) => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const apiService = new ApiService();

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des clubs...');
      const clubsData = await apiService.getClubs();
      console.log('✅ Clubs chargés:', clubsData.length);
      setClubs(clubsData);
    } catch (error: any) {
      console.error('❌ Erreur chargement clubs:', error);
      Alert.alert('Erreur', 'Impossible de charger les clubs');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'Non définie';
    return timeString;
  };

  const filteredClubs = clubs.filter(club => {
    return (
      (club.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (club.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (club.phoneNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (club.address || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleClubPress = (club: Club) => {
    setSelectedClub(club);
    setShowDetailModal(true);
  };

  const renderClub = ({ item }: { item: Club }) => (
    <TouchableOpacity
      style={styles.clubCard}
      onPress={() => handleClubPress(item)}
    >
      {/* Header avec nom et icône */}
      <View style={styles.clubHeader}>
        <View style={styles.clubIcon}>
          <Ionicons name="business" size={24} color="#005AA9" />
        </View>
        <View style={styles.clubInfo}>
          <Text style={styles.clubName}>{item.name || 'Sans nom'}</Text>
          <Text style={styles.clubNumber}>N° {item.code || 'Non défini'}</Text>
        </View>
      </View>

      {/* Contact */}
      <View style={styles.contactSection}>
        <View style={styles.contactItem}>
          <Ionicons name="mail" size={16} color="#005AA9" />
          <Text style={styles.contactText}>{item.email || 'Non défini'}</Text>
        </View>
        <View style={styles.contactItem}>
          <Ionicons name="call" size={16} color="#34C759" />
          <Text style={styles.contactText}>{item.phoneNumber || 'Non défini'}</Text>
        </View>
      </View>

      {/* Réunions */}
      <View style={styles.meetingSection}>
        <View style={styles.meetingItem}>
          <Ionicons name="calendar" size={16} color="#005AA9" />
          <Text style={styles.meetingText}>Jour: {item.foundedDate || 'Non défini'}</Text>
        </View>
        <View style={styles.meetingItem}>
          <Ionicons name="time" size={16} color="#34C759" />
          <Text style={styles.meetingText}>Heure: {formatTime(item.foundedDate)}</Text>
        </View>
      </View>

      {/* Lieu */}
      <View style={styles.locationSection}>
        <Ionicons name="location" size={16} color="#005AA9" />
        <Text style={styles.locationText}>{item.address || 'Non défini'}</Text>
      </View>

      {/* Bouton pour voir les détails */}
      <View style={styles.clubFooter}>
        <Text style={styles.detailsText}>Voir les détails</Text>
        <Ionicons name="chevron-forward" size={20} color="#005AA9" />
      </View>
    </TouchableOpacity>
  );

  const renderDetailModal = () => {
    if (!selectedClub) return null;

    return (
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Détails du club</Text>
            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Nom du club */}
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Nom du club</Text>
              <View style={styles.detailValue}>
                <Ionicons name="business" size={20} color="#005AA9" />
                <Text style={styles.detailText}>{selectedClub.name}</Text>
              </View>
            </View>

            {/* Numéro du club */}
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Numéro du club</Text>
              <View style={styles.detailValue}>
                <Ionicons name="business" size={20} color="#005AA9" />
                <Text style={styles.detailText}>{selectedClub.code || 'Non défini'}</Text>
              </View>
            </View>

            {/* Email */}
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Email</Text>
              <View style={styles.detailValue}>
                <Ionicons name="mail" size={20} color="#005AA9" />
                <Text style={styles.detailText}>{selectedClub.email || 'Non défini'}</Text>
              </View>
            </View>

            {/* Téléphone */}
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Téléphone</Text>
              <View style={styles.detailValue}>
                <Ionicons name="call" size={20} color="#34C759" />
                <Text style={styles.detailText}>{selectedClub.phoneNumber || 'Non défini'}</Text>
              </View>
            </View>

            {/* Date de création */}
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Date de création</Text>
              <View style={styles.detailValue}>
                <Ionicons name="calendar" size={20} color="#005AA9" />
                <Text style={styles.detailText}>{selectedClub.foundedDate || 'Non définie'}</Text>
              </View>
            </View>

            {/* Ville */}
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Ville</Text>
              <View style={styles.detailValue}>
                <Ionicons name="location" size={20} color="#005AA9" />
                <Text style={styles.detailText}>{selectedClub.city || 'Non définie'}</Text>
              </View>
            </View>

            {/* Pays */}
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Pays</Text>
              <View style={styles.detailValue}>
                <Ionicons name="flag" size={20} color="#005AA9" />
                <Text style={styles.detailText}>{selectedClub.country || 'Non défini'}</Text>
              </View>
            </View>

            {/* Adresse */}
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Adresse</Text>
              <View style={styles.detailValue}>
                <Ionicons name="home" size={20} color="#005AA9" />
                <Text style={styles.detailText}>{selectedClub.address || 'Non définie'}</Text>
              </View>
            </View>

            {/* Site web */}
            <View style={styles.detailCard}>
              <Text style={styles.detailLabel}>Site web</Text>
              <View style={styles.detailValue}>
                <Ionicons name="globe" size={20} color="#005AA9" />
                <Text style={styles.detailText}>{selectedClub.website || 'Non défini'}</Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  // Calcul des statistiques
  const totalClubs = filteredClubs.length;
  const clubsActifs = filteredClubs.filter(c => c.isActive).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Clubs Rotary</Text>
          <Text style={styles.subtitle}>Liste des clubs</Text>
        </View>
      </View>

      {/* Recherche */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un club..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </View>

      {/* Statistiques */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalClubs}</Text>
          <Text style={styles.statLabel}>Total clubs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{clubsActifs}</Text>
          <Text style={styles.statLabel}>Clubs actifs</Text>
        </View>
      </View>

      {/* Liste des clubs */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#005AA9" />
          <Text style={styles.loadingText}>Chargement des clubs...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredClubs}
          renderItem={renderClub}
          keyExtractor={(item) => item.id}
          style={styles.clubsList}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadClubs}
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
  searchContainer: {
    padding: 15,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 15,
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
  clubsList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  clubCard: {
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
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  clubIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  clubNumber: {
    fontSize: 14,
    color: '#666',
  },
  contactSection: {
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  meetingSection: {
    marginBottom: 12,
  },
  meetingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  meetingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  clubFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailsText: {
    fontSize: 14,
    color: '#005AA9',
    fontWeight: '600',
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
  detailCard: {
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
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
});
