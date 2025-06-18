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
  BASE_URL: 'https://REMPLACEZ-PAR-VOTRE-NOUVELLE-URL-NGROK.ngrok-free.app', // ⚠️ METTEZ À JOUR CETTE URL !

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
      // Fallback pour Expo Snack web - utiliser localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('authToken');
      }
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      // Fallback vers localStorage en cas d'erreur
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('authToken');
      }
      return null;
    }
  }

  private async setToken(token: string): Promise<void> {
    try {
      // Fallback pour Expo Snack web - utiliser localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('authToken', token);
        return;
      }
      await SecureStore.setItemAsync('authToken', token);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token:', error);
      // Fallback vers localStorage en cas d'erreur
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('authToken', token);
      }
    }
  }

  private async removeToken(): Promise<void> {
    try {
      // Fallback pour Expo Snack web - utiliser localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('authToken');
        return;
      }
      await SecureStore.deleteItemAsync('authToken');
    } catch (error) {
      console.error('Erreur lors de la suppression du token:', error);
      // Fallback vers localStorage en cas d'erreur
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('authToken');
      }
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

  async getCurrentProfile(): Promise<User> {
    console.log('👤 Récupération du profil utilisateur via getCurrentProfile...');
    try {
      const response = await this.makeRequest<User>('/Auth/getCurrentProfile');
      console.log('👤 Profil reçu via getCurrentProfile:', response);
      return response.data || response;
    } catch (error) {
      console.log('👤 Tentative avec /Auth/me...');
      const response = await this.makeRequest<User>('/Auth/me');
      console.log('👤 Profil reçu via /Auth/me:', response);
      return response.data || response;
    }
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
      // Charger les clubs de test immédiatement pour que l'utilisateur puisse les voir
      const testClubs = [
        {
          id: "1b435dcd-5f8a-4acf-97b3-10cf66b3b1a2",
          name: "Rotary Club Abidjan II Plateau",
          code: "ABJ-PLT-02",
          city: "Abidjan",
          country: "Côte d'Ivoire"
        },
        {
          id: "dde25fd8-4e42-4373-87cd-e389c9a308f7",
          name: "Rotary Club Abidjan Cocody",
          code: "ABJ-COC-01",
          city: "Abidjan",
          country: "Côte d'Ivoire"
        },
        {
          id: "e6b0e316-e3ff-4a1a-a5ab-dd9c56f21aed",
          name: "Rotary Club Yamoussoukro",
          code: "YAM-CAP-01",
          city: "Yamoussoukro",
          country: "Côte d'Ivoire"
        },
        {
          id: "1cc41b86-d0a8-4f5d-8b51-22fe7a3cb868",
          name: "Rotary Club Paris International",
          code: "PAR-INT-07",
          city: "Paris",
          country: "France"
        },
        {
          id: "6cd60b18-0d01-41d5-b1f4-a49085ddec7d",
          name: "Rotary Club Dakar Almadies",
          code: "DKR-ALM-03",
          city: "Dakar",
          country: "Sénégal"
        },
        {
          id: "796f83c9-361a-4953-a7c3-87d4c42be6fc",
          name: "Club Rotary International",
          code: "CRI",
          city: "Rotary City",
          country: "World"
        }
      ];

      console.log('🚀 Chargement immédiat des clubs de test pour l\'interface');
      setClubs(testClubs);

      await initializeApp();
      await loadClubs(); // Essayer de charger depuis l'API (remplacera les clubs de test si succès)
    };
    init();
  }, []); // Pas de dépendances car on veut que ça s'exécute une seule fois

  const loadClubs = async (showAlerts = false) => {
    try {
      setLoading(true);
      console.log('🔄 === DÉBUT CHARGEMENT CLUBS ===');
      console.log('🌐 URL API complète:', `${API_CONFIG.BASE_URL}/api/Clubs`);
      console.log('🔧 Headers envoyés:', {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      });

      // Vérifier d'abord si l'URL est configurée
      if (API_CONFIG.BASE_URL.includes('REMPLACEZ-PAR-VOTRE-NOUVELLE-URL-NGROK')) {
        console.error('❌ URL ngrok non configurée !');
        throw new Error('URL ngrok non configurée. Veuillez mettre à jour API_CONFIG.BASE_URL avec votre vraie URL ngrok.');
      }

      console.log('🚀 Début de la requête fetch...');

      // Ajouter un timeout pour éviter que la requête reste bloquée
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ TIMEOUT de la requête après 10 secondes');
        controller.abort();
      }, 10000); // 10 secondes

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/Clubs`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('📡 === RÉPONSE REÇUE ===');
      console.log('📡 Status:', response.status);
      console.log('📡 StatusText:', response.statusText);
      console.log('📡 OK:', response.ok);
      console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ === ERREUR HTTP ===');
        console.error('❌ Status:', response.status);
        console.error('❌ StatusText:', response.statusText);
        console.error('❌ Error Text:', errorText);

        if (response.status === 404) {
          throw new Error(`Endpoint non trouvé (404). Vérifiez que votre API backend est démarrée et que l'endpoint /api/Clubs existe.`);
        } else if (response.status === 500) {
          throw new Error(`Erreur serveur (500). Vérifiez les logs de votre API backend.`);
        } else {
          throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}\n${errorText}`);
        }
      }

      const responseText = await response.text();
      console.log('📄 === RÉPONSE BRUTE ===');
      console.log('📄 Longueur:', responseText.length);
      console.log('📄 Premiers 200 caractères:', responseText.substring(0, 200));
      console.log('📄 Réponse complète:', responseText);

      let clubsData;
      try {
        clubsData = JSON.parse(responseText);
        console.log('📊 === PARSING JSON RÉUSSI ===');
        console.log('📊 Type:', typeof clubsData);
        console.log('📊 Est un tableau:', Array.isArray(clubsData));
        console.log('📊 Données parsées:', clubsData);
      } catch (parseError) {
        console.error('❌ === ERREUR PARSING JSON ===');
        console.error('❌ Erreur:', parseError);
        console.error('❌ Contenu qui a causé l\'erreur:', responseText);
        throw new Error(`Réponse API invalide - pas du JSON valide: ${parseError.message}`);
      }

      console.log('📈 === ANALYSE DES DONNÉES ===');
      console.log('📈 Type de données reçues:', typeof clubsData);
      console.log('📈 Est-ce un tableau?', Array.isArray(clubsData));
      console.log('📈 Nombre d\'éléments:', clubsData?.length || 'N/A');

      // Gérer différents formats de réponse
      let finalClubsData = [];

      if (Array.isArray(clubsData)) {
        finalClubsData = clubsData;
        console.log('✅ Format: Tableau direct');
      } else if (clubsData && clubsData.data && Array.isArray(clubsData.data)) {
        finalClubsData = clubsData.data;
        console.log('✅ Format: Objet avec propriété data');
      } else if (clubsData && clubsData.clubs && Array.isArray(clubsData.clubs)) {
        finalClubsData = clubsData.clubs;
        console.log('✅ Format: Objet avec propriété clubs');
      } else if (clubsData && typeof clubsData === 'object') {
        // Si c'est un objet unique, le mettre dans un tableau
        finalClubsData = [clubsData];
        console.log('✅ Format: Objet unique converti en tableau');
      }

      console.log('📊 === CLUBS FINAUX ===');
      console.log('📊 Nombre de clubs finaux:', finalClubsData.length);

      if (finalClubsData.length > 0) {
        finalClubsData.forEach((club, index) => {
          console.log(`🏢 Club ${index + 1}:`, {
            id: club.id,
            name: club.name,
            code: club.code,
            city: club.city,
            country: club.country
          });
        });

        // Mettre à jour l'état
        setClubs(finalClubsData);
        console.log('✅ === CLUBS CHARGÉS AVEC SUCCÈS ===');
        console.log(`📊 ${finalClubsData.length} clubs disponibles pour la sélection`);

        if (showAlerts) {
          Alert.alert('Succès', `${finalClubsData.length} clubs chargés depuis la base de données !`);
        }
      } else {
        console.warn('⚠️ === AUCUN CLUB TROUVÉ ===');
        console.warn('⚠️ Données reçues:', clubsData);
        setClubs([]);

        if (showAlerts) {
          Alert.alert(
            'Aucun club trouvé',
            `La réponse de l'API ne contient pas de clubs valides.\n\nType: ${typeof clubsData}\nArray: ${Array.isArray(clubsData)}\nLength: ${clubsData?.length || 'undefined'}`
          );
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des clubs:', error);
      console.error('❌ Type d\'erreur:', error.name);
      console.error('❌ Message d\'erreur:', error.message);

      // Utiliser des données de test en cas d'erreur pour permettre les tests
      const testClubs = [
        {
          id: "1b435dcd-5f8a-4acf-97b3-10cf66b3b1a2",
          name: "Rotary Club Abidjan II Plateau",
          code: "ABJ-PLT-02",
          city: "Abidjan",
          country: "Côte d'Ivoire"
        },
        {
          id: "dde25fd8-4e42-4373-87cd-e389c9a308f7",
          name: "Rotary Club Abidjan Cocody",
          code: "ABJ-COC-01",
          city: "Abidjan",
          country: "Côte d'Ivoire"
        },
        {
          id: "e6b0e316-e3ff-4a1a-a5ab-dd9c56f21aed",
          name: "Rotary Club Yamoussoukro",
          code: "YAM-CAP-01",
          city: "Yamoussoukro",
          country: "Côte d'Ivoire"
        },
        {
          id: "1cc41b86-d0a8-4f5d-8b51-22fe7a3cb868",
          name: "Rotary Club Paris International",
          code: "PAR-INT-07",
          city: "Paris",
          country: "France"
        },
        {
          id: "6cd60b18-0d01-41d5-b1f4-a49085ddec7d",
          name: "Rotary Club Dakar Almadies",
          code: "DKR-ALM-03",
          city: "Dakar",
          country: "Sénégal"
        },
        {
          id: "796f83c9-361a-4953-a7c3-87d4c42be6fc",
          name: "Club Rotary International",
          code: "CRI",
          city: "Rotary City",
          country: "World"
        }
      ];

      console.log('🔄 Utilisation des clubs de test en fallback');
      setClubs(testClubs);

      if (showAlerts) {
        let errorMessage = '';

        if (error.name === 'AbortError') {
          errorMessage = `Timeout de la requête (5s).\n\n⚠️ Vérifiez que :\n• Votre API backend est démarrée (port 5265)\n• Votre URL ngrok est à jour et accessible\n• Votre connexion internet fonctionne\n\nURL actuelle: ${API_CONFIG.BASE_URL}\n\n✅ Clubs de test chargés pour permettre les tests.`;
        } else if (error.message.includes('fetch') || error.message.includes('network')) {
          errorMessage = `Impossible de joindre l'API backend.\n\n⚠️ Vérifiez que :\n• Votre API backend est démarrée (port 5265)\n• Votre URL ngrok est à jour\n• Votre connexion internet fonctionne\n\nURL actuelle: ${API_CONFIG.BASE_URL}\n\n✅ Clubs de test chargés pour permettre les tests.`;
        } else {
          errorMessage = `Erreur API: ${error.message}\n\nURL: ${API_CONFIG.BASE_URL}\n\n✅ Clubs de test chargés pour permettre les tests.`;
        }

        Alert.alert('API non accessible - Mode test', errorMessage);
      }
    } finally {
      setLoading(false);
      console.log('🏁 Fin du chargement des clubs');
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

  // Fonction de connexion réelle (basée sur RotaryManager)
  const handleRealLogin = async () => {
    if (!loginForm.email || !loginForm.password || !loginForm.clubId) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      console.log('🔐 === DÉBUT CONNEXION RÉELLE ===');
      console.log('📧 Email:', loginForm.email);
      console.log('🏢 Club ID:', loginForm.clubId);
      console.log('🌐 URL API:', `${API_CONFIG.BASE_URL}/api/Auth/login`);

      // Préparer les données de connexion (format exact du web)
      const loginData = {
        email: loginForm.email,
        password: loginForm.password,
        clubId: loginForm.clubId
      };

      console.log('📤 Données envoyées:', { ...loginData, password: '[MASQUÉ]' });

      // Appel API de connexion
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(loginData),
      });

      console.log('📥 Réponse HTTP Status:', response.status);
      console.log('📥 Réponse OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur de connexion:', errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Réponse de connexion reçue');
      console.log('🔑 Token présent:', !!result.token);
      console.log('✅ Success:', result.success);

      // Vérifier la structure de la réponse (comme dans le web)
      if (result.success && result.token) {
        console.log('🎉 Connexion réussie - Sauvegarde du token...');

        // Sauvegarder le token
        await apiService.saveToken(result.token);
        console.log('💾 Token sauvegardé');

        // Récupérer le profil utilisateur (comme dans le web)
        console.log('👤 Récupération du profil utilisateur...');
        const profile = await apiService.getCurrentProfile();
        console.log('👤 Profil récupéré:', { id: profile.id, email: profile.email, clubId: profile.clubId });

        // Mettre à jour l'état de l'application
        setCurrentUser(profile);
        setIsAuthenticated(true);
        setShowLogin(false);
        setLoginForm({ email: '', password: '', clubId: '' });

        console.log('🏠 Redirection vers l\'application...');
        Alert.alert('Succès', 'Connexion réussie !');
      } else {
        console.error('❌ Réponse invalide:', result);
        throw new Error(result.message || result.Message || 'Erreur lors de la connexion');
      }

    } catch (error) {
      console.error('💥 ERREUR DE CONNEXION:', error);
      Alert.alert(
        'Erreur de connexion',
        error.message || 'Une erreur est survenue lors de la connexion'
      );
    } finally {
      setLoading(false);
      console.log('🔐 === FIN CONNEXION ===');
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
  const LoginScreen = () => {
    console.log('🖥️ === RENDU LOGIN SCREEN ===');
    console.log('🖥️ Nombre de clubs:', clubs.length);
    console.log('🖥️ État clubs détaillé:', clubs);
    console.log('🖥️ Clubs pour sélection:', clubs.map(c => ({ id: c.id, name: c.name })));
    console.log('🖥️ Club sélectionné:', loginForm.clubId);

    return (
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
                    ? '⚠️ Chargement des clubs...'
                    : loginForm.clubId
                      ? clubs.find(club => club.id === loginForm.clubId)?.name || 'Sélectionnez votre club'
                      : `Sélectionnez votre club (${clubs.length} disponibles)`
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
            onPress={handleRealLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginSubmitButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.debugButton}
            onPress={() => {
              console.log('🔍 === VÉRIFICATION URL API ===');
              console.log('🔍 URL actuelle:', API_CONFIG.BASE_URL);
              console.log('🔍 Nombre de clubs chargés:', clubs.length);
              console.log('🔍 Clubs:', clubs);
              Alert.alert(
                'Debug Info',
                `URL API: ${API_CONFIG.BASE_URL}\n\nClubs chargés: ${clubs.length}\n\n${clubs.length === 0 ? '❌ Aucun club chargé' : '✅ Clubs disponibles'}\n\n⚠️ Si les clubs ne se chargent pas, cette URL ngrok est probablement expirée.`
              );
            }}
          >
            <Text style={styles.debugButtonText}>🔍 Debug Info</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reloadClubsButton}
            onPress={() => {
              console.log('🔄 === RECHARGEMENT FORCÉ DES CLUBS ===');
              loadClubs(true);
            }}
            disabled={loading}
          >
            <Text style={styles.reloadClubsButtonText}>
              {loading ? 'Chargement...' : '🔄 Recharger les clubs'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.loginNote}>
            Connectez-vous avec vos identifiants Rotary pour accéder à l'application.
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
              {clubs.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#666', textAlign: 'center' }}>
                    Aucun club disponible.{'\n'}
                    Vérifiez votre connexion API.
                  </Text>
                </View>
              ) : (
                clubs.map((club, index) => {
                  console.log(`🏢 Rendu club ${index + 1}/${clubs.length}:`, club.name);
                  return (
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
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
    );
  };

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

  debugButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debugButtonText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
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
    maxHeight: 500,
    flex: 1,
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
