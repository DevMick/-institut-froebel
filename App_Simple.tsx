/**
 * Rotary Club Mobile App - Version Expo Snack Simplifiée
 * Application connectée à l'API ASP.NET Core avec PostgreSQL
 */

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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Types simplifiés
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  clubId?: string;
}

interface Club {
  id: string;
  name: string;
  city?: string;
  country?: string;
}

interface Member {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roles: string[];
}

// Données de démonstration
const demoUser: User = {
  id: '1',
  email: 'jean.dupont@rotary.fr',
  firstName: 'Jean',
  lastName: 'Dupont',
  fullName: 'Jean Dupont',
  clubId: '1'
};

const demoClub: Club = {
  id: '1',
  name: 'Rotary Club Paris Centre',
  city: 'Paris',
  country: 'France'
};

const demoMembers: Member[] = [
  {
    id: '1',
    email: 'john.doe@rotary.fr',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    roles: ['Membre']
  },
  {
    id: '2',
    email: 'jane.smith@rotary.fr',
    firstName: 'Jane',
    lastName: 'Smith',
    fullName: 'Jane Smith',
    roles: ['Président']
  },
  {
    id: '3',
    email: 'pierre.martin@rotary.fr',
    firstName: 'Pierre',
    lastName: 'Martin',
    fullName: 'Pierre Martin',
    roles: ['Secrétaire']
  }
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'members' | 'calendar-email'>('dashboard');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [messagePersonnalise, setMessagePersonnalise] = useState('');
  const [sending, setSending] = useState(false);

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

    setSending(true);
    
    // Simulation d'envoi
    setTimeout(() => {
      const successMessage = `✅ Calendrier envoyé avec succès !
      
📧 Destinataires : ${selectedMembers.length} membre(s)
📅 Mois : ${getMonthName(selectedMonth)}
📊 Événements : 5
🕐 Envoyé le : ${new Date().toLocaleString('fr-FR')}

Le calendrier a été transmis à tous les destinataires.`;

      Alert.alert(
        '🎉 Succès !',
        successMessage,
        [
          {
            text: 'Retour au menu',
            onPress: () => {
              setSelectedMembers([]);
              setMessagePersonnalise('');
              setCurrentScreen('dashboard');
            }
          }
        ]
      );
      setSending(false);
    }, 2000);
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const selectAllMembers = () => {
    const allMemberIds = demoMembers.map(member => member.id);
    setSelectedMembers(allMemberIds);
  };

  const deselectAllMembers = () => {
    setSelectedMembers([]);
  };

  const renderDashboard = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#005AA9" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Rotary Club Mobile</Text>
          <Text style={styles.clubName}>{demoClub.name}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>
            Bienvenue, {demoUser.fullName}
          </Text>
          <Text style={styles.clubInfo}>
            {demoClub.city}, {demoClub.country}
          </Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setCurrentScreen('members')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#005AA9' }]}>
              <Ionicons name="people-outline" size={24} color="white" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Membres</Text>
              <Text style={styles.menuSubtitle}>Gérer les membres du club</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setCurrentScreen('calendar-email')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#FF6B35' }]}>
              <Ionicons name="calendar-outline" size={24} color="white" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Envoi Calendrier</Text>
              <Text style={styles.menuSubtitle}>Envoyer le calendrier du mois</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  const renderMembers = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#005AA9" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('dashboard')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Membres</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {demoMembers.map((member) => (
          <View key={member.id} style={styles.memberCard}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {member.firstName.charAt(0)}{member.lastName.charAt(0)}
              </Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.fullName}</Text>
              <Text style={styles.memberEmail}>{member.email}</Text>
              <Text style={styles.memberRole}>{member.roles.join(', ')}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );

  const renderCalendarEmail = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#FF6B35" />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#FF6B35' }]}>
        <TouchableOpacity onPress={() => setCurrentScreen('dashboard')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Envoi Calendrier</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Sélection du mois */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mois sélectionné</Text>
          <View style={styles.monthGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
              <TouchableOpacity
                key={month}
                style={[
                  styles.monthButton,
                  selectedMonth === month && styles.monthButtonSelected
                ]}
                onPress={() => setSelectedMonth(month)}
              >
                <Text style={[
                  styles.monthButtonText,
                  selectedMonth === month && styles.monthButtonTextSelected
                ]}>
                  {getMonthName(month)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
          <Text style={styles.sectionTitle}>Destinataires sélectionnés</Text>
          <View style={styles.recipientsContainer}>
            {demoMembers.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={[
                  styles.recipientItem,
                  selectedMembers.includes(member.id) && styles.recipientItemSelected
                ]}
                onPress={() => toggleMemberSelection(member.id)}
              >
                <View style={styles.recipientInfo}>
                  <Text style={styles.recipientName}>{member.fullName}</Text>
                  <Text style={styles.recipientEmail}>{member.email}</Text>
                </View>
                <Ionicons
                  name={selectedMembers.includes(member.id) ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={selectedMembers.includes(member.id) ? '#FF6B35' : '#ccc'}
                />
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.recipientActions}>
            <TouchableOpacity style={styles.actionButton} onPress={selectAllMembers}>
              <Text style={styles.actionButtonText}>Tout sélectionner</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={deselectAllMembers}>
              <Text style={styles.actionButtonText}>Tout désélectionner</Text>
            </TouchableOpacity>
          </View>
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
    </SafeAreaView>
  );

  switch (currentScreen) {
    case 'members':
      return renderMembers();
    case 'calendar-email':
      return renderCalendarEmail();
    default:
      return renderDashboard();
  }
}

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
  headerContent: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  clubName: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
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
  welcomeCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  clubInfo: {
    fontSize: 14,
    color: '#666',
  },
  menuContainer: {
    gap: 12,
  },
  menuItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  memberCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#005AA9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 12,
    color: '#999',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
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
  recipientsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recipientItemSelected: {
    backgroundColor: '#fff3f0',
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  recipientEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  recipientActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
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
});
