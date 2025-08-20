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
  Switch,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../services/ApiService';
import { User, Club, Member } from '../types';

interface CalendrierScreenProps {
  user: User;
  club: Club;
  onBack: () => void;
}

interface Month {
  value: number;
  label: string;
}

export const CalendrierScreen: React.FC<CalendrierScreenProps> = ({ user, club, onBack }) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [messagePersonnalise, setMessagePersonnalise] = useState<string>('');
  const [envoyerATousLesMembres, setEnvoyerATousLesMembres] = useState<boolean>(true);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [sending, setSending] = useState<boolean>(false);
  const [showMembersModal, setShowMembersModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const apiService = new ApiService();

  const months: Month[] = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' },
  ];

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

  const handleSendCalendrier = async (): Promise<void> => {
    try {
      setSending(true);

      // Préparer les données pour l'envoi
      const emailData = {
        clubId: club.id,
        mois: selectedMonth,
        messagePersonnalise: messagePersonnalise.trim(),
        envoyerATousLesMembres: envoyerATousLesMembres,
        membresIds: selectedMembers
      };

      // Appel à l'API pour envoyer le calendrier
      const result = await apiService.sendCalendrier(emailData);
      
      if (result.success) {
        const successMessage = `🎉 **Calendrier envoyé avec succès !**

📅 **Mois :** ${result.nomMois}
📧 **Destinataires :** ${result.nombreDestinataires} membre(s)
📋 **Événements :** ${result.nombreEvenements} événement(s)
🏢 **Club :** ${result.clubNom}

🕐 **Envoyé le :** ${new Date().toLocaleString('fr-FR')}

✅ Le calendrier du mois de ${result.nomMois} a été transmis avec succès aux destinataires.`;

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
        Alert.alert('Erreur', result.message || 'Erreur lors de l\'envoi du calendrier');
      }
    } catch (error) {
      console.error('❌ Erreur envoi calendrier:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Erreur lors de l\'envoi du calendrier');
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

  const renderMonthSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Mois du calendrier</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.monthSelector}
      >
        {months.map((month) => (
          <TouchableOpacity
            key={month.value}
            style={[
              styles.monthButton,
              selectedMonth === month.value && styles.monthButtonSelected
            ]}
            onPress={() => setSelectedMonth(month.value)}
          >
            <Text style={[
              styles.monthButtonText,
              selectedMonth === month.value && styles.monthButtonTextSelected
            ]}>
              {month.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendrier Mensuel</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Carte d'information */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="calendar" size={24} color="#005AA9" />
            <Text style={styles.infoTitle}>Envoi Calendrier Mensuel</Text>
          </View>
          <Text style={styles.infoDescription}>
            Envoyez le calendrier des événements du mois par email aux membres du club.
            Le calendrier inclut les réunions, événements et anniversaires.
          </Text>
        </View>

        {/* Sélecteur de mois */}
        {renderMonthSelector()}

        {/* Message personnalisé */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message personnalisé (optionnel)</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Ajouter un message personnalisé au calendrier..."
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
          
          {/* Option tous les membres */}
          <View style={styles.optionRow}>
            <View style={styles.optionContent}>
              <Ionicons name="people" size={20} color="#005AA9" />
              <Text style={styles.optionText}>Envoyer à tous les membres du club</Text>
            </View>
            <Switch
              value={envoyerATousLesMembres}
              onValueChange={setEnvoyerATousLesMembres}
              trackColor={{ false: '#767577', true: '#005AA9' }}
              thumbColor={envoyerATousLesMembres ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          {/* Sélection de membres spécifiques */}
          {!envoyerATousLesMembres && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Membres spécifiques</Text>
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
          )}
        </View>
      </ScrollView>

      {/* Footer avec bouton d'envoi */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          onPress={handleSendCalendrier}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="mail" size={20} color="white" />
              <Text style={styles.sendButtonText}>
                Envoyer Calendrier {months[selectedMonth - 1]?.label}
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
  monthSelector: {
    marginBottom: 10,
  },
  monthButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  monthButtonSelected: {
    backgroundColor: '#005AA9',
    borderColor: '#005AA9',
  },
  monthButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  monthButtonTextSelected: {
    color: 'white',
    fontWeight: '600',
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
  optionRow: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 15,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
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
