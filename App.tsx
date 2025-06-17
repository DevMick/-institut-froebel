/**
 * Rotary Club Mobile App - Version Expo Snack avec API Backend
 * Application connectée à l'API ASP.NET Core avec PostgreSQL
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

// Configuration API et Base de données
const API_CONFIG = {
  // ⚠️ IMPORTANT: Remplacez cette URL par votre URL ngrok actuelle
  // Pour obtenir votre URL ngrok, exécutez: ngrok http 5265
  // Puis copiez l'URL HTTPS ici (ex: https://abc123.ngrok-free.app)
  BASE_URL: 'https://2d3b-102-212-189-101.ngrok-free.app', // URL ngrok mise à jour

  // Configuration PostgreSQL pour connexion directe (Expo Snack compatible)
  // IMPORTANT: En production, utilisez des variables d'environnement
  DATABASE: {
    host: process.env.DB_HOST || 'your-postgres-host',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'defaultdb',
    username: process.env.DB_USER || 'your-username',
    password: process.env.DB_PASSWORD || 'your-password',
    ssl: true
  },

  API_PREFIX: '/api',
  TIMEOUT: 10000,
};

// Types TypeScript
interface Club {
  id: string;
  name: string;
  code: string;
  description: string;
  address: string;
  city: string;
  country: string;
  phoneNumber: string;
  email: string;
  website: string;
  logoUrl: string;
  foundedDate: string;
  isActive: boolean;
}

interface Member {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  isActive: boolean;
  roles: string[];
  clubId: string;
  clubName?: string;
  clubJoinedDate: string;
  clubJoinedDateFormatted: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  member?: T;
  members?: T[];
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  clubId?: string;
  clubName?: string;
}

// Services API
class ApiService {
  private async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  }

  private async setToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync('authToken', token);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token:', error);
    }
  }

  private async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('authToken');
    } catch (error) {
      console.error('Erreur lors de la suppression du token:', error);
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getToken();
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${endpoint}`;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Header requis pour ngrok
        ...options.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          await this.removeToken();
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  }

  async login(email: string, password: string, clubId: string): Promise<User> {
    // Format exact comme dans RotaryManager
    const loginData = { email, password, clubId };

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/Auth/login`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      // Vérifier si on a un token dans la réponse
      if (result.token) {
        await this.setToken(result.token);

        // Récupérer le profil utilisateur après login
        try {
          const profile = await this.getCurrentUser();
          return profile;
        } catch (error) {
          // Si on ne peut pas récupérer le profil, créer un utilisateur basique
          return {
            id: 'user-id',
            email: email,
            firstName: 'Utilisateur',
            lastName: 'Connecté',
            fullName: 'Utilisateur Connecté',
            clubId: clubId
          };
        }
      }

      throw new Error(result.message || result.Message || 'Erreur de connexion');
    } catch (error) {
      console.error('Erreur lors du login:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      // Essayer d'abord /Auth/me
      const response = await this.makeRequest<User>('/Auth/me');
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.log('Tentative avec getCurrentProfile...');
    }

    try {
      // Essayer getCurrentProfile comme dans RotaryManager
      const response = await this.makeRequest<User>('/Auth/getCurrentProfile');
      if (response) {
        return response;
      }
    } catch (error) {
      console.log('getCurrentProfile échoué aussi');
    }

    throw new Error('Impossible de récupérer les informations utilisateur');
  }

  async getClubMembers(clubId: string): Promise<Member[]> {
    const response = await this.makeRequest<Member>(`/club/${clubId}/members`);
    if (response.success && response.members) {
      return response.members;
    }
    throw new Error(response.message || 'Erreur lors de la récupération des membres');
  }

  async logout(): Promise<void> {
    await this.removeToken();
  }
}

const apiService = new ApiService();

// Données de fallback (utilisées si l'API n'est pas disponible)
const fallbackMembers: Member[] = [
  {
    id: '1',
    email: 'kouame.yao@rotary.org',
    firstName: 'Kouamé',
    lastName: 'Yao',
    fullName: 'Kouamé Yao',
    phoneNumber: '+225 07 12 34 56 78',
    isActive: true,
    roles: ['Président'],
    clubId: 'club-1',
    clubName: 'Rotary Club Abidjan II Plateaux',
    clubJoinedDate: '2020-01-15T00:00:00Z',
    clubJoinedDateFormatted: '15/01/2020'
  },
  {
    id: '2',
    email: 'aya.traore@rotary.org',
    firstName: 'Aya',
    lastName: 'Traoré',
    fullName: 'Aya Traoré',
    phoneNumber: '+225 05 23 45 67 89',
    isActive: true,
    roles: ['Secrétaire'],
    clubId: 'club-1',
    clubName: 'Rotary Club Abidjan II Plateaux',
    clubJoinedDate: '2019-06-01T00:00:00Z',
    clubJoinedDateFormatted: '01/06/2019'
  },
  {
    id: '3',
    email: 'ibrahim.kone@rotary.org',
    firstName: 'Ibrahim',
    lastName: 'Koné',
    fullName: 'Ibrahim Koné',
    phoneNumber: '+225 01 34 56 78 90',
    isActive: true,
    roles: ['Trésorier'],
    clubId: 'club-1',
    clubName: 'Rotary Club Abidjan II Plateaux',
    clubJoinedDate: '2021-03-10T00:00:00Z',
    clubJoinedDateFormatted: '10/03/2021'
  },
  {
    id: '4',
    email: 'fatou.ouattara@rotary.org',
    firstName: 'Fatou',
    lastName: 'Ouattara',
    fullName: 'Fatou Ouattara',
    phoneNumber: '+225 09 45 67 89 01',
    isActive: true,
    roles: ['Vice-Présidente'],
    clubId: 'club-1',
    clubName: 'Rotary Club Abidjan II Plateaux',
    clubJoinedDate: '2018-09-15T00:00:00Z',
    clubJoinedDateFormatted: '15/09/2018'
  }
];

// Données de fallback pour le club
const fallbackClub: Club = {
  id: 'club-1',
  name: 'Rotary Club Abidjan II Plateaux',
  code: 'RC-ABIDJAN-II-PLATEAUX',
  description: 'Club Rotary d\'Abidjan II Plateaux, fondé en 1988',
  address: 'Boulevard Lagunaire, Cocody',
  city: 'Abidjan',
  country: 'Côte d\'Ivoire',
  phoneNumber: '+225 27 22 48 56 78',
  email: 'contact@rotary-abidjan-plateaux.org',
  website: 'https://www.rotary-abidjan-plateaux.org',
  logoUrl: '',
  foundedDate: '1988-06-20T00:00:00Z',
  isActive: true
};

const mockMeetings = [
  {
    id: '1',
    title: 'Réunion Hebdomadaire',
    date: '2024-12-19T18:30:00Z',
    location: 'Hôtel Pullman Abidjan',
    attendees: ['1', '2', '3', '4'],
    status: 'upcoming'
  },
  {
    id: '2',
    title: 'Assemblée Générale',
    date: '2024-12-26T14:00:00Z',
    location: 'Centre de Conférences de Cocody',
    attendees: ['1', '2', '3', '4'],
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
  const [members, setMembers] = useState<Member[]>(fallbackMembers);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(true); // Afficher le login par défaut
  const [loginForm, setLoginForm] = useState({ email: '', password: '', clubId: '' });
  const [clubs, setClubs] = useState<Club[]>([]);
  const [showClubPicker, setShowClubPicker] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Charger les données au démarrage
  useEffect(() => {
    const init = async () => {
      await initializeApp();
      await loadClubs(); // Charger les clubs automatiquement
    };
    init();
  }, []); // Pas de dépendances car on veut que ça s'exécute une seule fois

  const loadClubs = async (showAlerts = false) => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des clubs depuis la base de données...');
      console.log('URL API:', `${API_CONFIG.BASE_URL}/api/Clubs`);

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/Clubs`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      console.log('📡 Réponse API clubs - Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur API clubs:', errorText);
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const clubsData = await response.json();
      console.log('📊 Clubs reçus de la base de données:', clubsData);
      console.log('📈 Nombre de clubs trouvés:', clubsData?.length || 0);

      if (Array.isArray(clubsData) && clubsData.length > 0) {
        // Remplacer par les clubs de la base de données
        setClubs(clubsData);
        console.log('✅ Clubs chargés avec succès depuis la base de données');
        console.log(`📊 ${clubsData.length} clubs disponibles pour la sélection`);

        if (showAlerts) {
          Alert.alert('Succès', `${clubsData.length} clubs chargés depuis la base de données !`);
        }

        // Ne pas présélectionner de club - laisser l'utilisateur choisir
      } else {
        console.warn('⚠️ Aucun club trouvé dans la base de données');
        setClubs([]); // Aucun club disponible

        if (showAlerts) {
          Alert.alert(
            'Aucun club trouvé',
            'La base de données ne contient aucun club.'
          );
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des clubs:', error);
      setClubs([]); // Aucun club disponible en cas d'erreur

      if (showAlerts) {
        const errorMessage = error.message.includes('fetch')
          ? `Impossible de joindre l'API backend.\n\n⚠️ Vérifiez que :\n• Votre API backend est démarrée (port 5265)\n• Votre URL ngrok est à jour\n• Votre connexion internet fonctionne\n\nURL actuelle: ${API_CONFIG.BASE_URL}`
          : `Erreur API: ${error.message}`;

        Alert.alert('Erreur de connexion', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const initializeApp = async () => {
    try {
      setIsInitializing(true);
      // Vérifier si l'utilisateur est déjà connecté (token stocké)
      const user = await apiService.getCurrentUser();
      setCurrentUser(user);
      setIsAuthenticated(true);
      setShowLogin(false); // Masquer le login si déjà connecté

      // Charger les membres si on a un clubId
      if (user.clubId) {
        await loadMembers(user.clubId);
      }
    } catch (error) {
      console.log('Utilisateur non connecté, affichage de l\'écran de connexion');
      setIsAuthenticated(false);
      setShowLogin(true); // Forcer l'affichage du login
    } finally {
      setIsInitializing(false);
    }
  };

  const loadMembers = async (clubId: string) => {
    try {
      setLoading(true);
      const membersData = await apiService.getClubMembers(clubId);
      setMembers(membersData);
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
      Alert.alert('Erreur', 'Impossible de charger les membres. Utilisation des données hors ligne.');
      setMembers(fallbackMembers);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      Alert.alert('Erreur', 'Veuillez remplir votre email et mot de passe');
      return;
    }

    if (!loginForm.clubId) {
      Alert.alert('Erreur', 'Veuillez sélectionner votre club dans la liste');
      return;
    }

    if (clubs.length === 0) {
      Alert.alert('Erreur', 'Aucun club disponible. Veuillez d\'abord charger les clubs depuis la base de données.');
      return;
    }

    try {
      setLoading(true);
      console.log('Tentative de connexion avec:', {
        email: loginForm.email,
        clubId: loginForm.clubId
      });

      const user = await apiService.login(loginForm.email, loginForm.password, loginForm.clubId);
      console.log('Utilisateur connecté:', user);

      setCurrentUser(user);
      setIsAuthenticated(true);
      setShowLogin(false);
      setLoginForm({ email: '', password: '', clubId: '' });

      // Charger les membres du club
      if (user.clubId) {
        await loadMembers(user.clubId);
      }

      Alert.alert('Succès', `Connexion réussie ! Bienvenue ${user.fullName || user.firstName}`);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      Alert.alert('Erreur de connexion', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      setIsAuthenticated(false);
      setCurrentUser(null);
      setMembers(fallbackMembers);
      Alert.alert('Déconnexion', 'Vous avez été déconnecté avec succès');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const testApiConnection = async () => {
    try {
      setLoading(true);

      // Test 1: Chargement des clubs
      console.log('Test 1: Chargement des clubs...');
      const clubsResponse = await fetch(`${API_CONFIG.BASE_URL}/api/Clubs`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      let clubsOk = clubsResponse.ok;
      let clubsData = null;
      if (clubsOk) {
        clubsData = await clubsResponse.json();
      }

      // Test 2: Endpoint de login avec données de test
      console.log('Test 2: Test endpoint login...');
      const loginResponse = await fetch(`${API_CONFIG.BASE_URL}/api/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'test123',
          clubId: clubsData && clubsData.length > 0 ? clubsData[0].id : 'test-club-id'
        }),
      });

      let message = '🔍 Résultats des tests:\n\n';

      if (clubsOk) {
        message += `✅ Clubs: ${clubsData?.length || 0} clubs trouvés\n`;
      } else {
        message += `❌ Clubs: Erreur ${clubsResponse.status}\n`;
      }

      if (loginResponse.status === 400 || loginResponse.status === 401) {
        message += '✅ Login: Endpoint trouvé (credentials invalides)\n';
      } else if (loginResponse.ok) {
        message += '✅ Login: Endpoint accessible\n';
      } else {
        message += `❌ Login: Erreur ${loginResponse.status}\n`;
      }

      message += `\n🌐 URL: ${API_CONFIG.BASE_URL}`;

      Alert.alert('Test de Connexion API', message);

    } catch (error) {
      Alert.alert('Erreur de connexion', `Impossible de joindre l'API:\n${error}\n\nURL: ${API_CONFIG.BASE_URL}`);
    } finally {
      setLoading(false);
    }
  };

  // Écran d'accueil
  const HomeScreen = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rotary Club</Text>
        <Text style={styles.headerSubtitle}>Abidjan II Plateaux</Text>
      </View>

      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>
          Bienvenue, {currentUser ? currentUser.fullName : 'Utilisateur'}
        </Text>
        <Text style={styles.roleText}>
          {currentUser?.clubName || 'Rotary Club Abidjan II Plateaux'}
        </Text>
        <Text style={styles.welcomeSubtext}>
          Connecté en tant que {currentUser?.fullName || 'Utilisateur'}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{members.length}</Text>
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
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Membres</Text>
          {isAuthenticated && (
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={() => currentUser?.clubId && loadMembers(currentUser.clubId)}
            >
              <Ionicons name="refresh" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Chargement des membres...</Text>
          </View>
        ) : (
          <FlatList
            data={members}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.memberCard}>
                <View style={styles.memberHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {item.fullName.split(' ').map((n: string) => n[0]).join('')}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{item.fullName}</Text>
                    <Text style={styles.memberRole}>
                      {item.roles.length > 0 ? item.roles.join(', ') : 'Membre'}
                    </Text>
                  </View>
                </View>
                <View style={styles.memberDetails}>
                  <Text style={styles.memberEmail}>{item.email}</Text>
                  {item.phoneNumber && (
                    <Text style={styles.memberPhone}>{item.phoneNumber}</Text>
                  )}
                  <Text style={styles.memberJoinDate}>
                    Membre depuis: {item.clubJoinedDateFormatted}
                  </Text>
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContainer}
            refreshing={loading}
            onRefresh={() => currentUser?.clubId && loadMembers(currentUser.clubId)}
          />
        )}
      </View>
    );
  };

  // Écran de connexion obligatoire
  const LoginScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Connexion Requise</Text>
      </View>

      <ScrollView style={styles.loginContainer}>
        <View style={styles.loginForm}>
          <View style={styles.loginLogo}>
            <Ionicons name="shield-checkmark" size={80} color={colors.primary} />
          </View>
          <Text style={styles.loginTitle}>Authentification Requise</Text>
          <Text style={styles.loginSubtitle}>
            Veuillez vous connecter pour accéder à l'application
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              value={loginForm.email}
              onChangeText={(text) => setLoginForm(prev => ({ ...prev, email: text }))}
              placeholder="votre.email@rotary.org"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mot de passe</Text>
            <TextInput
              style={styles.textInput}
              value={loginForm.password}
              onChangeText={(text) => setLoginForm(prev => ({ ...prev, password: text }))}
              placeholder="Votre mot de passe"
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Club</Text>
            <View style={styles.selectContainer}>
              <TouchableOpacity
                style={[
                  styles.selectButton,
                  clubs.length === 0 && styles.selectButtonDisabled
                ]}
                onPress={() => {
                  if (clubs.length === 0) {
                    Alert.alert('Aucun club', 'Veuillez d\'abord charger les clubs depuis la base de données.');
                    return;
                  }
                  setShowClubPicker(true);
                }}
                disabled={clubs.length === 0}
              >
                <Text style={[
                  styles.selectText,
                  !loginForm.clubId && styles.selectPlaceholder,
                  clubs.length === 0 && styles.selectTextDisabled
                ]}>
                  {clubs.length === 0
                    ? '⚠️ Aucun club disponible - Cliquez sur "Charger les clubs"'
                    : loginForm.clubId
                      ? clubs.find(club => club.id === loginForm.clubId)?.name || 'Sélectionnez votre club'
                      : 'Sélectionnez votre club'
                  }
                </Text>
                <Text style={styles.selectArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {clubs.length === 0 && (
              <TouchableOpacity
                style={styles.reloadClubsButton}
                onPress={() => loadClubs(true)}
                disabled={loading}
              >
                <Text style={styles.reloadClubsButtonText}>
                  {loading ? 'Chargement...' : '🔄 Charger les clubs depuis la base de données'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.loginSubmitButton, loading && styles.loginSubmitButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginSubmitButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>



          <TouchableOpacity
            style={styles.testApiButton}
            onPress={testApiConnection}
            disabled={loading}
          >
            <Text style={styles.testApiButtonText}>
              {loading ? 'Test en cours...' : 'Tester la connexion API'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.loginNote}>
            Note: En cas d'échec de connexion à l'API, l'application utilisera les données de démonstration.
          </Text>
        </View>
      </ScrollView>

      {/* Modal pour sélection du club */}
      <Modal
        visible={showClubPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowClubPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionnez votre club</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowClubPicker(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              {clubs.map((club) => (
                <TouchableOpacity
                  key={club.id}
                  style={[
                    styles.modalOption,
                    loginForm.clubId === club.id && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    setLoginForm(prev => ({ ...prev, clubId: club.id }));
                    setShowClubPicker(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    loginForm.clubId === club.id && styles.modalOptionTextSelected
                  ]}>
                    {club.name}
                  </Text>
                  {loginForm.clubId === club.id && (
                    <Text style={styles.modalCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );

  // Écran de profil
  const ProfileScreen = () => (
    <ScrollView style={styles.container}>
      <View style={[styles.header, styles.profileHeader]}>
        <View style={[styles.avatar, styles.profileAvatar]}>
          <Text style={[styles.avatarText, styles.profileAvatarText]}>KY</Text>
        </View>
        <Text style={[styles.headerTitle, styles.profileName]}>Kouamé Yao</Text>
        <Text style={[styles.headerSubtitle, styles.profileRole]}>Président</Text>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>
        <View style={styles.profileItem}>
          <Ionicons name="mail" size={20} color={colors.primary} />
          <View style={styles.profileItemText}>
            <Text style={styles.profileItemLabel}>Email</Text>
            <Text style={styles.profileItemValue}>kouame.yao@rotary.org</Text>
          </View>
        </View>
        <View style={styles.profileItem}>
          <Ionicons name="business" size={20} color={colors.primary} />
          <View style={styles.profileItemText}>
            <Text style={styles.profileItemLabel}>Club</Text>
            <Text style={styles.profileItemValue}>Rotary Club Abidjan II Plateaux</Text>
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
        <TouchableOpacity
          style={styles.profileAction}
          onPress={() => {
            Alert.alert(
              'Déconnexion',
              'Êtes-vous sûr de vouloir vous déconnecter ?',
              [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Déconnecter',
                  style: 'destructive',
                  onPress: () => {
                    handleLogout();
                    setShowLogin(true);
                  }
                }
              ]
            );
          }}
        >
          <Ionicons name="log-out" size={20} color={colors.error} />
          <Text style={[styles.profileActionText, { color: colors.error }]}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // Écran de chargement initial
  const LoadingScreen = () => (
    <View style={styles.loadingContainer}>
      <Ionicons name="shield-checkmark" size={80} color={colors.primary} />
      <Text style={styles.loadingTitle}>Rotary Club</Text>
      <Text style={styles.loadingSubtitle}>Abidjan II Plateaux</Text>
      <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      <Text style={styles.loadingText}>Vérification de l'authentification...</Text>
    </View>
  );

  // Fonction pour rendre l'écran actuel
  const renderCurrentScreen = () => {
    // Afficher l'écran de chargement pendant l'initialisation
    if (isInitializing) {
      return <LoadingScreen />;
    }

    // Forcer l'affichage du login si non authentifié
    if (!isAuthenticated || showLogin) {
      return <LoginScreen />;
    }

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

      {/* Navigation en bas - seulement si authentifié */}
      {isAuthenticated && !showLogin && !isInitializing && (
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
      )}
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
  welcomeSubtext: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    marginTop: 8,
    fontStyle: 'italic',
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
  // Nouveaux styles pour l'API
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  memberJoinDate: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.6,
    marginTop: 4,
  },

  loginContainer: {
    flex: 1,
    padding: 16,
  },
  loginForm: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  loginSubmitButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loginSubmitButtonDisabled: {
    opacity: 0.6,
  },
  loginSubmitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginNote: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Styles pour l'authentification obligatoire
  loginLogo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginTop: 20,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginTop: 5,
  },

  testApiButton: {
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  testApiButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectContainer: {
    marginTop: 5,
  },
  selectButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
  },
  selectText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  selectPlaceholder: {
    color: '#999',
  },
  selectTextDisabled: {
    color: '#ccc',
  },
  selectArrow: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    width: '90%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalCloseButton: {
    padding: 5,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  modalList: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionSelected: {
    backgroundColor: `${colors.primary}10`,
  },
  modalOptionText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  modalOptionTextSelected: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  modalCheckmark: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
  reloadClubsButton: {
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  reloadClubsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});
