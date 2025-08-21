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
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Picker removed - using custom dropdown instead
import { User, Club, Member, Reunion } from '../types';
import { ApiService } from '../services/ApiService';

interface CompteRenduScreenProps {
  user: User;
  club: Club;
  onBack: () => void;
}

export const CompteRenduScreen: React.FC<CompteRenduScreenProps> = ({
  user,
  club,
  onBack,
}) => {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [reunions, setReunions] = useState<Reunion[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedReunion, setSelectedReunion] = useState<string>('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showReunionDropdown, setShowReunionDropdown] = useState(false);

  const apiService = new ApiService();

  useEffect(() => {
    loadData();
  }, [club.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des données...');
      
      // Charger les réunions
      await loadReunions();
      
      // Charger les membres
      await loadMembers();
      
      console.log('✅ Données chargées');
    } catch (error: any) {
      console.error('❌ Erreur chargement données:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const loadReunions = async () => {
    try {
      const reunionsData = await apiService.getClubReunions(club.id);
      // Filtrer les réunions passées (pour avoir des comptes rendus)
      const maintenant = new Date();
      const reunionsPassees = reunionsData.filter(reunion => {
        const dateReunion = new Date(reunion.date);
        return dateReunion < maintenant;
      });
      setReunions(reunionsPassees);
      if (reunionsPassees.length > 0) {
        setSelectedReunion(reunionsPassees[0].id);
      } else {
        setSelectedReunion('');
      }
    } catch (error: any) {
      console.error('Erreur chargement réunions:', error);
      setReunions([]);
      setSelectedReunion('');
    }
  };

  const loadMembers = async () => {
    try {
      const membersData = await apiService.getClubMembers(club.id);
      setMembers(membersData);
      setSelectedMembers([]);
    } catch (error: any) {
      console.error('Erreur chargement membres:', error);
      setMembers([]);
      setSelectedMembers([]);
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const selectAllMembers = () => {
    setSelectedMembers(members.map(member => member.id));
  };

  const deselectAllMembers = () => {
    setSelectedMembers([]);
  };

  const closeAllDropdowns = () => {
    setShowReunionDropdown(false);
  };

  const filteredMembers = members.filter(member =>
    member.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
    member.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
    member.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSendCompteRendu = async () => {
    if (!selectedReunion || selectedMembers.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner une réunion et au moins un membre');
      return;
    }

    try {
      setSending(true);
      
      const response = await apiService.sendCompteRendu({
        clubId: club.id,
        reunionId: selectedReunion,
        membresIds: selectedMembers,
      });

      if (response.success) {
        const selectedMembersInfo = members
          .filter(member => selectedMembers.includes(member.id))
          .map(member => `• ${member.firstName} ${member.lastName}`)
          .join('\n');
        
        Alert.alert(
          'Succès',
          `🎉 **Compte rendu envoyé avec succès !**\n\n📧 **Destinataires :** ${response.statistiques.emailsEnvoyes} membre(s)\n💯 **Taux de réussite :** ${response.statistiques.tauxReussite}%\n\n**Membres sélectionnés :**\n${selectedMembersInfo}`,
          [{ text: 'OK' }]
        );
        
        // Réinitialiser les sélections
        setSelectedMembers([]);
      } else {
        Alert.alert('Erreur', response.message || 'Erreur lors de l\'envoi du compte rendu');
      }
    } catch (error: any) {
      console.error('Erreur envoi compte rendu:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le compte rendu');
    } finally {
      setSending(false);
    }
  };

  const selectedReunionData = reunions.find(r => r.id === selectedReunion);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Compte Rendu de Réunion</Text>
        <View style={styles.placeholder} />
      </View>

      <TouchableWithoutFeedback onPress={closeAllDropdowns}>
        <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#005AA9" />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : (
          <>
            {/* Club Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Club</Text>
              <View style={styles.clubInfo}>
                <Ionicons name="business" size={20} color="#005AA9" />
                <Text style={styles.clubName}>{club.name}</Text>
              </View>
            </View>

            {/* Sélection de la Réunion */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Réunion</Text>
              {reunions.length === 0 ? (
                <Text style={styles.noDataText}>
                  Aucune réunion passée trouvée pour ce club
                </Text>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.dropdownContainer}
                    onPress={() => setShowReunionDropdown(!showReunionDropdown)}
                  >
                    <Text style={styles.dropdownText}>
                      {selectedReunion ? 
                        (() => {
                          const reunion = reunions.find(r => r.id === selectedReunion);
                          return reunion ? `${reunion.typeReunionLibelle} - ${new Date(reunion.date).toLocaleDateString()}` : 'Sélectionner une réunion';
                        })() 
                        : 'Sélectionner une réunion'
                      }
                    </Text>
                    <Ionicons name={showReunionDropdown ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                  </TouchableOpacity>
                  
                  {showReunionDropdown && (
                    <View style={styles.dropdownList}>
                      {reunions.map(reunion => (
                        <TouchableOpacity
                          key={reunion.id}
                          style={[
                            styles.dropdownItem,
                            selectedReunion === reunion.id && styles.dropdownItemSelected
                          ]}
                          onPress={() => {
                            setSelectedReunion(reunion.id);
                            setShowReunionDropdown(false);
                          }}
                        >
                          <Text style={[
                            styles.dropdownItemText,
                            selectedReunion === reunion.id && styles.dropdownItemTextSelected
                          ]}>
                            {reunion.typeReunionLibelle} - {new Date(reunion.date).toLocaleDateString()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Informations de la réunion sélectionnée */}
            {selectedReunionData && (
              <View style={styles.reunionInfo}>
                <Text style={styles.reunionInfoTitle}>Détails de la réunion</Text>
                <Text style={styles.reunionInfoText}>
                  <Text style={styles.label}>Type:</Text> {selectedReunionData.typeReunionLibelle}
                </Text>
                <Text style={styles.reunionInfoText}>
                  <Text style={styles.label}>Date:</Text> {new Date(selectedReunionData.date).toLocaleDateString()}
                </Text>
                <Text style={styles.reunionInfoText}>
                  <Text style={styles.label}>Heure:</Text> {selectedReunionData.heure}
                </Text>
                {selectedReunionData.lieu && (
                  <Text style={styles.reunionInfoText}>
                    <Text style={styles.label}>Lieu:</Text> {selectedReunionData.lieu}
                  </Text>
                )}
                {selectedReunionData.description && (
                  <Text style={styles.reunionInfoText}>
                    <Text style={styles.label}>Description:</Text> {selectedReunionData.description}
                  </Text>
                )}
              </View>
            )}

            {/* Sélection des Membres */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Membres ({selectedMembers.length} sélectionné(s))</Text>
                <View style={styles.selectionButtons}>
                  <TouchableOpacity
                    style={styles.selectionButton}
                    onPress={selectAllMembers}
                  >
                    <Text style={styles.selectionButtonText}>Tout sélectionner</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.selectionButton}
                    onPress={deselectAllMembers}
                  >
                    <Text style={styles.selectionButtonText}>Tout désélectionner</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Barre de recherche */}
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un membre..."
                value={searchText}
                onChangeText={setSearchText}
              />

              {/* Liste des membres */}
              <View style={styles.membersList}>
                {filteredMembers.map(member => (
                  <TouchableOpacity
                    key={member.id}
                    style={[
                      styles.memberItem,
                      selectedMembers.includes(member.id) && styles.memberItemSelected
                    ]}
                    onPress={() => toggleMemberSelection(member.id)}
                  >
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>
                        {member.firstName} {member.lastName}
                      </Text>
                      <Text style={styles.memberEmail}>{member.email}</Text>
                    </View>
                    <View style={styles.checkbox}>
                      {selectedMembers.includes(member.id) && (
                        <Ionicons name="checkmark-circle" size={24} color="#005AA9" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Bouton d'envoi */}
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!selectedReunion || selectedMembers.length === 0 || sending) && styles.sendButtonDisabled
              ]}
              onPress={handleSendCompteRendu}
              disabled={!selectedReunion || selectedMembers.length === 0 || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={20} color="white" />
              )}
              <Text style={styles.sendButtonText}>
                {sending ? 'Envoi en cours...' : 'Envoyer le Compte Rendu'}
              </Text>
            </TouchableOpacity>
          </>
        )}
        </ScrollView>
      </TouchableWithoutFeedback>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  clubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#005AA9',
  },
  clubName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#005AA9',
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 50,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
    marginTop: 4,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownItemTextSelected: {
    color: '#1976d2',
    fontWeight: 'bold',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  reunionInfo: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  reunionInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976d2',
  },
  reunionInfoText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  label: {
    fontWeight: 'bold',
  },
  selectionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  selectionButton: {
    backgroundColor: '#005AA9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  selectionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  membersList: {
    maxHeight: 300,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#005AA9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 32,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
