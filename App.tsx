/**
 * Rotary Club Mobile App - Version Expo Snack
 * Application simplifiée pour démonstration
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Données mockées
const mockMembers = [
  { id: '1', name: 'Jean Dupont', role: 'Président', email: 'jean.dupont@rotary.org', phone: '+33 6 12 34 56 78' },
  { id: '2', name: 'Marie Martin', role: 'Secrétaire', email: 'marie.martin@rotary.org', phone: '+33 6 23 45 67 89' },
  { id: '3', name: 'Pierre Durand', role: 'Trésorier', email: 'pierre.durand@rotary.org', phone: '+33 6 34 56 78 90' },
  { id: '4', name: 'Sophie Moreau', role: 'Membre', email: 'sophie.moreau@rotary.org', phone: '+33 6 45 67 89 01' },
  { id: '5', name: 'Paul Bernard', role: 'Membre', email: 'paul.bernard@rotary.org', phone: '+33 6 56 78 90 12' },
];

const mockMeetings = [
  {
    id: '1',
    title: 'Réunion Hebdomadaire',
    date: '2024-12-19T18:30:00Z',
    location: 'Hôtel Intercontinental',
    attendees: ['1', '2', '3'],
    status: 'upcoming'
  },
  {
    id: '2',
    title: 'Assemblée Générale',
    date: '2024-12-26T14:00:00Z',
    location: 'Salle des Fêtes',
    attendees: ['1', '2', '3', '4', '5'],
    status: 'upcoming'
  }
];

// Couleurs du thème Rotary
const colors = {
  primary: '#005AA9',
  secondary: '#F7A81B',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  error: '#f44336'
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [searchQuery, setSearchQuery] = useState('');

  // Écran d'accueil
  const HomeScreen = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rotary Club</Text>
        <Text style={styles.headerSubtitle}>Paris Centre</Text>
      </View>

      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>Bienvenue, Jean Dupont</Text>
        <Text style={styles.roleText}>Président</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{mockMembers.length}</Text>
          <Text style={styles.statLabel}>Membres</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{mockMeetings.length}</Text>
          <Text style={styles.statLabel}>Réunions</Text>
        </View>
      </View>

      <View style={styles.nextMeetingCard}>
        <Text style={styles.cardTitle}>Prochaine réunion</Text>
        <Text style={styles.meetingTitle}>{mockMeetings[0].title}</Text>
        <Text style={styles.meetingDate}>
          {new Date(mockMeetings[0].date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        <Text style={styles.meetingLocation}>{mockMeetings[0].location}</Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setCurrentScreen('Reunions')}
        >
          <Ionicons name="calendar" size={24} color={colors.primary} />
          <Text style={styles.actionText}>Réunions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setCurrentScreen('Members')}
        >
          <Ionicons name="people" size={24} color={colors.primary} />
          <Text style={styles.actionText}>Membres</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('QR Code', 'Fonctionnalité disponible dans l\'app native')}
        >
          <Ionicons name="qr-code" size={24} color={colors.primary} />
          <Text style={styles.actionText}>QR Code</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // Écran des réunions
  const ReunionsScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Réunions</Text>
      </View>
      <FlatList
        data={mockMeetings}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.meetingCard}>
            <Text style={styles.meetingTitle}>{item.title}</Text>
            <Text style={styles.meetingDate}>
              {new Date(item.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            <Text style={styles.meetingLocation}>{item.location}</Text>
            <Text style={styles.meetingAttendees}>
              {item.attendees.length} participants
            </Text>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => Alert.alert('Scanner QR', 'Fonctionnalité disponible dans l\'app native')}
      >
        <Ionicons name="qr-code-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  // Écran des membres
  const MembersScreen = () => {
    const filteredMembers = mockMembers.filter(member =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Membres</Text>
        </View>
        <FlatList
          data={filteredMembers}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.memberCard}>
              <View style={styles.memberHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {item.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{item.name}</Text>
                  <Text style={styles.memberRole}>{item.role}</Text>
                </View>
              </View>
              <View style={styles.memberDetails}>
                <Text style={styles.memberEmail}>{item.email}</Text>
                <Text style={styles.memberPhone}>{item.phone}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    );
  };

  // Écran de profil
  const ProfileScreen = () => (
    <ScrollView style={styles.container}>
      <View style={[styles.header, styles.profileHeader]}>
        <View style={[styles.avatar, styles.profileAvatar]}>
          <Text style={[styles.avatarText, styles.profileAvatarText]}>JD</Text>
        </View>
        <Text style={[styles.headerTitle, styles.profileName]}>Jean Dupont</Text>
        <Text style={[styles.headerSubtitle, styles.profileRole]}>Président</Text>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>
        <View style={styles.profileItem}>
          <Ionicons name="mail" size={20} color={colors.primary} />
          <View style={styles.profileItemText}>
            <Text style={styles.profileItemLabel}>Email</Text>
            <Text style={styles.profileItemValue}>jean.dupont@rotary.org</Text>
          </View>
        </View>
        <View style={styles.profileItem}>
          <Ionicons name="business" size={20} color={colors.primary} />
          <View style={styles.profileItemText}>
            <Text style={styles.profileItemLabel}>Club</Text>
            <Text style={styles.profileItemValue}>Rotary Club Paris Centre</Text>
          </View>
        </View>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <TouchableOpacity style={styles.profileAction}>
          <Ionicons name="person-circle" size={20} color={colors.primary} />
          <Text style={styles.profileActionText}>Modifier le profil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileAction}>
          <Ionicons name="lock-closed" size={20} color={colors.primary} />
          <Text style={styles.profileActionText}>Changer le mot de passe</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileAction}>
          <Ionicons name="log-out" size={20} color={colors.error} />
          <Text style={[styles.profileActionText, { color: colors.error }]}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // Fonction pour rendre l'écran actuel
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return <HomeScreen />;
      case 'Reunions':
        return <ReunionsScreen />;
      case 'Members':
        return <MembersScreen />;
      case 'Profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.appContainer}>
      <StatusBar style="light" />
      {renderCurrentScreen()}

      {/* Navigation en bas */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, currentScreen === 'Home' && styles.tabItemActive]}
          onPress={() => setCurrentScreen('Home')}
        >
          <Ionicons
            name={currentScreen === 'Home' ? 'home' : 'home-outline'}
            size={24}
            color={currentScreen === 'Home' ? colors.primary : '#666'}
          />
          <Text style={[styles.tabText, currentScreen === 'Home' && styles.tabTextActive]}>
            Accueil
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, currentScreen === 'Reunions' && styles.tabItemActive]}
          onPress={() => setCurrentScreen('Reunions')}
        >
          <Ionicons
            name={currentScreen === 'Reunions' ? 'calendar' : 'calendar-outline'}
            size={24}
            color={currentScreen === 'Reunions' ? colors.primary : '#666'}
          />
          <Text style={[styles.tabText, currentScreen === 'Reunions' && styles.tabTextActive]}>
            Réunions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, currentScreen === 'Members' && styles.tabItemActive]}
          onPress={() => setCurrentScreen('Members')}
        >
          <Ionicons
            name={currentScreen === 'Members' ? 'people' : 'people-outline'}
            size={24}
            color={currentScreen === 'Members' ? colors.primary : '#666'}
          />
          <Text style={[styles.tabText, currentScreen === 'Members' && styles.tabTextActive]}>
            Membres
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, currentScreen === 'Profile' && styles.tabItemActive]}
          onPress={() => setCurrentScreen('Profile')}
        >
          <Ionicons
            name={currentScreen === 'Profile' ? 'person' : 'person-outline'}
            size={24}
            color={currentScreen === 'Profile' ? colors.primary : '#666'}
          />
          <Text style={[styles.tabText, currentScreen === 'Profile' && styles.tabTextActive]}>
            Profil
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
    marginTop: 4,
  },
  welcomeCard: {
    backgroundColor: colors.surface,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  roleText: {
    fontSize: 16,
    color: colors.primary,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 16,
  },
  statCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.text,
    marginTop: 4,
  },
  nextMeetingCard: {
    backgroundColor: colors.surface,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  meetingDate: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    marginBottom: 4,
  },
  meetingLocation: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
  },
  meetingAttendees: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  meetingCard: {
    backgroundColor: colors.surface,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberCard: {
    backgroundColor: colors.surface,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  memberInfo: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  memberRole: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 2,
  },
  memberDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  memberEmail: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  memberPhone: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  profileHeader: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  profileAvatarText: {
    fontSize: 24,
  },
  profileName: {
    fontSize: 24,
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
  },
  profileSection: {
    backgroundColor: colors.surface,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileItemText: {
    marginLeft: 16,
    flex: 1,
  },
  profileItemLabel: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
  },
  profileItemValue: {
    fontSize: 16,
    color: colors.text,
    marginTop: 2,
  },
  profileAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileActionText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 20,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabItemActive: {
    // Style pour l'onglet actif
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
});
