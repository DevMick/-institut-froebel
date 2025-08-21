import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../services/ApiService';
import { User, Club, Member, Reunion } from '../types';

interface CompteRenduScreenProps {
  user: User;
  club: Club;
  onBack: () => void;
}

export const CompteRenduScreen: React.FC<CompteRenduScreenProps> = ({ user, club, onBack }) => {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [reunions, setReunions] = useState<Reunion[]>([]);
  const [selectedReunion, setSelectedReunion] = useState<string>('');
  const [messagePersonnalise, setMessagePersonnalise] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [showMembersModal, setShowMembersModal] = useState<boolean>(false);
  const [showReunionsModal, setShowReunionsModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const apiService = new ApiService();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('🔄 Chargement des données...');
      
      // Charger les réunions
      const reunionsData = await apiService.getClubReunions(club.id);
      // Filtrer les réunions passées (pour avoir des comptes rendus)
      const maintenant = new Date();
      const reunionsPassees = reunionsData.filter(reunion => {
        const dateReunion = new Date(reunion.date);
        return dateReunion < maintenant;
      });
      setReunions(reunionsPassees);
      
      // Charger les membres
      const membersData = await apiService.getClubMembers(club.id);
      // Filtrer pour exclure l'utilisateur connecté
      const otherMembers = membersData.filter(member => member.id !== user.id);
      setMembers(otherMembers);
      
      console.log('✅ Données chargées');
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    }
  };

  const toggleMemberSelection = (memberId: string): void => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const selectAllMembers = (): void => {
    const allMemberIds = members.map(member => member.id);
    setSelectedMembers(allMemberIds);
  };

  const deselectAllMembers = (): void => {
    setSelectedMembers([]);
  };

  const getFilteredMembers = (): Member[] => {
    if (!searchQuery.trim()) return members;
    return members.filter(member =>
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleSendCompteRendu = async (): Promise<void> => {
    if (!selectedReunion) {
      Alert.alert('Erreur', 'Veuillez sélectionner une réunion');
      return;
    }

    if (selectedMembers.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins un membre');
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
        
        const selectedReunionData = reunions.find(r => r.id === selectedReunion);
        const reunionInfo = selectedReunionData 
          ? `${selectedReunionData.typeReunionLibelle} - ${new Date(selectedReunionData.date).toLocaleDateString()}`
          : 'Réunion sélectionnée';

        const successMessage = `🎉 **Compte rendu envoyé avec succès !**

📅 **Réunion :** ${reunionInfo}
📧 **Destinataires :** ${response.statistiques.emailsEnvoyes} membre(s)
❌ **Échecs :** ${response.statistiques.emailsEchoues}
📊 **Taux de réussite :** ${response.statistiques.tauxReussite}%

👥 **Membres contactés :**
${selectedMembersInfo}

🕐 **Envoyé le :** ${new Date().toLocaleString('fr-FR')}

✅ Le compte rendu de réunion a été transmis avec succès aux destinataires sélectionnés.`;

        Alert.alert(
          '✅ Succès !',
          successMessage,
          [
            {
              text: 'Retour au menu',
              onPress: () => {
                setMessagePersonnalise('');
                setSelectedMembers([]);
                setSelectedReunion('');
                onBack();
              }
            }
          ]
        );
      } else {
        Alert.alert('Erreur', response.message || 'Erreur lors de l\'envoi du compte rendu');
      }
    } catch (error) {
      console.error('❌ Erreur envoi compte rendu:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Erreur lors de l\'envoi du compte rendu');
    } finally {
      setSending(false);
    }
  };

  const renderMemberItem = ({ item: member }: { item: Member }) => {
    const isSelected = selectedMembers.includes(member.id);
    const hasEmail = member.email && member.email.trim() !== '';

    return (
      <TouchableOpacity
        style={[
          styles.memberItem,
          isSelected && styles.memberItemSelected,
          !hasEmail && styles.memberItemDisabled
        ]}
        onPress={() => hasEmail && toggleMemberSelection(member.id)}
        disabled={!hasEmail}
      >
        <View style={styles.memberInfo}>
          <View style={styles.memberAvatar}>
            <Text style={styles.memberInitials}>
              {member.firstName?.charAt(0) || ''}{member.lastName?.charAt(0) || ''}
            </Text>
          </View>
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>
              {member.firstName} {member.lastName}
            </Text>
            <Text style={[styles.memberEmail, !hasEmail && styles.memberEmailDisabled]}>
              {hasEmail ? member.email : 'Aucune adresse email'}
            </Text>
          </View>
        </View>
        {hasEmail && (
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
          </View>
        )}
        {!hasEmail && (
          <View style={styles.noEmailIcon}>
            <Ionicons name="warning" size={16} color="#FF9800" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderReunionItem = ({ item: reunion }: { item: Reunion }) => {
    const isSelected = selectedReunion === reunion.id;

    return (
      <TouchableOpacity
        style={[
          styles.reunionItem,
          isSelected && styles.reunionItemSelected
        ]}
        onPress={() => {
          setSelectedReunion(reunion.id);
          setShowReunionsModal(false);
        }}
      >
        <View style={styles.reunionInfo}>
          <View style={styles.reunionAvatar}>
            <Ionicons name="calendar" size={20} color="#005AA9" />
          </View>
          <View style={styles.reunionDetails}>
            <Text style={styles.reunionTitle}>
              {reunion.typeReunionLibelle}
            </Text>
            <Text style={styles.reunionDate}>
              {new Date(reunion.date).toLocaleDateString()} à {reunion.heure}
            </Text>
            {reunion.lieu && (
              <Text style={styles.reunionLocation}>
                📍 {reunion.lieu}
              </Text>
            )}
          </View>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
        </View>
      </TouchableOpacity>
    );
  };

  const renderMembersModal = () => (
    <Modal
      visible={showMembersModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowMembersModal(false)}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Sélectionner les membres</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.modalSearchContainer}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un membre..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.modalActions}>
          <TouchableOpacity style={styles.actionButton} onPress={selectAllMembers}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.actionButtonText}>Tout sélectionner</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={deselectAllMembers}>
            <Ionicons name="close-circle" size={16} color="#F44336" />
            <Text style={styles.actionButtonText}>Tout désélectionner</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={getFilteredMembers()}
          renderItem={renderMemberItem}
          keyExtractor={(item) => item.id}
          style={styles.membersList}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.modalFooter}>
          <Text style={styles.selectedCount}>
            {selectedMembers.length} membre(s) sélectionné(s)
          </Text>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => setShowMembersModal(false)}
          >
            <Text style={styles.confirmButtonText}>Confirmer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  const renderReunionsModal = () => (
    <Modal
      visible={showReunionsModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowReunionsModal(false)}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Sélectionner une réunion</Text>
          <View style={styles.placeholder} />
        </View>

        <FlatList
          data={reunions}
          renderItem={renderReunionItem}
          keyExtractor={(item) => item.id}
          style={styles.reunionsList}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.modalFooter}>
          <Text style={styles.selectedCount}>
            {selectedReunion ? '1 réunion sélectionnée' : 'Aucune réunion sélectionnée'}
          </Text>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => setShowReunionsModal(false)}
          >
            <Text style={styles.confirmButtonText}>Confirmer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  const selectedReunionData = reunions.find(r => r.id === selectedReunion);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compte Rendu</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Carte d'information */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="document" size={24} color="#005AA9" />
            <Text style={styles.infoTitle}>Envoi Compte Rendu de Réunion</Text>
          </View>
          <Text style={styles.infoDescription}>
            Envoyez le compte rendu d'une réunion passée par email aux membres sélectionnés.
            Chaque membre recevra un résumé détaillé de la réunion.
          </Text>
        </View>

        {/* Sélection de la réunion */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Réunion</Text>
          <TouchableOpacity
            style={styles.recipientsButton}
            onPress={() => setShowReunionsModal(true)}
          >
            <Ionicons name="calendar" size={20} color="#005AA9" />
            <Text style={styles.recipientsText}>
              {selectedReunionData 
                ? `${selectedReunionData.typeReunionLibelle} - ${new Date(selectedReunionData.date).toLocaleDateString()}`
                : 'Sélectionner une réunion'
              }
            </Text>
            <Ionicons name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Message personnalisé */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message personnalisé (optionnel)</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Ajouter un message personnalisé au compte rendu..."
            value={messagePersonnalise}
            onChangeText={setMessagePersonnalise}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Destinataires */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destinataires</Text>
          <TouchableOpacity
            style={styles.recipientsButton}
            onPress={() => setShowMembersModal(true)}
          >
            <Ionicons name="people" size={20} color="#005AA9" />
            <Text style={styles.recipientsText}>
              {selectedMembers.length > 0 
                ? `${selectedMembers.length} membre(s) sélectionné(s)`
                : 'Sélectionner les membres'
              }
            </Text>
            <Ionicons name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer avec bouton d'envoi */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          onPress={handleSendCompteRendu}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="white" />
              <Text style={styles.sendButtonText}>
                Envoyer Compte Rendu
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {renderMembersModal()}
      {renderReunionsModal()}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  messageInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 100,
  },
  recipientsButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  recipientsText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  footer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sendButton: {
    backgroundColor: '#005AA9',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  modalSearchContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#333',
  },
  modalActions: {
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 10,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
  },
  membersList: {
    flex: 1,
  },
  reunionsList: {
    flex: 1,
  },
  memberItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  memberItemDisabled: {
    opacity: 0.6,
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#005AA9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberInitials: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  memberEmailDisabled: {
    color: '#999',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#005AA9',
    borderColor: '#005AA9',
  },
  noEmailIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reunionItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reunionItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  reunionInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reunionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reunionDetails: {
    flex: 1,
  },
  reunionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reunionDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  reunionLocation: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  modalFooter: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  selectedCount: {
    fontSize: 14,
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#005AA9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
