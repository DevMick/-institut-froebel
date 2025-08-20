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
import { User, Club, Member } from '../types';

interface SituationCotisationScreenProps {
  user: User;
  club: Club;
  onBack: () => void;
}

export const SituationCotisationScreen: React.FC<SituationCotisationScreenProps> = ({ user, club, onBack }) => {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [messagePersonnalise, setMessagePersonnalise] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [showMembersModal, setShowMembersModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const apiService = new ApiService();

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async (): Promise<void> => {
    try {
      const membersData = await apiService.getClubMembers(club.id);
      // Filtrer pour exclure l'utilisateur connecté
      const otherMembers = membersData.filter(member => member.id !== user.id);
      setMembers(otherMembers);
    } catch (error) {
      console.error('Erreur chargement membres:', error);
      Alert.alert('Erreur', 'Impossible de charger les membres');
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

  const handleSendSituation = async (): Promise<void> => {
    if (selectedMembers.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins un membre');
      return;
    }

    try {
      setSending(true);

      const emailData = {
        clubId: club.id,
        membresIds: selectedMembers
      };

      const result = await apiService.sendSituationCotisation(emailData);
      
      if (result.success) {
        const selectedMembersInfo = members
          .filter(member => selectedMembers.includes(member.id))
          .map(member => `• ${member.firstName} ${member.lastName}`)
          .join('\n');
      
        const successMessage = `🎉 **Situation de cotisation envoyée avec succès !**

📧 **Destinataires :** ${result.statistiques.emailsEnvoyes} membre(s)
❌ **Échecs :** ${result.statistiques.emailsEchoues}
📊 **Taux de réussite :** ${result.statistiques.tauxReussite}%

👥 **Membres contactés :**
${selectedMembersInfo}

🕐 **Envoyé le :** ${new Date().toLocaleString('fr-FR')}

✅ Les situations de cotisation ont été transmises avec succès aux destinataires sélectionnés.`;

        Alert.alert(
          '✅ Succès !',
          successMessage,
          [
            {
              text: 'Retour au menu',
              onPress: () => {
                setMessagePersonnalise('');
                setSelectedMembers([]);
                onBack();
              }
            }
          ]
        );
      } else {
        Alert.alert('Erreur', result.message || 'Erreur lors de l\'envoi de la situation');
      }
    } catch (error) {
      console.error('❌ Erreur envoi situation:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Erreur lors de l\'envoi de la situation');
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Situation Cotisation</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Carte d'information */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="document-text" size={24} color="#005AA9" />
            <Text style={styles.infoTitle}>Envoi Situation de Cotisation</Text>
          </View>
          <Text style={styles.infoDescription}>
            Envoyez la situation de cotisation par email aux membres sélectionnés.
            Chaque membre recevra un relevé détaillé de ses cotisations et paiements.
          </Text>
        </View>

        {/* Message personnalisé */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message personnalisé (optionnel)</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Ajouter un message personnalisé à la situation..."
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
          onPress={handleSendSituation}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="mail" size={20} color="white" />
              <Text style={styles.sendButtonText}>
                Envoyer Situation
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {renderMembersModal()}
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
    fontWeight: '600',
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
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
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
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 15,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 5,
  },
  membersList: {
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
    backgroundColor: '#E3F2FD',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberInitials: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 12,
    color: '#666',
  },
  memberEmailDisabled: {
    color: '#005AA9',
    fontStyle: 'italic',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  noEmailIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalFooter: {
    backgroundColor: 'white',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedCount: {
    fontSize: 14,
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
