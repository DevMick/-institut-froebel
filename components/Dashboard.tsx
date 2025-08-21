import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../services/ApiService';
import { User, Club, Member, NavigationScreen } from '../types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface DashboardProps {
  user: User;
  club: Club;
  onLogout: () => void;
  onNavigate: (screen: NavigationScreen) => void;
}

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  screen: NavigationScreen;
  badge?: number;
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
  });

  // Animations
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  const apiService = new ApiService();

  useEffect(() => {
    loadDashboardData();
    startAnimations();
  }, [club.id]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

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

      const clubsData = await apiService.getClubs();

      setStats({
        totalMembers: membersData.length,
        totalClubs: clubsData.length,
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

  const menuItems: MenuItem[] = useMemo(() => [
    {
      id: 'members',
      title: 'Membres',
      subtitle: 'Gérer les membres du club',
      icon: 'people',
      color: '#005AA9',
      screen: 'members' as NavigationScreen,
      badge: stats.totalMembers,
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
      id: 'situation-cotisation',
      title: 'Situation Cotisation',
      subtitle: 'Envoyer situation de cotisation',
      icon: 'document-text',
      color: '#E91E63',
      screen: 'situation-cotisation' as NavigationScreen,
    },
    {
      id: 'compte-rendu',
      title: 'Compte Rendu',
      subtitle: 'Envoyer compte rendu de réunion',
      icon: 'document',
      color: '#FF5722',
      screen: 'compte-rendu' as NavigationScreen,
    },
    {
      id: 'calendrier',
      title: 'Calendrier',
      subtitle: 'Envoyer calendrier mensuel',
      icon: 'calendar',
      color: '#9C27B0',
      screen: 'calendrier' as NavigationScreen,
    },
    {
      id: 'email',
      title: 'Envoyer un email',
      subtitle: 'Contacter les membres du club',
      icon: 'mail',
      color: '#28a745',
      screen: 'email' as NavigationScreen,
    },
    {
      id: 'whatsapp',
      title: 'Envoyer WhatsApp',
      subtitle: 'Message rapide aux membres',
      icon: 'chatbubble',
      color: '#25D366',
      screen: 'whatsapp' as NavigationScreen,
    },
    {
      id: 'clubs',
      title: 'Clubs',
      subtitle: 'Gérer les clubs',
      icon: 'business',
      color: '#6f42c1',
      screen: 'clubs' as NavigationScreen,
      badge: stats.totalClubs,
    },
    {
      id: 'profile',
      title: 'Profil',
      subtitle: 'Gérer votre profil',
      icon: 'person',
      color: '#17a2b8',
      screen: 'profile' as NavigationScreen,
    },
    {
      id: 'settings',
      title: 'Paramètres',
      subtitle: 'Configurer l\'application',
      icon: 'settings',
      color: '#6c757d',
      screen: 'settings' as NavigationScreen,
    },
  ], [stats]);

  const renderMenuItem = (item: MenuItem, index: number) => {
    const itemScaleAnim = new Animated.Value(1);

    const handlePressIn = () => {
      Animated.spring(itemScaleAnim, {
        toValue: 0.95,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(itemScaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View
        key={item.id}
        style={[
          styles.menuItemContainer,
          {
            transform: [{ scale: itemScaleAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => onNavigate(item.screen)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: item.color }]}>
            <Ionicons name={item.icon as any} size={24} color="white" />
            {item.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          </View>
          
          <View style={styles.menuArrow}>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#005AA9" />
      
      {/* Header Moderne */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.welcomeText}>Bonjour, {user.firstName}</Text>
              <Text style={styles.clubName}>{club.name}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Statistiques */}
        <Animated.View 
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#4CAF50' }]}>
              <Ionicons name="people" size={24} color="white" />
            </View>
            <Text style={styles.statNumber}>{stats.totalMembers}</Text>
            <Text style={styles.statLabel}>Membres</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#FF9800' }]}>
              <Ionicons name="business" size={24} color="white" />
            </View>
            <Text style={styles.statNumber}>{stats.totalClubs}</Text>
            <Text style={styles.statLabel}>Clubs</Text>
          </View>
        </Animated.View>

        {/* Menu Items */}
        <Animated.View 
          style={[
            styles.menuContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.menuSectionTitle}>Fonctionnalités</Text>
          {menuItems.map((item, index) => renderMenuItem(item, index))}
        </Animated.View>

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#005AA9" />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#005AA9',
    paddingTop: 20,
    paddingBottom: 25,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  clubName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  menuContainer: {
    marginBottom: 20,
  },
  menuSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    marginLeft: 5,
  },
  menuItemContainer: {
    marginBottom: 12,
  },
  menuItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 18,
  },
  menuArrow: {
    marginLeft: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '500',
  },
});
