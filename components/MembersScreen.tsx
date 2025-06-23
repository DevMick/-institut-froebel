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
  TextInput,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Member, Club } from '../types';
import { ApiService } from '../services/ApiService';

interface MembersScreenProps {
  club: Club;
  onBack: () => void;
}

export const MembersScreen: React.FC<MembersScreenProps> = ({ club, onBack }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);

  const apiService = new ApiService();

  useEffect(() => {
    loadMembers();
  }, [club.id]);

  useEffect(() => {
    filterMembers();
  }, [members, searchText]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des membres...');
      const membersData = await apiService.getClubMembers(club.id);
      console.log('✅ Membres chargés:', membersData.length);

      // Logs détaillés pour diagnostiquer les fonctions et commissions
      if (membersData.length > 0) {
        console.log('🔍 Premier membre (structure complète):', JSON.stringify(membersData[0], null, 2));

        membersData.forEach((member, index) => {
          console.log(`👤 Membre ${index + 1}: ${member.fullName}`);
          console.log(`  - Fonctions:`, member.fonctions ? member.fonctions.length : 'undefined');
          console.log(`  - Commissions:`, member.commissions ? member.commissions.length : 'undefined');

          if (member.fonctions && member.fonctions.length > 0) {
            console.log(`  - Détail fonctions:`, member.fonctions);
          }

          if (member.commissions && member.commissions.length > 0) {
            console.log(`  - Détail commissions:`, member.commissions);
          }
        });
      }

      setMembers(membersData);
    } catch (error: any) {
      console.error('❌ Erreur chargement membres:', error);
      Alert.alert('Erreur', 'Impossible de charger les membres');
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    if (!searchText.trim()) {
      setFilteredMembers(members);
    } else {
      const filtered = members.filter(member =>
        member.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
        member.email.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredMembers(filtered);
    }
  };

  const handleCall = (phoneNumber?: string) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Alert.alert('Information', 'Numéro de téléphone non disponible');
    }
  };

  const handleSMS = (phoneNumber?: string) => {
    if (phoneNumber) {
      Linking.openURL(`sms:${phoneNumber}`);
    } else {
      Alert.alert('Information', 'Numéro de téléphone non disponible');
    }
  };

  const handleWhatsApp = (phoneNumber?: string) => {
    if (phoneNumber) {
      // Nettoyer le numéro de téléphone
      const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
      Linking.openURL(`whatsapp://send?phone=${cleanNumber}`);
    } else {
      Alert.alert('Information', 'Numéro de téléphone non disponible');
    }
  };

  const renderMember = ({ item }: { item: Member }) => {
    // Logs pour diagnostiquer l'affichage
    console.log(`🎨 Rendu membre: ${item.fullName}`);
    console.log(`  - Fonctions disponibles:`, item.fonctions ? `${item.fonctions.length} fonctions` : 'Aucune');
    console.log(`  - Commissions disponibles:`, item.commissions ? `${item.commissions.length} commissions` : 'Aucune');

    return (
      <View style={styles.memberCard}>
        <View style={styles.memberInfo}>
          <View style={styles.memberHeader}>
            <Text style={styles.memberName}>{item.fullName}</Text>
            {item.isActive && (
              <View style={styles.activeIndicator}>
                <Text style={styles.activeText}>Actif</Text>
              </View>
            )}
          </View>

          {/* Fonctions en premier */}
          {item.fonctions && item.fonctions.length > 0 ? (
            <View style={styles.functionsContainer}>
              <Text style={styles.functionsTitle}>🏛️ Fonctions:</Text>
              {item.fonctions.map((fonction, index) => {
                console.log(`  - Affichage fonction ${index + 1}:`, fonction);
                return (
                  <Text key={index} style={styles.functionText}>
                    • {fonction.comiteNom} {fonction.estResponsable ? '(Responsable)' : ''}
                  </Text>
                );
              })}
            </View>
          ) : (
            <Text style={styles.noDataText}>🏛️ Aucune fonction assignée</Text>
          )}

          {/* Commissions en second */}
          {item.commissions && item.commissions.length > 0 ? (
            <View style={styles.commissionsContainer}>
              <Text style={styles.commissionsTitle}>👥 Commissions:</Text>
              {item.commissions.map((commission, index) => {
                console.log(`  - Affichage commission ${index + 1}:`, commission);
                return (
                  <Text key={index} style={styles.commissionText}>
                    • {commission.commissionNom} {commission.estResponsable ? '(Responsable)' : ''}
                  </Text>
                );
              })}
            </View>
          ) : (
            <Text style={styles.noDataText}>👥 Aucune commission assignée</Text>
          )}

          {/* Téléphone en dernier */}
          {item.phoneNumber && (
            <Text style={styles.memberPhone}>{item.phoneNumber}</Text>
          )}
        </View>

        {item.phoneNumber && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.callButton]}
              onPress={() => handleCall(item.phoneNumber)}
            >
              <Ionicons name="call" size={16} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.smsButton]}
              onPress={() => handleSMS(item.phoneNumber)}
            >
              <Ionicons name="chatbubble" size={16} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.whatsappButton]}
              onPress={() => handleWhatsApp(item.phoneNumber)}
            >
              <Ionicons name="logo-whatsapp" size={16} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

      {item.phoneNumber && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton]}
            onPress={() => handleCall(item.phoneNumber)}
          >
            <Ionicons name="call" size={16} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.smsButton]}
            onPress={() => handleSMS(item.phoneNumber)}
          >
            <Ionicons name="chatbubble" size={16} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.whatsappButton]}
            onPress={() => handleWhatsApp(item.phoneNumber)}
          >
            <Ionicons name="logo-whatsapp" size={16} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Membres</Text>
          <Text style={styles.subtitle}>{club.name}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un membre..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {filteredMembers.length} membre{filteredMembers.length > 1 ? 's' : ''} 
          {searchText ? ' trouvé(s)' : ''} • {members.filter(m => m.isActive).length} actif{members.filter(m => m.isActive).length > 1 ? 's' : ''}
        </Text>
      </View>

      {/* Members List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#005AA9" />
          <Text style={styles.loadingText}>Chargement des membres...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMembers}
          renderItem={renderMember}
          keyExtractor={(item) => item.id}
          style={styles.membersList}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadMembers}
        />
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
  },
  statsContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
  },
  membersList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  memberCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberInfo: {
    flex: 1,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  activeIndicator: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },

  memberPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  functionsContainer: {
    marginTop: 8,
    marginBottom: 5,
  },
  functionsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#005AA9',
    marginBottom: 4,
  },
  functionText: {
    fontSize: 13,
    color: '#333',
    marginLeft: 8,
    marginBottom: 2,
    fontWeight: '500',
  },
  commissionsContainer: {
    marginTop: 5,
    marginBottom: 5,
  },
  commissionsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FF9500',
    marginBottom: 4,
  },
  commissionText: {
    fontSize: 13,
    color: '#333',
    marginLeft: 8,
    marginBottom: 2,
    fontWeight: '500',
  },
  noDataText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 5,
    marginBottom: 5,
  },
  actionButtons: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  callButton: {
    backgroundColor: '#34C759',
  },
  smsButton: {
    backgroundColor: '#007AFF',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
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
});
