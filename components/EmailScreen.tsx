import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Member, User, Club } from '../types';
import { ApiService } from '../services/ApiService';

interface EmailScreenProps {
  user: User;
  club: Club;
  onBack: () => void;
}

interface EmailData {
  subject: string;
  message: string;
  recipients: string[];
  attachments?: { name: string; type: string; size: string; base64?: string; uri?: string }[];
}

interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  uri?: string;
  base64?: string;
}

export const EmailScreen: React.FC<EmailScreenProps> = ({
  user,
  club,
  onBack,
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const apiService = new ApiService();

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const membersData = await apiService.getClubMembers(club.id);
      // Filtrer pour exclure l'utilisateur connecté
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

  const handleAddAttachment = async () => {
    console.log('🔧 Tentative d\'ajout de pièce jointe...');
    
    try {
      // Utiliser expo-document-picker pour sélectionner un fichier
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'image/*',
          'text/*'
        ],
        copyToCacheDirectory: true,
        multiple: false
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('📎 Fichier sélectionné:', file);
        
        // Lire le contenu du fichier
        const fileContent = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64
        });
        
        // Créer l'objet attachment
        const newAttachment: Attachment = {
          id: Date.now().toString(),
          name: file.name || `fichier_${Date.now()}`,
          size: formatFileSize(file.size || 0),
          type: file.mimeType || 'application/octet-stream',
          uri: file.uri,
          base64: fileContent,
        };
        
        setAttachments(prev => {
          const updated = [...prev, newAttachment];
          console.log('📎 Pièces jointes mises à jour:', updated.length);
          return updated;
        });
        
        Alert.alert(
          '✅ Pièce jointe ajoutée',
          `Fichier "${file.name}" ajouté avec succès`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('❌ Erreur upload fichier:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner le fichier');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const addSimulatedAttachment = (fileName: string, fileType: string, fileSize: number) => {
    console.log('📎 Ajout de pièce jointe simulée:', fileName);
    
    const newAttachment: Attachment = {
      id: Date.now().toString(),
      name: fileName,
      size: `${Math.round(fileSize / 1024)} KB`,
      type: fileType,
      uri: `file://${Date.now()}_${fileName}`,
      base64: 'base64_simulation_data_' + Date.now(),
    };
    
    setAttachments(prev => {
      const updated = [...prev, newAttachment];
      console.log('📎 Pièces jointes mises à jour:', updated.length);
      return updated;
    });
    
    Alert.alert(
      '✅ Pièce jointe ajoutée',
      `Fichier "${fileName}" ajouté avec succès (simulation)`,
      [{ text: 'OK' }]
    );
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const handleSendEmail = async () => {
    if (!subject.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un sujet');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un message');
      return;
    }

    if (selectedMembers.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins un destinataire');
      return;
    }

    try {
      setSending(true);
      
      // Préparer les données des pièces jointes
      const attachmentData = attachments.map(att => ({
        name: att.name,
        type: att.type,
        size: att.size,
        base64: att.base64 || null,
        uri: att.uri || null
      }));

      const emailData: EmailData = {
        subject: subject.trim(),
        message: message.trim(),
        recipients: getSelectedEmails(),
        attachments: attachmentData,
      };

      await apiService.sendClubEmail(emailData);
      
      Alert.alert(
        'Succès',
        `Email envoyé à ${selectedMembers.length} membre(s)${attachments.length > 0 ? ` avec ${attachments.length} pièce(s) jointe(s)` : ''}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setSubject('');
              setMessage('');
              setSelectedMembers([]);
              setAttachments([]);
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors de l\'envoi de l\'email');
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
          color={isSelected ? '#005AA9' : '#ccc'}
        />
      </TouchableOpacity>
    );
  };

  const renderAttachment = ({ item: attachment }: { item: Attachment }) => (
    <View style={styles.attachmentItem}>
      <View style={styles.attachmentInfo}>
        <Ionicons name="document" size={20} color="#005AA9" />
        <View style={styles.attachmentDetails}>
          <Text style={styles.attachmentName}>{attachment.name}</Text>
          <Text style={styles.attachmentSize}>{attachment.size}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleRemoveAttachment(attachment.id)}
        style={styles.removeAttachmentButton}
      >
        <Ionicons name="close-circle" size={20} color="#dc3545" />
      </TouchableOpacity>
    </View>
  );

  const renderMembersModal = () => (
    <Modal
      visible={showMembersModal}
      animationType="slide"
      onRequestClose={() => setShowMembersModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowMembersModal(false)}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Sélectionner les destinataires</Text>
          <View style={styles.modalActions}>
            <TouchableOpacity onPress={selectAllMembers} style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Tout</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={deselectAllMembers} style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Aucun</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un membre..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.selectionInfo}>
          <Text style={styles.selectionText}>
            {selectedMembers.length} sélectionné(s) sur {members.length}
          </Text>
        </View>
        
        <FlatList
          data={getFilteredMembers()}
          renderItem={renderMemberItem}
          keyExtractor={(item) => item.id}
          style={styles.membersList}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Envoyer un email</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destinataires</Text>
          <TouchableOpacity
            style={styles.recipientsSelector}
            onPress={() => setShowMembersModal(true)}
          >
            <View style={styles.recipientsInfo}>
              <Ionicons name="people" size={20} color="#005AA9" />
              <Text style={styles.recipientsText}>
                {selectedMembers.length > 0
                  ? `${selectedMembers.length} membre(s) sélectionné(s)`
                  : 'Sélectionner les destinataires'
                }
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sujet *</Text>
          <TextInput
            style={styles.input}
            placeholder="Sujet de l'email"
            value={subject}
            onChangeText={setSubject}
            maxLength={100}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message *</Text>
          <TextInput
            style={[styles.input, styles.messageInput]}
            placeholder="Contenu de votre message..."
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
            maxLength={2000}
          />
          <Text style={styles.charCount}>
            {message.length}/2000 caractères
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pièces jointes</Text>
          
          {/* Bouton principal */}
          <TouchableOpacity 
            style={styles.attachmentButton}
            onPress={handleAddAttachment}
            activeOpacity={0.7}
          >
            <Ionicons name="attach" size={24} color="#005AA9" />
            <Text style={styles.attachmentText}>📎 Sélectionner un fichier</Text>
            <Ionicons name="add-circle" size={20} color="#005AA9" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          
          {/* Bouton de test simple */}
          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => addSimulatedAttachment('test.txt', 'text/plain', 1024)}
          >
            <Text style={styles.testButtonText}>🧪 Test rapide - Ajouter fichier</Text>
          </TouchableOpacity>
          
          {attachments.length > 0 && (
            <View style={styles.attachmentsList}>
              <Text style={styles.attachmentsTitle}>
                Pièces jointes ({attachments.length})
              </Text>
              <FlatList
                data={attachments}
                renderItem={renderAttachment}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}
          
          <Text style={styles.attachmentNote}>
            💡 Formats supportés : PDF, Word, Excel, PowerPoint, Images, Texte
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          onPress={handleSendEmail}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="mail" size={20} color="white" />
              <Text style={styles.sendButtonText}>
                Envoyer ({selectedMembers.length})
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
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
  recipientsSelector: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  recipientsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recipientsText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  attachmentButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#005AA9',
    borderStyle: 'dashed',
  },
  attachmentText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#005AA9',
    fontWeight: '500',
  },
  attachmentNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  attachmentsList: {
    marginTop: 12,
  },
  attachmentsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  attachmentItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    minWidth: 200,
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attachmentDetails: {
    marginLeft: 8,
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  attachmentSize: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  removeAttachmentButton: {
    padding: 4,
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sendButton: {
    backgroundColor: '#005AA9',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: '#005AA9',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    margin: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  selectionInfo: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  selectionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  membersList: {
    flex: 1,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberItemSelected: {
    backgroundColor: '#f0f8ff',
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
    backgroundColor: '#005AA9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberDetails: {
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
  memberRole: {
    fontSize: 12,
    color: '#005AA9',
    marginTop: 2,
    fontStyle: 'italic',
  },
  testButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  testButtonText: {
    fontSize: 14,
    color: '#005AA9',
    fontWeight: 'bold',
  },
});
