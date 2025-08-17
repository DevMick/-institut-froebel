import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ApiService } from '../services/ApiService';

interface Member {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  photo?: string;
}

interface WhatsAppScreenProps {
  user: any;
  club: any;
  onBack: () => void;
}

export const WhatsAppScreen: React.FC<WhatsAppScreenProps> = ({ user, club, onBack }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const apiService = new ApiService();

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const membersData = await apiService.getClubMembers(club.id);
      // Filtrer l'utilisateur connecté
      const filteredMembers = membersData.filter((member: Member) => member.id !== user.id);
      setMembers(filteredMembers);
    } catch (error) {
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
    setSelectedMembers(members.map(member => member.id));
  };

  const deselectAllMembers = () => {
    setSelectedMembers([]);
  };

  const getSelectedMembers = () => {
    return members.filter(member => selectedMembers.includes(member.id));
  };

  const getSelectedPhones = () => {
    return getSelectedMembers()
      .filter(member => member.telephone)
      .map(member => member.telephone!.replace(/\s/g, ''));
  };

  const sendWhatsAppMessage = async (phoneNumber: string, messageText: string) => {
    try {
      // Format du numéro de téléphone
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const url = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(messageText)}`;
      
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return true;
      } else {
        // Fallback vers WhatsApp Web
        const webUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(messageText)}`;
        await Linking.openURL(webUrl);
        return true;
      }
    } catch (error) {
      console.error('Erreur ouverture WhatsApp:', error);
      return false;
    }
  };

  const handleSendWhatsApp = async () => {
    if (!message.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un message');
      return;
    }

    if (selectedMembers.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins un destinataire');
      return;
    }

    const selectedPhones = getSelectedPhones();
    if (selectedPhones.length === 0) {
      Alert.alert('Erreur', 'Aucun numéro de téléphone disponible pour les membres sélectionnés');
      return;
    }

    try {
      setSending(true);
      
      // Envoyer à chaque destinataire
      for (const phone of selectedPhones) {
        await sendWhatsAppMessage(phone, message.trim());
        // Petite pause entre chaque envoi
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      Alert.alert(
        'Succès',
        `WhatsApp ouvert pour ${selectedPhones.length} membre(s). Veuillez confirmer l'envoi dans WhatsApp.`,
        [{ text: 'OK', onPress: () => { setMessage(''); setSelectedMembers([]); } }]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors de l\'ouverture de WhatsApp');
    } finally {
      setSending(false);
    }
  };

  const filteredMembers = members.filter(member =>
    `${member.prenom} ${member.nom}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WhatsApp</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Destinataires */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destinataires</Text>
          <TouchableOpacity
            style={styles.recipientsButton}
            onPress={() => setShowMemberModal(true)}
          >
            <MaterialIcons name="people" size={20} color="#005AA9" />
            <Text style={styles.recipientsText}>
              {selectedMembers.length > 0 
                ? `${selectedMembers.length} membre(s) sélectionné(s)`
                : 'Sélectionner les membres'
              }
            </Text>
            <MaterialIcons name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Tapez votre message WhatsApp..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
            maxLength={1000}
          />
          <Text style={styles.charCount}>
            {message.length}/1000 caractères
          </Text>
        </View>

        {/* Bouton d'envoi */}
        <TouchableOpacity
          style={[styles.sendButton, (!message.trim() || selectedMembers.length === 0) && styles.sendButtonDisabled]}
          onPress={handleSendWhatsApp}
          disabled={!message.trim() || selectedMembers.length === 0 || sending}
        >
          {sending ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <MaterialIcons name="send" size={20} color="white" />
              <Text style={styles.sendButtonText}>
                Ouvrir WhatsApp ({getSelectedPhones().length})
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de sélection des membres */}
      {showMemberModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner les membres</Text>
              <TouchableOpacity onPress={() => setShowMemberModal(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
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
            <ScrollView style={styles.membersList}>
              {filteredMembers.map(member => (
                <TouchableOpacity
                  key={member.id}
                  style={styles.memberItem}
                  onPress={() => toggleMemberSelection(member.id)}
                >
                  <View style={styles.memberInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {member.prenom.charAt(0)}{member.nom.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.memberDetails}>
                      <Text style={styles.memberName}>
                        {member.prenom} {member.nom}
                      </Text>
                      <Text style={styles.memberPhone}>
                        {member.telephone || 'Aucun numéro'}
                      </Text>
                    </View>
                  </View>
                  <View style={[
                    styles.checkbox,
                    selectedMembers.includes(member.id) && styles.checkboxSelected
                  ]}>
                    {selectedMembers.includes(member.id) && (
                      <MaterialIcons name="check" size={16} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Bouton de confirmation */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => setShowMemberModal(false)}
            >
              <Text style={styles.confirmButtonText}>
                Confirmer ({selectedMembers.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
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
  messageInput: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  charCount: {
    textAlign: 'right',
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  sendButton: {
    backgroundColor: '#25D366',
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
    backgroundColor: '#005AA9',
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
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#005AA9',
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
  memberPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
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
    backgroundColor: '#25D366',
    borderColor: '#25D366',
  },
  confirmButton: {
    backgroundColor: '#25D366',
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
