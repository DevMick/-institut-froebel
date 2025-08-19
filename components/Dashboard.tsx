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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User, Club, Member, NavigationScreen } from '../types';
import { ApiService } from '../services/ApiService';

interface DashboardProps {
  user: User;
  club: Club;
  onLogout: () => void;
  onNavigate: (screen: NavigationScreen) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  club,
  onLogout,
  onNavigate,
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalClubs: 0,
    totalReunions: 0,
  });

  const apiService = new ApiService();

  useEffect(() => {
    loadDashboardData();
  }, [club.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 🔍 LOG: Vérification des données utilisateur
      console.log('🔍 DASHBOARD - Données utilisateur reçues:', {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        clubId: user.clubId
      });

      const membersData = await apiService.getClubMembers(club.id);
      setMembers(membersData);

      // Charger le nombre de clubs
      const clubsData = await apiService.getClubs();

      // Charger les réunions et compter celles qui sont programmées (futures)
      let reunionsProgrammees = 0;
      try {
        const reunionsData = await apiService.getClubReunions(club.id);
        const maintenant = new Date();
        reunionsProgrammees = reunionsData.filter(reunion => {
          const dateReunion = new Date(reunion.date);
          return dateReunion > maintenant; // Réunion dans le futur = programmée
        }).length;
      } catch (error) {
        // Erreur silencieuse pour les réunions
      }

      setStats({
        totalMembers: membersData.length,
        totalClubs: clubsData.length,
        totalReunions: reunionsProgrammees,
      });
    } catch (error: any) {
      console.error('Erreur chargement dashboard:', error);
      Alert.alert('Erreur', 'Impossible de charger les données du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  const menuItems = [
    {
      id: 'members',
      title: 'Membres',
      subtitle: 'Gérer les membres du club',
      icon: 'people-outline',
      color: '#005AA9',
      screen: 'members' as NavigationScreen,
    },
    {
      id: 'reunions',
      title: 'Réunions',
      subtitle: 'Planifier et gérer les réunions',
      icon: 'calendar',
      color: '#28a745',
      screen: 'reunions' as NavigationScreen,
    },
    {
      id: 'cotisations',
      title: 'Cotisations',
      subtitle: 'Suivre les paiements',
      icon: 'card',
      color: '#ffc107',
      screen: 'cotisations' as NavigationScreen,
    },
    {
      id: 'email',
      title: 'Envoyer un email',
      subtitle: 'Contacter les membres du club',
      icon: 'mail-outline',
      color: '#28a745',
      screen: 'email' as NavigationScreen,
    },
    {
      id: 'whatsapp',
      title: 'Envoyer WhatsApp',
      subtitle: 'Message rapide aux membres',
      icon: 'chatbubble-outline',
      color: '#25D366',
      screen: 'whatsapp' as NavigationScreen,
    },
    {
      id: 'monthly-report',
      title: 'Rapport Mensuel',
      subtitle: 'Envoyer le rapport du mois',
      icon: 'document-text-outline',
      color: '#8B5CF6',
      screen: 'monthly-report' as NavigationScreen,
    },
    {
      id: 'calendar-email',
      title: 'Envoi Calendrier',
      subtitle: 'Envoyer le calendrier du mois',
      icon: 'calendar-outline',
      color: '#FF6B35',
      screen: 'calendar-email' as NavigationScreen,
    },
    {
      id: 'clubs',
      title: 'Clubs',
      subtitle: 'Gérer les clubs',
      icon: 'business-outline',
      color: '#6f42c1',
      screen: 'clubs' as NavigationScreen,
    },
    {
      id: 'profile',
      title: 'Profil',
      subtitle: 'Gérer votre profil',
      icon: 'person-outline',
      color: '#17a2b8',
      screen: 'profile' as NavigationScreen,
    },
    {
      id: 'settings',
      title: 'Paramètres',
      subtitle: 'Configurer l\'application',
      icon: 'settings-outline',
      color: '#6c757d',
      screen: 'settings' as NavigationScreen,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Rotary Club Mobile</Text>
          <Text style={styles.clubName}>{club.name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>
            Bienvenue, {user.fullName}
          </Text>
          <Text style={styles.clubInfo}>
            {club.city}, {club.country}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalMembers}</Text>
            <Text style={styles.statLabel}>Membres</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalClubs}</Text>
            <Text style={styles.statLabel}>Clubs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalReunions}</Text>
            <Text style={styles.statLabel}>Réunions</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => onNavigate(item.screen)}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon as any} size={24} color="white" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  clubName: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeCard: {
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
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  clubInfo: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#005AA9',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});
