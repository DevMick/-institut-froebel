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
import { Member, User, Club, Reunion } from '../types';
import { ApiService } from '../services/ApiService';

interface MonthlyReportScreenProps {
  user: User;
  club: Club;
  onBack: () => void;
}

interface CalendarEvent {
  type: 'reunion' | 'action-interne' | 'action-externe' | 'anniversaire';
  title: string;
  date: string;
  data: any;
  color: string;
}

interface MonthlyData {
  reunions: Reunion[];
  actionsInternes: any[];
  actionsExternes: any[];
  anniversaires: Member[];
  selectedMonth: string;
}

export const MonthlyReportScreen: React.FC<MonthlyReportScreenProps> = ({
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
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(moment().format('YYYY-MM'));

  const apiService = new ApiService();

  useEffect(() => {
    loadMembers();
    loadMonthlyData();
  }, [selectedMonth]);

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

  const loadMonthlyData = async () => {
    try {
      setLoading(true);
      
      // Charger les réunions du mois
      const reunionsData = await apiService.getClubReunions(club.id);
      const reunionsDuMois = reunionsData.filter(reunion => {
        const dateReunion = moment(reunion.date);
        return dateReunion.format('YYYY-MM') === selectedMonth;
      });

      // Charger les événements du mois
      const evenementsData = await apiService.getClubEvenements(club.id);
      const evenementsDuMois = evenementsData.filter(evenement => {
        const dateEvenement = moment(evenement.date);
        return dateEvenement.format('YYYY-MM') === selectedMonth;
      });

      const actionsInternes = evenementsDuMois.filter(e => e.estInterne);
      const actionsExternes = evenementsDuMois.filter(e => !e.estInterne);

      // Calculer les anniversaires du mois
      const anniversairesDuMois = members.filter(membre => {
        if (!membre.dateAnniversaire) return false;
        const anniversaire = moment(membre.dateAnniversaire);
        const moisAnnee = moment(selectedMonth);
        return anniversaire.month() === moisAnnee.month();
      });

      setMonthlyData({
        reunions: reunionsDuMois,
        actionsInternes,
        actionsExternes,
        anniversaires: anniversairesDuMois,
        selectedMonth
      });

    } catch (error: any) {
      console.error('Erreur chargement données mensuelles:', error);
      Alert.alert('Erreur', 'Impossible de charger les données du mois');
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

  const generateMonthlyReport = () => {
    if (!monthlyData) return '';

    const mois = moment(selectedMonth).format('MMMM YYYY');
    
    let report = `
# 📅 Rapport Mensuel - ${club.name}
## Mois : ${mois.charAt(0).toUpperCase() + mois.slice(1)}

---

## 📋 Réunions (${monthlyData.reunions.length})
`;

    if (monthlyData.reunions.length > 0) {
      monthlyData.reunions.forEach(reunion => {
        const date = moment(reunion.date).format('dddd DD MMMM YYYY');
        report += `
### ${reunion.typeReunionLibelle}
- **Date :** ${date} à ${reunion.heure}
- **Lieu :** ${reunion.lieu || 'Non défini'}
- **Description :** ${reunion.description || 'Aucune description'}
`;
      });
    } else {
      report += `Aucune réunion programmée ce mois-ci.`;
    }

    report += `

## 🎯 Actions Internes (${monthlyData.actionsInternes.length})
`;

    if (monthlyData.actionsInternes.length > 0) {
      monthlyData.actionsInternes.forEach(action => {
        const date = moment(action.date).format('dddd DD MMMM YYYY');
        report += `
### ${action.libelle}
- **Date :** ${date}
- **Lieu :** ${action.lieu || 'Non défini'}
- **Description :** ${action.description || 'Aucune description'}
`;
      });
    } else {
      report += `Aucune action interne programmée ce mois-ci.`;
    }

    report += `

## 🌍 Actions Externes (${monthlyData.actionsExternes.length})
`;

    if (monthlyData.actionsExternes.length > 0) {
      monthlyData.actionsExternes.forEach(action => {
        const date = moment(action.date).format('dddd DD MMMM YYYY');
        report += `
### ${action.libelle}
- **Date :** ${date}
- **Lieu :** ${action.lieu || 'Non défini'}
- **Description :** ${action.description || 'Aucune description'}
`;
      });
    } else {
      report += `Aucune action externe programmée ce mois-ci.`;
    }

    report += `

## 🎂 Anniversaires (${monthlyData.anniversaires.length})
`;

    if (monthlyData.anniversaires.length > 0) {
      monthlyData.anniversaires.forEach(membre => {
        const dateAnniversaire = moment(membre.dateAnniversaire).format('dddd DD MMMM');
        const age = moment().diff(moment(membre.dateAnniversaire), 'years');
        report += `
### ${membre.fullName}
- **Date :** ${dateAnniversaire}
- **Âge :** ${age} ans
- **Email :** ${membre.email}
`;
      });
    } else {
      report += `Aucun anniversaire ce mois-ci.`;
    }

    report += `

---
*Rapport généré automatiquement le ${moment().format('DD/MM/YYYY à HH:mm')}*
`;

    return report;
  };

  const handleSendMonthlyReport = async () => {
    if (selectedMembers.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins un destinataire');
      return;
    }

    if (!monthlyData) {
      Alert.alert('Erreur', 'Aucune donnée disponible pour ce mois');
      return;
    }

    try {
      setSending(true);
      
      const reportContent = generateMonthlyReport();
      const mois = moment(selectedMonth).format('MMMM YYYY');
      
      const emailData = {
        subject: `📅 Rapport Mensuel - ${club.name} - ${mois}`,
        message: reportContent,
        recipients: getSelectedEmails(),
        attachments: [],
      };

      const result = await apiService.sendClubEmail(emailData);
      
      const successMessage = `✅ Rapport mensuel envoyé avec succès !
      
📧 Destinataires : ${selectedMembers.length} membre(s)
📅 Mois : ${mois.charAt(0).toUpperCase() + mois.slice(1)}
📊 Contenu :
   • ${monthlyData.reunions.length} réunion(s)
   • ${monthlyData.actionsInternes.length} action(s) interne(s)
   • ${monthlyData.actionsExternes.length} action(s) externe(s)
   • ${monthlyData.anniversaires.length} anniversaire(s)
🕐 Envoyé le : ${new Date().toLocaleString('fr-FR')}

Le rapport a été transmis à tous les destinataires.`;

      Alert.alert(
        '🎉 Succès !',
        successMessage,
        [
          {
            text: 'Retour au menu',
            onPress: () => {
              setSelectedMembers([]);
              onBack();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ Erreur envoi rapport mensuel:', error);
      Alert.alert('Erreur', error.message || 'Erreur lors de l\'envoi du rapport');
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

  const renderMonthlyData = () => {
    if (!monthlyData) return null;

    return (
      <View style={styles.dataContainer}>
        <Text style={styles.dataTitle}>📊 Données du mois</Text>
        
        <View style={styles.dataItem}>
          <Ionicons name="calendar" size={20} color="#1890ff" />
          <Text style={styles.dataText}>
            Réunions : {monthlyData.reunions.length}
          </Text>
        </View>
        
        <View style={styles.dataItem}>
          <Ionicons name="checkmark-circle" size={20} color="#52c41a" />
          <Text style={styles.dataText}>
            Actions internes : {monthlyData.actionsInternes.length}
          </Text>
        </View>
        
        <View style={styles.dataItem}>
          <Ionicons name="globe" size={20} color="#f59e0b" />
          <Text style={styles.dataText}>
            Actions externes : {monthlyData.actionsExternes.length}
          </Text>
        </View>
        
        <View style={styles.dataItem}>
          <Ionicons name="gift" size={20} color="#eb2f96" />
          <Text style={styles.dataText}>
            Anniversaires : {monthlyData.anniversaires.length}
          </Text>
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
        <Text style={styles.headerTitle}>Rapport Mensuel</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Sélection du mois */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mois sélectionné</Text>
          <View style={styles.monthSelector}>
            <TouchableOpacity
              style={styles.monthButton}
              onPress={() => {
                const prevMonth = moment(selectedMonth).subtract(1, 'month').format('YYYY-MM');
                setSelectedMonth(prevMonth);
              }}
            >
              <Ionicons name="chevron-back" size={20} color="#005AA9" />
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {moment(selectedMonth).format('MMMM YYYY').charAt(0).toUpperCase() + 
               moment(selectedMonth).format('MMMM YYYY').slice(1)}
            </Text>
            <TouchableOpacity
              style={styles.monthButton}
              onPress={() => {
                const nextMonth = moment(selectedMonth).add(1, 'month').format('YYYY-MM');
                setSelectedMonth(nextMonth);
              }}
            >
              <Ionicons name="chevron-forward" size={20} color="#005AA9" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Données du mois */}
        {renderMonthlyData()}

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

        {/* Bouton d'envoi */}
        <TouchableOpacity
          style={[
            styles.sendButton, 
            (selectedMembers.length === 0 || !monthlyData) && styles.sendButtonDisabled
          ]}
          onPress={handleSendMonthlyReport}
          disabled={selectedMembers.length === 0 || !monthlyData || sending}
        >
          {sending ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="white" />
              <Text style={styles.sendButtonText}>
                Envoyer le rapport mensuel
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
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  monthButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dataContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dataText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
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
    backgroundColor: '#005AA9',
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
    backgroundColor: '#005AA9',
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
