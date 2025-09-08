import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import 'moment/locale/fr';
import { Member, User, Club } from '../types';
import { ApiService } from '../services/ApiService';

interface CalendarEmailScreenProps {
  user: User;
  club: Club;
  onBack: () => void;
}

export const CalendarEmailScreen: React.FC<CalendarEmailScreenProps> = ({
  user,
  club,
  onBack,
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Mois actuel (1-12)

  const apiService = new ApiService();

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const membersData = await apiService.getClubMembers(club.id);
      const otherMembers = membersData.filter(member => member.id !== user.id);
      setMembers(otherMembers);
    } catch (error: any) {
      console.error('Erreur chargement membres:', error);
      Alert.alert('Erreur', 'Impossible de charger les membres');
    } finally {
      setLoading(false);
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const selectAllMembers = () => {
    const allMemberIds = members.map(member => member.id);
    setSelectedMembers(allMemberIds);
  };

  const deselectAllMembers = () => {
    setSelectedMembers([]);
  };

  const getSelectedEmails = () => {
    return members
      .filter(member => selectedMembers.includes(member.id))
      .map(member => member.email);
  };

  const getFilteredMembers = () => {
    if (!searchQuery.trim()) return members;
    
    return members.filter(member =>
      member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getMonthName = (month: number) => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[month - 1] || 'Mois inconnu';
  };

  const handleSendCalendar = async () => {
    if (selectedMembers.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins un destinataire');
      return;
    }

    try {
      setSending(true);
      
      const calendarData = {
        subject: `Calendrier Rotary - ${getMonthName(selectedMonth)}`,
        message: `Calendrier des événements du Rotary Club pour le mois de ${getMonthName(selectedMonth)}.`,
        recipients: getSelectedEmails(),
        calendarEvent: {
          title: `Calendrier Rotary - ${getMonthName(selectedMonth)}`,
          description: `Calendrier des événements du Rotary Club pour le mois de ${getMonthName(selectedMonth)}.`,
          startDate: new Date(new Date().getFullYear(), selectedMonth - 1, 1).toISOString(),
          endDate: new Date(new Date().getFullYear(), selectedMonth, 0).toISOString(),
          location: club.name
        }
      };

      await apiService.sendCalendarEmail(calendarData);
      
      const successMessage = `✅ Calendrier envoyé avec succès !
      
📧 Destinataires : ${selectedMembers.length} membre(s)
📅 Mois : ${getMonthName(selectedMonth)}
🕐 Envoyé le : ${new Date().toLocaleString('fr-FR')}

Le calendrier a été transmis à tous les destinataires.`;

      Alert.alert(
        '✅ Merci !',
        'Le calendrier a été envoyé avec succès.',
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedMembers([]);
              onBack();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ Erreur envoi calendrier:', error);
      Alert.alert('Erreur', error.message || 'Erreur lors de l\'envoi du calendrier');
    } finally {
      setSending(false);
    }
  };

  const renderMemberItem = ({ item: member }: { item: Member }) => {
    const isSelected = selectedMembers.includes(member.id);
    return (
      <TouchableOpacity
        style={[styles.memberItem, isSelected && styles.memberItemSelected]}
        onPress={() => toggleMemberSelection(member.id)}
      >
        <View style={styles.memberInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {member.firstName.charAt(0)}{member.lastName.charAt(0)}
            </Text>
          </View>
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>{member.fullName}</Text>
            <Text style={styles.memberEmail}>{member.email}</Text>
            {member.roles && member.roles.length > 0 && (
              <Text style={styles.memberRole}>{member.roles.join(', ')}</Text>
            )}
          </View>
        </View>
        <Ionicons
          name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={isSelected ? '#FF6B35' : '#ccc'}
        />
      </TouchableOpacity>
    );
  };

  const renderMonthSelector = () => {
    const months = [
      { value: 1, name: 'Janvier' },
      { value: 2, name: 'Février' },
      { value: 3, name: 'Mars' },
      { value: 4, name: 'Avril' },
      { value: 5, name: 'Mai' },
      { value: 6, name: 'Juin' },
      { value: 7, name: 'Juillet' },
      { value: 8, name: 'Août' },
      { value: 9, name: 'Septembre' },
      { value: 10, name: 'Octobre' },
      { value: 11, name: 'Novembre' },
      { value: 12, name: 'Décembre' },
    ];

    return (
      <View style={styles.monthSelector}>
        <Text style={styles.sectionTitle}>Mois sélectionné</Text>
        <View style={styles.monthGrid}>
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
                {month.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Envoi Calendrier</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Sélection du mois */}
        {renderMonthSelector()}



        {/* Destinataires */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destinataires</Text>
          <TouchableOpacity
            style={styles.recipientsButton}
            onPress={() => setShowMembersModal(true)}
          >
            <Ionicons name="people" size={20} color="#FF6B35" />
            <Text style={styles.recipientsText}>
              {selectedMembers.length > 0 
                ? `${selectedMembers.length} membre(s) sélectionné(s)`
                : 'Sélectionner les membres'
              }
            </Text>
            <Ionicons name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Bouton d'envoi */}
        <TouchableOpacity
          style={[
            styles.sendButton, 
            selectedMembers.length === 0 && styles.sendButtonDisabled
          ]}
          onPress={handleSendCalendar}
          disabled={selectedMembers.length === 0 || sending}
        >
          {sending ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Ionicons name="calendar" size={20} color="white" />
              <Text style={styles.sendButtonText}>
                Envoyer le calendrier
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de sélection des membres */}
      {showMembersModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner les membres</Text>
              <TouchableOpacity onPress={() => setShowMembersModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Recherche */}
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un membre..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.actionButton} onPress={selectAllMembers}>
                <Text style={styles.actionButtonText}>Tout sélectionner</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={deselectAllMembers}>
                <Text style={styles.actionButtonText}>Tout désélectionner</Text>
              </TouchableOpacity>
            </View>

            {/* Liste des membres */}
            <FlatList
              data={getFilteredMembers()}
              renderItem={renderMemberItem}
              keyExtractor={(item) => item.id}
              style={styles.membersList}
              showsVerticalScrollIndicator={false}
            />

            {/* Bouton de confirmation */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => setShowMembersModal(false)}
            >
              <Text style={styles.confirmButtonText}>
                Confirmer ({selectedMembers.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  monthSelector: {
    marginBottom: 24,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthButton: {
    width: '30%',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
    alignItems: 'center',
  },
  monthButtonSelected: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  monthButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  monthButtonTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  messageInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    minHeight: 100,
  },
  recipientsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  recipientsText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    padding: 8,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
  membersList: {
    maxHeight: 300,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberItemSelected: {
    backgroundColor: '#fff3f0',
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  memberRole: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  confirmButton: {
    backgroundColor: '#FF6B35',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  confirmButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
