import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../services/ApiService';
import { Member } from '../types';

interface EmailScreenProps {
  navigation: any;
  route: any;
}

interface EmailData {
  to: string[];
  subject: string;
  body: string;
  attachments?: string[];
}

interface Attachment {
  name: string;
  size: string;
}

export const EmailScreen: React.FC<EmailScreenProps> = ({ navigation, route }) => {
  const { clubId, userEmail } = route.params;
  
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const clubMembers = await ApiService.getMembers(clubId);
      // Exclure l'utilisateur connecté de la liste
      const filteredMembers = clubMembers.filter(member => member.email !== userEmail);
      setMembers(filteredMembers);
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
      // Données de démo en cas d'erreur
      const demoMembers: Member[] = [
        { id: 1, nom: 'Martin', prenom: 'Jean', email: 'jean.martin@email.com', telephone: '0123456789', fonction: 'Président', statut: 'Actif' },
        { id: 2, nom: 'Dubois', prenom: 'Marie', email: 'marie.dubois@email.com', telephone: '0123456790', fonction: 'Secrétaire', statut: 'Actif' },
        { id: 3, nom: 'Moreau', prenom: 'Pierre', email: 'pierre.moreau@email.com', telephone: '0123456791', fonction: 'Trésorier', statut: 'Actif' },
      ];
      setMembers(demoMembers);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member =>
    member.nom.toLowerCase().includes(searchText.toLowerCase()) ||
    member.prenom.toLowerCase().includes(searchText.toLowerCase()) ||
    member.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const toggleMemberSelection = (member: Member) => {
    setSelectedMembers(prev => {
      const isSelected = prev.some(m => m.id === member.id);
      if (isSelected) {
        return prev.filter(m => m.id !== member.id);
      } else {
        return [...prev, member];
      }
    });
  };

  const selectAllMembers = () => {
    setSelectedMembers([...filteredMembers]);
  };

  const deselectAllMembers = () => {
    setSelectedMembers([]);
  };

  const addAttachment = () => {
    // Simulation d'ajout de pièce jointe
    const newAttachment: Attachment = {
      name: `document_${attachments.length + 1}.pdf`,
      size: '2.5 MB'
    };
    setAttachments(prev => [...prev, newAttachment]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (selectedMembers.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins un destinataire.');
      return false;
    }
    if (!subject.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un sujet.');
      return false;
    }
    if (!message.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un message.');
      return false;
    }
    return true;
  };

  const sendEmail = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const emailData: EmailData = {
        to: selectedMembers.map(member => member.email),
        subject: subject.trim(),
        body: message.trim(),
        attachments: attachments.map(att => att.name)
      };

      await ApiService.sendEmail(clubId, emailData);
      
      Alert.alert(
        'Succès',
        `Email envoyé avec succès à ${selectedMembers.length} destinataire(s).`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset du formulaire
              setSelectedMembers([]);
              setSubject('');
              setMessage('');
              setAttachments([]);
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer l\'email. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const renderMemberItem = ({ item }: { item: Member }) => {
    const isSelected = selectedMembers.some(m => m.id === item.id);
    
    return (
      <TouchableOpacity
        style={[styles.memberItem, isSelected && styles.memberItemSelected]}
        onPress={() => toggleMemberSelection(item)}
      >
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.prenom} {item.nom}</Text>
          <Text style={styles.memberEmail}>{item.email}</Text>
          <Text style={styles.memberFunction}>{item.fonction}</Text>
        </View>
        <Ionicons
          name={isSelected ? 'checkbox' : 'square-outline'}
          size={24}
          color={isSelected ? '#1f4788' : '#666'}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1f4788" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Envoyer un email</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Sélection des destinataires */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destinataires</Text>
          <TouchableOpacity
            style={styles.recipientSelector}
            onPress={() => setShowMemberModal(true)}
          >
            <Text style={styles.recipientText}>
              {selectedMembers.length === 0
                ? 'Sélectionner les destinataires'
                : `${selectedMembers.length} destinataire(s) sélectionné(s)`
              }
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Sujet */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sujet</Text>
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder="Entrez le sujet de l'email"
            maxLength={100}
          />
          <Text style={styles.charCount}>{subject.length}/100</Text>
        </View>

        {/* Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message</Text>
          <TextInput
            style={[styles.input, styles.messageInput]}
            value={message}
            onChangeText={setMessage}
            placeholder="Entrez votre message"
            multiline
            numberOfLines={6}
            maxLength={2000}
          />
          <Text style={styles.charCount}>{message.length}/2000</Text>
        </View>

        {/* Pièces jointes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pièces jointes</Text>
            <TouchableOpacity style={styles.addButton} onPress={addAttachment}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
          
          {attachments.length > 0 && (
            <ScrollView horizontal style={styles.attachmentsList}>
              {attachments.map((attachment, index) => (
                <View key={index} style={styles.attachmentItem}>
                  <Ionicons name="document" size={20} color="#1f4788" />
                  <Text style={styles.attachmentName}>{attachment.name}</Text>
                  <Text style={styles.attachmentSize}>{attachment.size}</Text>
                  <TouchableOpacity
                    style={styles.removeAttachment}
                    onPress={() => removeAttachment(index)}
                  >
                    <Ionicons name="close-circle" size={16} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Bouton d'envoi */}
        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={sendEmail}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.sendButtonText}>Envoyer l'email</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de sélection des membres */}
      <Modal
        visible={showMemberModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowMemberModal(false)}>
              <Text style={styles.modalCancel}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Sélectionner les destinataires</Text>
            <TouchableOpacity onPress={() => setShowMemberModal(false)}>
              <Text style={styles.modalDone}>Terminé</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Rechercher un membre..."
              clearButtonMode="while-editing"
            />

            <View style={styles.selectionButtons}>
              <TouchableOpacity style={styles.selectionButton} onPress={selectAllMembers}>
                <Text style={styles.selectionButtonText}>Tout sélectionner</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.selectionButton} onPress={deselectAllMembers}>
                <Text style={styles.selectionButtonText}>Tout désélectionner</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.selectedCount}>
              {selectedMembers.length} membre(s) sélectionné(s)
            </Text>

            <FlatList
              data={filteredMembers}
              renderItem={renderMemberItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.membersList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f4788',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  recipientSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  recipientText: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
  attachmentsList: {
    marginTop: 10,
  },
  attachmentItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    minWidth: 100,
  },
  attachmentName: {
    fontSize: 12,
    color: '#333',
    marginTop: 5,
    textAlign: 'center',
  },
  attachmentSize: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  removeAttachment: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f4788',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 40,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCancel: {
    color: '#ff4444',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f4788',
  },
  modalDone: {
    color: '#1f4788',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
    marginBottom: 15,
  },
  selectionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  selectionButton: {
    backgroundColor: '#1f4788',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  selectionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedCount: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginBottom: 15,
  },
  membersList: {
    flex: 1,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  memberItemSelected: {
    borderColor: '#1f4788',
    backgroundColor: '#f0f4ff',
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
  memberFunction: {
    fontSize: 12,
    color: '#1f4788',
    marginTop: 2,
  },
});
