/**
 * Home Screen - Rotary Club Mobile
 * Écran principal avec ScrollView, RefreshControl, widgets grid et FAB
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { theme } from '../theme';

// Types simplifiés pour Expo Snack
interface User {
  name: string;
  club: string;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  location: string;
  status: 'upcoming' | 'completed';
}

interface Member {
  id: string;
  name: string;
  status: 'active' | 'inactive';
}

interface RootState {
  user: User;
  meetings: { meetings: Meeting[] };
  members: { members: Member[] };
}

interface Props {
  navigation: any;
}

const { width } = Dimensions.get('window');

// Composant Card simple
const Card: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  // Données mockées pour Expo Snack
  const user: User = {
    name: 'Jean Dupont',
    club: 'Paris Centre'
  };

  const meetings: Meeting[] = [
    {
      id: '1',
      title: 'Réunion hebdomadaire',
      date: '2024-12-19T18:30:00Z',
      location: 'Hôtel Intercontinental',
      status: 'upcoming'
    }
  ];

  const members: Member[] = [
    { id: '1', name: 'Jean Dupont', status: 'active' },
    { id: '2', name: 'Marie Martin', status: 'active' },
    { id: '3', name: 'Pierre Durand', status: 'active' }
  ];

  const [searchVisible, setSearchVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline] = useState(true);

  const nextMeeting = meetings.find(m => m.status === 'upcoming');
  const activeMembers = members.filter(m => m.status === 'active');

  // Handle refresh avec feedback haptique
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulation du refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Toggle search bar
  const toggleSearch = useCallback(() => {
    setSearchVisible(prev => !prev);
  }, []);

  // Navigation vers les écrans détaillés
  const navigateToReunions = useCallback(() => {
    navigation.navigate('Reunions');
  }, [navigation]);

  const navigateToMembers = useCallback(() => {
    navigation.navigate('Members');
  }, [navigation]);

  // Render offline indicator
  const renderOfflineIndicator = () => {
    if (isOnline) return null;

    return (
      <View style={styles.offlineIndicator}>
        <Ionicons name="wifi-outline" size={16} color="#fff" />
        <Text style={styles.offlineText}>Mode hors ligne</Text>
      </View>
    );
  };

  // Render search bar
  const renderSearchBar = () => {
    if (!searchVisible) return null;

    return (
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <Text style={styles.searchPlaceholder}>Rechercher...</Text>
        </View>
      </View>
    );
  };

  // Render header
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>Rotary Club</Text>
        <Text style={styles.headerSubtitle}>
          Tableau de bord principal
        </Text>
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={toggleSearch}
          accessibilityLabel="Rechercher"
        >
          <Ionicons name="search" size={24} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('Profile')}
          accessibilityLabel="Profil"
        >
          <Ionicons name="person-circle" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render FAB
  const renderFAB = () => (
    <View style={styles.fabContainer}>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          console.log('FAB pressed');
        }}
        accessibilityLabel="Actions rapides"
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderOfflineIndicator()}
      {renderHeader()}
      {renderSearchBar()}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
            title="Actualisation..."
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.welcome}>Bienvenue, {user.name}</Text>
          <Text style={styles.subtitle}>Rotary Club {user.club}</Text>
        </View>

        <Card style={styles.statsCard}>
          <Text style={styles.cardTitle}>Statistiques</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeMembers.length}</Text>
              <Text style={styles.statLabel}>Membres actifs</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{meetings.length}</Text>
              <Text style={styles.statLabel}>Réunions</Text>
            </View>
          </View>
        </Card>

        {nextMeeting && (
          <Card style={styles.nextMeetingCard}>
            <Text style={styles.cardTitle}>Prochaine réunion</Text>
            <Text style={styles.meetingTitle}>{nextMeeting.title}</Text>
            <Text style={styles.meetingDate}>
              {new Date(nextMeeting.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            <Text style={styles.meetingLocation}>{nextMeeting.location}</Text>
          </Card>
        )}

        {/* Actions rapides */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={navigateToReunions}
          >
            <Ionicons name="calendar" size={24} color={theme.colors.primary} />
            <Text style={styles.actionText}>Réunions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={navigateToMembers}
          >
            <Ionicons name="people" size={24} color={theme.colors.primary} />
            <Text style={styles.actionText}>Membres</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => console.log('QR Scanner')}
          >
            <Ionicons name="qr-code" size={24} color={theme.colors.primary} />
            <Text style={styles.actionText}>QR Code</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing for FAB */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {renderFAB()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  offlineIndicator: {
    backgroundColor: '#f44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },

  offlineText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 8,
    fontWeight: '500',
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },

  welcomeSection: {
    padding: 16,
    backgroundColor: '#fff',
  },

  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },

  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },

  statsCard: {
    margin: 16,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.primary,
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  statItem: {
    alignItems: 'center',
  },

  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },

  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },

  nextMeetingCard: {
    margin: 16,
  },

  meetingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  meetingDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },

  meetingLocation: {
    fontSize: 14,
    color: '#666',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 100, // Space for FAB
  },

  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    margin: 16,
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
    color: '#333',
    fontWeight: '500',
  },

  bottomSpacing: {
    height: 80,
  },

  fabContainer: {
    position: 'absolute',
    bottom: 32,
    right: 16,
  },

  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  headerLeft: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },

  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
  },

  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  searchPlaceholder: {
    marginLeft: 8,
    color: '#666',
    fontSize: 16,
  },
});

export default HomeScreen;
