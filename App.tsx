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
  BASE_URL: 'https://19bf-102-212-189-101.ngrok-free.app', // ✅ URL ngrok mise à jour

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
  // Champs additionnels selon RotaryManager
  nom?: string;
  prenom?: string;
  departement?: string;
  poste?: string;
  dateAdhesion?: string;
}

// Interface pour les membres de comité (selon MembreComiteDto)
interface MembreComite {
  id: string;
  membreId: string;
  nomMembre: string;
  comiteId: string;
  nomComite: string;
  mandatId: string;
  anneeMandat: number;
  estResponsable: boolean;
  estActif: boolean;
  dateNomination: string;
  dateDemission?: string;
  commentaires?: string;
}

// Interface pour les réunions (selon RotaryManager)
interface Reunion {
  id: string;
  clubId: string;
  date: string;
  heure: string;
  typeReunionId: string;
  typeReunionLibelle: string;
  ordresDuJour: string[];
  presences: PresenceReunion[];
  invites: InviteReunion[];
  lieu?: string;
  description?: string;
  statut?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interface pour les types de réunion
interface TypeReunion {
  id: string;
  libelle: string;
  description?: string;
  couleur?: string;
  isActive: boolean;
}

// Interface pour les présences en réunion
interface PresenceReunion {
  id: string;
  reunionId: string;
  membreId: string;
  nomMembre: string;
  present: boolean;
  excuse: boolean;
  commentaire?: string;
}

// Interface pour les invités en réunion
interface InviteReunion {
  id: string;
  reunionId: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  fonction?: string;
  organisation?: string;
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
    console.log('🔄 === CHARGEMENT MEMBRES DU CLUB ===');
    console.log('🏢 Club ID:', clubId);

    try {
      // Utiliser l'endpoint exact de RotaryManager
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/Auth/club/${clubId}/members`;
      console.log('🌐 URL complète:', url);
      console.log('🔧 API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
      console.log('🔧 API_CONFIG.API_PREFIX:', API_CONFIG.API_PREFIX);

      const token = await this.getToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      console.log('🔑 Token présent:', !!token);

      // Vérifier si l'URL ngrok est configurée
      if (API_CONFIG.BASE_URL.includes('REMPLACEZ-PAR-VOTRE-NOUVELLE-URL-NGROK')) {
        throw new Error('URL ngrok non configurée. Veuillez mettre à jour API_CONFIG.BASE_URL');
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'RotaryClubMobile/1.0',
          'Origin': 'https://snack.expo.dev',
        },
      });

      console.log('📡 Réponse Status:', response.status);
      console.log('📡 Réponse OK:', response.ok);

      if (!response.ok) {
        if (response.status === 401) {
          await this.removeToken();
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        const errorText = await response.text();
        console.error('❌ Erreur API membres:', errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 Données membres reçues:', data);

      // Traiter les données selon le format RotaryManager
      let members: Member[] = [];

      if (Array.isArray(data)) {
        members = data;
      } else if (data.members && Array.isArray(data.members)) {
        members = data.members;
      } else if (data.data && Array.isArray(data.data)) {
        members = data.data;
      }

      console.log('✅ Membres traités:', members.length);
      return members;

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des membres:', error);
      throw error;
    }
  }

  // Ajouter un nouveau membre (selon RotaryManager)
  async addMember(memberData: any): Promise<Member> {
    try {
      const response = await this.makeRequest<Member>('/Auth/register', {
        method: 'POST',
        body: JSON.stringify(memberData),
      });

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Erreur lors de l\'ajout du membre');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du membre:', error);
      throw error;
    }
  }

  // Mettre à jour un membre
  async updateMember(clubId: string, userId: string, memberData: any): Promise<Member> {
    try {
      const response = await this.makeRequest<Member>(`/clubs/${clubId}/members/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(memberData),
      });

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Erreur lors de la modification du membre');
    } catch (error) {
      console.error('Erreur lors de la modification du membre:', error);
      throw error;
    }
  }

  // Supprimer un membre
  async deleteMember(clubId: string, userId: string): Promise<void> {
    try {
      const response = await this.makeRequest<void>(`/auth/club/${clubId}/member/${userId}`, {
        method: 'DELETE',
      });

      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de la suppression du membre');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du membre:', error);
      throw error;
    }
  }

  // Obtenir les détails d'un membre
  async getMemberDetail(clubId: string, userId: string): Promise<Member> {
    try {
      const response = await this.makeRequest<Member>(`/clubs/${clubId}/members/${userId}`);

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Erreur lors de la récupération des détails du membre');
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du membre:', error);
      throw error;
    }
  }

  // Rechercher un membre par email
  async getMemberByEmail(clubId: string, email: string): Promise<Member> {
    try {
      const response = await this.makeRequest<Member>(`/clubs/${clubId}/members/search?email=${encodeURIComponent(email)}`);

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Membre non trouvé');
    } catch (error) {
      console.error('Erreur lors de la recherche du membre:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await this.removeToken();
  }

  async saveToken(token: string): Promise<void> {
    await this.setToken(token);
  }

  // Gestion des membres de comité (selon RotaryManager)
  async getMembresComite(): Promise<MembreComite[]> {
    try {
      const response = await this.makeRequest<MembreComite>('/MembresComite');

      if (response.success && response.data) {
        return Array.isArray(response.data) ? response.data : [response.data];
      }
      throw new Error(response.message || 'Erreur lors de la récupération des membres de comité');
    } catch (error) {
      console.error('Erreur lors de la récupération des membres de comité:', error);
      throw error;
    }
  }

  // Affecter un membre à un comité
  async affecterMembreComite(data: {
    membreId: string;
    comiteId: string;
    mandatId: string;
    estResponsable: boolean;
    commentaires?: string;
  }): Promise<MembreComite> {
    try {
      const response = await this.makeRequest<MembreComite>('/MembresComite', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Erreur lors de l\'affectation du membre au comité');
    } catch (error) {
      console.error('Erreur lors de l\'affectation du membre au comité:', error);
      throw error;
    }
  }

  // Affecter un membre à une commission
  async affecterMembreCommission(
    clubId: string,
    commissionClubId: string,
    data: { membreId: string; [key: string]: any }
  ): Promise<any> {
    try {
      const response = await this.makeRequest<any>(`/clubs/${clubId}/commissions/${commissionClubId}/membres`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Erreur lors de l\'affectation du membre à la commission');
    } catch (error) {
      console.error('Erreur lors de l\'affectation du membre à la commission:', error);
      throw error;
    }
  }

  // Obtenir les membres d'une commission
  async getMembresCommission(clubId: string, commissionClubId: string): Promise<any[]> {
    try {
      const response = await this.makeRequest<any>(`/clubs/${clubId}/commissions/${commissionClubId}/membres`);

      if (response.success && response.data) {
        return Array.isArray(response.data) ? response.data : [response.data];
      }
      throw new Error(response.message || 'Erreur lors de la récupération des membres de la commission');
    } catch (error) {
      console.error('Erreur lors de la récupération des membres de la commission:', error);
      throw error;
    }
  }

  // === SERVICES RÉUNIONS ===

  // Obtenir les réunions d'un club
  async getReunions(clubId: string): Promise<Reunion[]> {
    console.log('🔄 === CHARGEMENT RÉUNIONS DU CLUB ===');
    console.log('🏢 Club ID:', clubId);

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/clubs/${clubId}/reunions`;
      console.log('🌐 URL complète:', url);

      const token = await this.getToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'RotaryClubMobile/1.0',
          'Origin': 'https://snack.expo.dev',
        },
      });

      console.log('📡 Réponse Status:', response.status);
      console.log('📡 Réponse OK:', response.ok);

      if (!response.ok) {
        if (response.status === 401) {
          await this.removeToken();
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        const errorText = await response.text();
        console.error('❌ Erreur API réunions:', errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 Données réunions reçues:', data);

      // Traiter les données selon le format RotaryManager
      let reunions: Reunion[] = [];

      if (Array.isArray(data)) {
        reunions = data;
      } else if (data.reunions && Array.isArray(data.reunions)) {
        reunions = data.reunions;
      } else if (data.data && Array.isArray(data.data)) {
        reunions = data.data;
      }

      console.log('✅ Réunions traitées:', reunions.length);
      return reunions;

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des réunions:', error);
      throw error;
    }
  }

  // Obtenir le détail d'une réunion
  async getReunion(clubId: string, reunionId: string): Promise<Reunion> {
    try {
      const response = await this.makeRequest<Reunion>(`/clubs/${clubId}/reunions/${reunionId}`);

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Erreur lors de la récupération de la réunion');
    } catch (error) {
      console.error('Erreur lors de la récupération de la réunion:', error);
      throw error;
    }
  }

  // Créer une nouvelle réunion
  async createReunion(clubId: string, reunionData: {
    date: string;
    heure: string;
    typeReunionId: string;
    ordresDuJour: string[];
    lieu?: string;
    description?: string;
  }): Promise<Reunion> {
    try {
      const response = await this.makeRequest<Reunion>(`/clubs/${clubId}/reunions`, {
        method: 'POST',
        body: JSON.stringify({
          Date: reunionData.date,
          Heure: reunionData.heure,
          TypeReunionId: reunionData.typeReunionId,
          OrdresDuJour: reunionData.ordresDuJour,
          Lieu: reunionData.lieu,
          Description: reunionData.description
        }),
      });

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Erreur lors de la création de la réunion');
    } catch (error) {
      console.error('Erreur lors de la création de la réunion:', error);
      throw error;
    }
  }

  // Mettre à jour une réunion
  async updateReunion(clubId: string, reunionId: string, reunionData: any): Promise<Reunion> {
    try {
      const response = await this.makeRequest<Reunion>(`/clubs/${clubId}/reunions/${reunionId}`, {
        method: 'PUT',
        body: JSON.stringify(reunionData),
      });

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Erreur lors de la modification de la réunion');
    } catch (error) {
      console.error('Erreur lors de la modification de la réunion:', error);
      throw error;
    }
  }

  // Supprimer une réunion
  async deleteReunion(clubId: string, reunionId: string): Promise<void> {
    try {
      const response = await this.makeRequest<void>(`/clubs/${clubId}/reunions/${reunionId}`, {
        method: 'DELETE',
      });

      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de la suppression de la réunion');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la réunion:', error);
      throw error;
    }
  }

  // Obtenir les types de réunion
  async getTypesReunion(clubId: string): Promise<TypeReunion[]> {
    try {
      const response = await this.makeRequest<TypeReunion>(`/clubs/${clubId}/types-reunion`);

      if (response.success && response.data) {
        return Array.isArray(response.data) ? response.data : [response.data];
      }
      throw new Error(response.message || 'Erreur lors de la récupération des types de réunion');
    } catch (error) {
      console.error('Erreur lors de la récupération des types de réunion:', error);
      throw error;
    }
  }

  // Générer un compte-rendu de réunion
  async genererCompteRendu(reunionId: string): Promise<any> {
    try {
      const response = await this.makeRequest<any>(`/Reunion/${reunionId}/compte-rendu`, {
        method: 'POST',
      });

      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Erreur lors de la génération du compte-rendu');
    } catch (error) {
      console.error('Erreur lors de la génération du compte-rendu:', error);
      throw error;
    }
  }
}

const apiService = new ApiService();

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
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(true); // Afficher le login par défaut
  const [loginForm, setLoginForm] = useState({ email: '', password: '', clubId: '' });
  const [clubs, setClubs] = useState<Club[]>([]);
  const [showClubPicker, setShowClubPicker] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [membresComite, setMembresComite] = useState<MembreComite[]>([]);
  const [reunions, setReunions] = useState<Reunion[]>([]);
  const [typesReunion, setTypesReunion] = useState<TypeReunion[]>([]);
  const [selectedReunion, setSelectedReunion] = useState<Reunion | null>(null);
  const [showCreateReunion, setShowCreateReunion] = useState(false);
  const [showTypeReunionPicker, setShowTypeReunionPicker] = useState(false);
  const [reunionForm, setReunionForm] = useState({
    date: '',
    heure: '',
    typeReunionId: '',
    lieu: '',
    description: '',
    ordresDuJour: ['']
  });

  // Charger les données au démarrage
  useEffect(() => {
    const init = async () => {
      console.log('🚀 === INITIALISATION DE L\'APPLICATION ===');

      await initializeApp();

      // Essayer de charger les clubs depuis l'API en premier
      console.log('🔄 Tentative de chargement des clubs depuis l\'API...');
      await loadClubs(); // Chargera les vrais clubs ou les clubs de test en fallback
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
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'RotaryClubMobile/1.0',
          'Origin': 'https://snack.expo.dev',
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
        console.log('✅ === CLUBS CHARGÉS AVEC SUCCÈS DEPUIS L\'API ===');
        console.log(`📊 ${finalClubsData.length} clubs disponibles pour la sélection`);
        console.log('🎉 Les vrais clubs de la base de données sont maintenant disponibles !');

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

      // Aucun club disponible si l'API échoue
      setClubs([]);

      if (showAlerts) {
        let errorMessage = '';

        if (error.name === 'AbortError') {
          errorMessage = `Timeout de la requête (10s).\n\n⚠️ Vérifiez que :\n• Votre API backend est démarrée (port 5265)\n• Votre URL ngrok est à jour et accessible\n• Votre connexion internet fonctionne\n\nURL actuelle: ${API_CONFIG.BASE_URL}`;
        } else if (error.message.includes('fetch') || error.message.includes('network')) {
          errorMessage = `Impossible de joindre l'API backend.\n\n⚠️ Vérifiez que :\n• Votre API backend est démarrée (port 5265)\n• Votre URL ngrok est à jour\n• Votre connexion internet fonctionne\n\nURL actuelle: ${API_CONFIG.BASE_URL}`;
        } else {
          errorMessage = `Erreur API: ${error.message}\n\nURL: ${API_CONFIG.BASE_URL}`;
        }

        Alert.alert('Erreur de connexion API', errorMessage);
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
      console.log('🔄 Utilisateur récupéré dans initializeApp:', user);

      // Traiter la structure de réponse
      let processedUser;
      if (user.success && user.user) {
        processedUser = {
          ...user.user,
          clubId: user.user.primaryClubId || user.user.clubId,
          clubName: user.user.primaryClubName || user.user.clubName,
          fullName: `${user.user.firstName} ${user.user.lastName}`.trim()
        };
      } else {
        processedUser = {
          ...user,
          clubId: user.primaryClubId || user.clubId,
          clubName: user.primaryClubName || user.clubName,
          fullName: user.fullName || `${user.firstName} ${user.lastName}`.trim()
        };
      }

      console.log('🔄 Utilisateur traité:', processedUser);
      setCurrentUser(processedUser);
      setIsAuthenticated(true);
      setShowLogin(false); // Masquer le login si déjà connecté

      // Charger les données si on a un clubId
      if (processedUser.clubId) {
        console.log('🔄 Chargement des données pour club:', processedUser.clubId);
        await loadMembers(processedUser.clubId);
        await loadReunions(processedUser.clubId);
        await loadTypesReunion(processedUser.clubId);
      } else {
        console.log('❌ Pas de clubId trouvé dans processedUser');
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
      console.log('🔄 === DÉBUT CHARGEMENT MEMBRES ===');
      console.log('🏢 Club ID:', clubId);
      console.log('🏢 Type de Club ID:', typeof clubId);
      console.log('🏢 Club ID valide:', !!clubId);

      const membersData = await apiService.getClubMembers(clubId);
      console.log('✅ Membres chargés (brut):', membersData);
      console.log('✅ Nombre de membres:', membersData.length);
      console.log('✅ Type de données:', typeof membersData);
      console.log('✅ Est un tableau:', Array.isArray(membersData));

      // Traiter les données pour s'assurer qu'elles ont le bon format
      const processedMembers = membersData.map(member => ({
        ...member,
        fullName: member.fullName || `${member.firstName || member.prenom || ''} ${member.lastName || member.nom || ''}`.trim(),
        clubJoinedDateFormatted: member.clubJoinedDateFormatted ||
          (member.dateAdhesion ? new Date(member.dateAdhesion).toLocaleDateString('fr-FR') :
           member.clubJoinedDate ? new Date(member.clubJoinedDate).toLocaleDateString('fr-FR') : 'N/A'),
        roles: member.roles || []
      }));

      setMembers(processedMembers);
      console.log('✅ Membres traités et stockés:', processedMembers.length);

    } catch (error) {
      console.error('❌ Erreur lors du chargement des membres:', error);

      let errorMessage = 'Impossible de charger les membres depuis l\'API.';

      if (error.message.includes('401') || error.message.includes('Session expirée')) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        // Forcer la déconnexion
        setIsAuthenticated(false);
        setCurrentUser(null);
        setShowLogin(true);
      } else if (error.message.includes('403')) {
        errorMessage = 'Vous n\'avez pas l\'autorisation d\'accéder aux membres de ce club.';
      } else if (error.message.includes('404')) {
        errorMessage = 'Club non trouvé ou aucun membre dans ce club.';
      }

      Alert.alert('Erreur de chargement des membres', errorMessage);
      setMembers([]);
    } finally {
      setLoading(false);
      console.log('🏁 Fin du chargement des membres');
    }
  };

  // Charger les membres de comité
  const loadMembresComite = async () => {
    try {
      console.log('🔄 === CHARGEMENT MEMBRES DE COMITÉ ===');
      const membresComiteData = await apiService.getMembresComite();
      console.log('✅ Membres de comité chargés:', membresComiteData.length);
      setMembresComite(membresComiteData);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des membres de comité:', error);
      // Ne pas afficher d'erreur car ce n'est pas critique
      setMembresComite([]);
    }
  };

  // Charger les réunions du club
  const loadReunions = async (clubId: string) => {
    try {
      setLoading(true);
      console.log('🔄 === DÉBUT CHARGEMENT RÉUNIONS ===');
      console.log('🏢 Club ID:', clubId);

      const reunionsData = await apiService.getReunions(clubId);
      console.log('✅ Réunions chargées (brut):', reunionsData);
      console.log('✅ Nombre de réunions:', reunionsData.length);

      // Traiter les données pour s'assurer qu'elles ont le bon format
      const processedReunions = reunionsData.map(reunion => ({
        ...reunion,
        dateFormatted: reunion.date ? new Date(reunion.date).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : 'Date non disponible',
        heureFormatted: reunion.heure || 'Heure non disponible',
        ordresDuJour: reunion.ordresDuJour || [],
        presences: reunion.presences || [],
        invites: reunion.invites || []
      }));

      setReunions(processedReunions);
      // Mettre à jour aussi l'ancien état meetings pour compatibilité
      setMeetings(processedReunions.map(r => ({
        id: r.id,
        title: r.typeReunionLibelle || 'Réunion',
        date: r.date,
        location: r.lieu || 'Lieu non précisé',
        attendees: r.presences || []
      })));

      console.log('✅ Réunions traitées et stockées:', processedReunions.length);

    } catch (error) {
      console.error('❌ Erreur lors du chargement des réunions:', error);

      let errorMessage = 'Impossible de charger les réunions depuis l\'API.';

      if (error.message.includes('401') || error.message.includes('Session expirée')) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        setIsAuthenticated(false);
        setCurrentUser(null);
        setShowLogin(true);
      } else if (error.message.includes('403')) {
        errorMessage = 'Vous n\'avez pas l\'autorisation d\'accéder aux réunions de ce club.';
      } else if (error.message.includes('404')) {
        errorMessage = 'Club non trouvé ou aucune réunion dans ce club.';
      }

      Alert.alert('Erreur de chargement des réunions', errorMessage);
      setReunions([]);
      setMeetings([]);
    } finally {
      setLoading(false);
      console.log('🏁 Fin du chargement des réunions');
    }
  };

  // Charger les types de réunion
  const loadTypesReunion = async (clubId: string) => {
    try {
      console.log('🔄 === CHARGEMENT TYPES DE RÉUNION ===');
      const typesData = await apiService.getTypesReunion(clubId);
      console.log('✅ Types de réunion chargés:', typesData.length);
      setTypesReunion(typesData);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des types de réunion:', error);
      // Ne pas afficher d'erreur car ce n'est pas critique
      setTypesReunion([]);
    }
  };

  // Créer une nouvelle réunion
  const handleCreateReunion = async () => {
    if (!reunionForm.date || !reunionForm.heure || !reunionForm.typeReunionId) {
      Alert.alert('Erreur', 'Veuillez remplir au moins la date, l\'heure et le type de réunion');
      return;
    }

    if (!currentUser?.clubId) {
      Alert.alert('Erreur', 'Club non identifié. Veuillez vous reconnecter.');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 === CRÉATION NOUVELLE RÉUNION ===');
      console.log('📝 Données du formulaire:', reunionForm);

      // Préparer les données selon le format RotaryManager
      const reunionData = {
        date: reunionForm.date,
        heure: reunionForm.heure,
        typeReunionId: reunionForm.typeReunionId,
        lieu: reunionForm.lieu,
        description: reunionForm.description,
        ordresDuJour: reunionForm.ordresDuJour.filter(ordre => ordre.trim() !== '')
      };

      console.log('📤 Données envoyées:', reunionData);

      const nouvelleReunion = await apiService.createReunion(currentUser.clubId, reunionData);
      console.log('✅ Réunion créée:', nouvelleReunion);

      // Recharger la liste des réunions
      await loadReunions(currentUser.clubId);

      // Réinitialiser le formulaire
      setReunionForm({
        date: '',
        heure: '',
        typeReunionId: '',
        lieu: '',
        description: '',
        ordresDuJour: ['']
      });

      setShowCreateReunion(false);
      Alert.alert('Succès', 'Réunion créée avec succès !');

    } catch (error) {
      console.error('❌ Erreur lors de la création de la réunion:', error);
      Alert.alert(
        'Erreur de création',
        error.message || 'Une erreur est survenue lors de la création de la réunion'
      );
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un ordre du jour
  const addOrdreJour = () => {
    setReunionForm(prev => ({
      ...prev,
      ordresDuJour: [...prev.ordresDuJour, '']
    }));
  };

  // Supprimer un ordre du jour
  const removeOrdreJour = (index: number) => {
    if (reunionForm.ordresDuJour.length > 1) {
      setReunionForm(prev => ({
        ...prev,
        ordresDuJour: prev.ordresDuJour.filter((_, i) => i !== index)
      }));
    }
  };

  // Mettre à jour un ordre du jour
  const updateOrdreJour = (index: number, value: string) => {
    setReunionForm(prev => ({
      ...prev,
      ordresDuJour: prev.ordresDuJour.map((ordre, i) => i === index ? value : ordre)
    }));
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
      Alert.alert('Erreur', 'Aucun club disponible. Vérifiez que votre API backend est accessible.');
      return;
    }

    try {
      setLoading(true);
      console.log('Tentative de connexion avec:', {
        email: loginForm.email,
        clubId: loginForm.clubId
      });

      const user = await apiService.login(loginForm.email, loginForm.password, loginForm.clubId);
      console.log('Utilisateur connecté (brut):', user);

      // Traiter la structure de réponse
      let processedUser;
      if (user.success && user.user) {
        processedUser = {
          ...user.user,
          clubId: user.user.primaryClubId || user.user.clubId,
          clubName: user.user.primaryClubName || user.user.clubName,
          fullName: `${user.user.firstName} ${user.user.lastName}`.trim()
        };
      } else {
        processedUser = {
          ...user,
          clubId: user.primaryClubId || user.clubId,
          clubName: user.primaryClubName || user.clubName,
          fullName: user.fullName || `${user.firstName} ${user.lastName}`.trim()
        };
      }

      console.log('Utilisateur traité:', processedUser);
      setCurrentUser(processedUser);
      setIsAuthenticated(true);
      setShowLogin(false);
      setLoginForm({ email: '', password: '', clubId: '' });

      // Charger toutes les données du club
      if (processedUser.clubId) {
        console.log('🔄 Chargement des données pour club:', processedUser.clubId);
        await loadMembers(processedUser.clubId);
        await loadReunions(processedUser.clubId);
        await loadTypesReunion(processedUser.clubId);
        await loadMembresComite();
      } else {
        console.log('❌ Pas de clubId trouvé après login');
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
      setMembers([]);
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
          'User-Agent': 'RotaryClubMobile/1.0',
          'Origin': 'https://snack.expo.dev',
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
        console.log('👤 Profil brut récupéré:', profile);

        // Traiter la structure de réponse (peut contenir success + user)
        let processedProfile;
        if (profile.success && profile.user) {
          // Structure avec success + user
          processedProfile = {
            ...profile.user,
            clubId: profile.user.primaryClubId || profile.user.clubId,
            clubName: profile.user.primaryClubName || profile.user.clubName,
            fullName: `${profile.user.firstName} ${profile.user.lastName}`.trim()
          };
        } else {
          // Structure directe
          processedProfile = {
            ...profile,
            clubId: profile.primaryClubId || profile.clubId,
            clubName: profile.primaryClubName || profile.clubName,
            fullName: profile.fullName || `${profile.firstName} ${profile.lastName}`.trim()
          };
        }

        console.log('👤 Profil traité:', {
          id: processedProfile.id,
          email: processedProfile.email,
          clubId: processedProfile.clubId,
          clubName: processedProfile.clubName
        });

        // Mettre à jour l'état de l'application
        setCurrentUser(processedProfile);
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
          <Text style={styles.statNumber}>{meetings.length}</Text>
          <Text style={styles.statLabel}>Réunions</Text>
        </View>
      </View>

      {meetings.length > 0 ? (
        <View style={styles.nextMeetingCard}>
          <Text style={styles.cardTitle}>Prochaine réunion</Text>
          <Text style={styles.meetingTitle}>{meetings[0].title}</Text>
          <Text style={styles.meetingDate}>
            {new Date(meetings[0].date).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          <Text style={styles.meetingLocation}>{meetings[0].location}</Text>
        </View>
      ) : (
        <View style={styles.nextMeetingCard}>
          <Text style={styles.cardTitle}>Réunions</Text>
          <Text style={styles.meetingTitle}>Aucune réunion programmée</Text>
          <Text style={styles.meetingDate}>
            Connectez-vous pour voir les réunions de votre club
          </Text>
        </View>
      )}

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
  const ReunionsScreen = () => {
    console.log('🖥️ === RENDU REUNIONS SCREEN ===');
    console.log('🖥️ Nombre de réunions:', reunions.length);
    console.log('🖥️ Loading:', loading);
    console.log('🖥️ Réunions détaillées:', reunions);

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Réunions ({reunions.length})</Text>
          {isAuthenticated && (
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={() => {
                console.log('🔄 Bouton refresh réunions cliqué');
                if (currentUser?.clubId) {
                  console.log('🔄 Rechargement des réunions pour club:', currentUser.clubId);
                  loadReunions(currentUser.clubId);
                } else {
                  console.log('❌ Pas de clubId disponible');
                  Alert.alert('Erreur', 'Impossible de recharger : club non identifié');
                }
              }}
            >
              <Ionicons name="refresh" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Chargement des réunions...</Text>
            <Text style={styles.debugText}>
              Club ID: {currentUser?.clubId || 'Non défini'}
            </Text>
          </View>
        ) : reunions.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>Aucune réunion trouvée</Text>
            <Text style={styles.emptyStateText}>
              {!currentUser?.clubId
                ? 'Club non identifié. Veuillez vous reconnecter.'
                : 'Aucune réunion programmée dans ce club ou erreur de chargement.'
              }
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                console.log('🔄 Bouton retry réunions cliqué');
                if (currentUser?.clubId) {
                  loadReunions(currentUser.clubId);
                } else {
                  Alert.alert('Erreur', 'Veuillez vous reconnecter pour identifier votre club');
                }
              }}
            >
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={reunions}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.meetingCard}
                onPress={() => {
                  setSelectedReunion(item);
                  Alert.alert(
                    item.typeReunionLibelle || 'Réunion',
                    `Date: ${item.dateFormatted}\nHeure: ${item.heureFormatted}\nLieu: ${item.lieu || 'Non précisé'}\n\nOrdres du jour: ${item.ordresDuJour.length}\nPrésents: ${item.presences.length}\nInvités: ${item.invites.length}`,
                    [
                      { text: 'Fermer', style: 'cancel' },
                      { text: 'Voir détails', onPress: () => console.log('Détails réunion:', item.id) }
                    ]
                  );
                }}
              >
                <View style={styles.meetingHeader}>
                  <Text style={styles.meetingTitle}>
                    {item.typeReunionLibelle || 'Réunion'}
                  </Text>
                  <View style={styles.meetingTypeIndicator}>
                    <Text style={styles.meetingTypeText}>
                      {item.typeReunionLibelle?.substring(0, 3).toUpperCase() || 'REU'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.meetingDate}>
                  📅 {item.dateFormatted}
                </Text>

                <Text style={styles.meetingTime}>
                  🕐 {item.heureFormatted}
                </Text>

                {item.lieu && (
                  <Text style={styles.meetingLocation}>
                    📍 {item.lieu}
                  </Text>
                )}

                <View style={styles.meetingStats}>
                  <Text style={styles.meetingStatItem}>
                    📋 {item.ordresDuJour.length} ordre(s) du jour
                  </Text>
                  <Text style={styles.meetingStatItem}>
                    👥 {item.presences.length} présent(s)
                  </Text>
                  {item.invites.length > 0 && (
                    <Text style={styles.meetingStatItem}>
                      🎯 {item.invites.length} invité(s)
                    </Text>
                  )}
                </View>

                {item.description && (
                  <Text style={styles.meetingDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContainer}
            refreshing={loading}
            onRefresh={() => currentUser?.clubId && loadReunions(currentUser.clubId)}
          />
        )}

        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            console.log('🎯 Ouverture du formulaire de création de réunion');
            if (typesReunion.length === 0 && currentUser?.clubId) {
              console.log('🔄 Chargement des types de réunion avant création');
              loadTypesReunion(currentUser.clubId);
            }
            setShowCreateReunion(true);
          }}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  // Composant de création de réunion
  const CreateReunionModal = () => (
    <Modal
      visible={showCreateReunion}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCreateReunion(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '90%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nouvelle Réunion</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowCreateReunion(false);
                setReunionForm({
                  date: '',
                  heure: '',
                  typeReunionId: '',
                  lieu: '',
                  description: '',
                  ordresDuJour: ['']
                });
              }}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={true}>
            {/* Date */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date *</Text>
              <TextInput
                style={styles.textInput}
                value={reunionForm.date}
                onChangeText={(text) => setReunionForm(prev => ({ ...prev, date: text }))}
                placeholder="YYYY-MM-DD (ex: 2024-12-25)"
                placeholderTextColor="#999"
              />
            </View>

            {/* Heure */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Heure *</Text>
              <TextInput
                style={styles.textInput}
                value={reunionForm.heure}
                onChangeText={(text) => setReunionForm(prev => ({ ...prev, heure: text }))}
                placeholder="HH:MM (ex: 18:30)"
                placeholderTextColor="#999"
              />
            </View>

            {/* Type de réunion */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Type de réunion *</Text>
              <TouchableOpacity
                style={[
                  styles.selectButton,
                  typesReunion.length === 0 && styles.selectButtonDisabled
                ]}
                onPress={() => {
                  if (typesReunion.length === 0) {
                    Alert.alert('Aucun type', 'Aucun type de réunion disponible.');
                    return;
                  }
                  setShowTypeReunionPicker(true);
                }}
                disabled={typesReunion.length === 0}
              >
                <Text style={[
                  styles.selectText,
                  !reunionForm.typeReunionId && styles.selectPlaceholder,
                  typesReunion.length === 0 && styles.selectTextDisabled
                ]}>
                  {typesReunion.length === 0
                    ? '⚠️ Aucun type disponible'
                    : reunionForm.typeReunionId
                      ? typesReunion.find(type => type.id === reunionForm.typeReunionId)?.libelle || 'Sélectionnez un type'
                      : `Sélectionnez un type (${typesReunion.length} disponibles)`
                  }
                </Text>
                <Text style={styles.selectArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Lieu */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Lieu</Text>
              <TextInput
                style={styles.textInput}
                value={reunionForm.lieu}
                onChangeText={(text) => setReunionForm(prev => ({ ...prev, lieu: text }))}
                placeholder="Lieu de la réunion"
                placeholderTextColor="#999"
              />
            </View>

            {/* Description */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                value={reunionForm.description}
                onChangeText={(text) => setReunionForm(prev => ({ ...prev, description: text }))}
                placeholder="Description de la réunion"
                placeholderTextColor="#999"
                multiline={true}
                numberOfLines={3}
              />
            </View>

            {/* Ordres du jour */}
            <View style={styles.inputContainer}>
              <View style={styles.ordresJourHeader}>
                <Text style={styles.inputLabel}>Ordres du jour</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={addOrdreJour}
                >
                  <Text style={styles.addButtonText}>+ Ajouter</Text>
                </TouchableOpacity>
              </View>

              {reunionForm.ordresDuJour.map((ordre, index) => (
                <View key={index} style={styles.ordreJourItem}>
                  <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    value={ordre}
                    onChangeText={(text) => updateOrdreJour(index, text)}
                    placeholder={`Ordre du jour ${index + 1}`}
                    placeholderTextColor="#999"
                  />
                  {reunionForm.ordresDuJour.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeOrdreJour(index)}
                    >
                      <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {/* Boutons d'action */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowCreateReunion(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, loading && styles.modalButtonDisabled]}
                onPress={handleCreateReunion}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.modalButtonTextPrimary}>Créer</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Modal de sélection du type de réunion
  const TypeReunionPickerModal = () => (
    <Modal
      visible={showTypeReunionPicker}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowTypeReunionPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Sélectionnez le type de réunion ({typesReunion.length} disponibles)
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTypeReunionPicker(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView}>
            {typesReunion.length === 0 ? (
              <View style={styles.modalEmptyState}>
                <Text style={styles.modalEmptyText}>
                  Aucun type de réunion disponible.{'\n'}
                  Vérifiez votre connexion API.
                </Text>
              </View>
            ) : (
              typesReunion.map((type, index) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.modalOption,
                    reunionForm.typeReunionId === type.id && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    console.log(`🎯 Type de réunion sélectionné: ${type.libelle} (ID: ${type.id})`);
                    setReunionForm(prev => ({ ...prev, typeReunionId: type.id }));
                    setShowTypeReunionPicker(false);
                  }}
                >
                  <View style={styles.modalOptionContent}>
                    <Text style={[
                      styles.modalOptionText,
                      reunionForm.typeReunionId === type.id && styles.modalOptionTextSelected
                    ]}>
                      {type.libelle}
                    </Text>
                    {type.description && (
                      <Text style={styles.modalOptionSubtext}>
                        {type.description}
                      </Text>
                    )}
                  </View>
                  {reunionForm.typeReunionId === type.id && (
                    <Text style={styles.modalCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Écran des membres
  const MembersScreen = () => {
    console.log('🖥️ === RENDU MEMBERS SCREEN ===');
    console.log('🖥️ Nombre de membres:', members.length);
    console.log('🖥️ Loading:', loading);
    console.log('🖥️ IsAuthenticated:', isAuthenticated);
    console.log('🖥️ CurrentUser:', currentUser);
    console.log('🖥️ Membres détaillés:', members);

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Membres ({members.length})</Text>
          {isAuthenticated && (
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={() => {
                console.log('🔄 Bouton refresh cliqué');
                if (currentUser?.clubId) {
                  console.log('🔄 Rechargement des membres pour club:', currentUser.clubId);
                  loadMembers(currentUser.clubId);
                } else {
                  console.log('❌ Pas de clubId disponible');
                  Alert.alert('Erreur', 'Impossible de recharger : club non identifié');
                }
              }}
            >
              <Ionicons name="refresh" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Chargement des membres...</Text>
            <Text style={styles.debugText}>
              Club ID: {currentUser?.clubId || 'Non défini'}
            </Text>
          </View>
        ) : members.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>Aucun membre trouvé</Text>
            <Text style={styles.emptyStateText}>
              {!currentUser?.clubId
                ? 'Club non identifié. Veuillez vous reconnecter.'
                : 'Aucun membre dans ce club ou erreur de chargement.'
              }
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                console.log('🔄 Bouton retry cliqué');
                if (currentUser?.clubId) {
                  loadMembers(currentUser.clubId);
                } else {
                  Alert.alert('Erreur', 'Veuillez vous reconnecter pour identifier votre club');
                }
              }}
            >
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.secondary, marginTop: 8 }]}
              onPress={async () => {
                console.log('🔍 Test de connectivité API...');
                try {
                  const testUrl = `${API_CONFIG.BASE_URL}/api/Clubs`;
                  const response = await fetch(testUrl, {
                    method: 'GET',
                    headers: {
                      'Accept': 'application/json',
                      'ngrok-skip-browser-warning': 'true',
                    },
                  });

                  const isWorking = response.ok;
                  console.log('🔍 Test API - Status:', response.status);

                  Alert.alert(
                    'Test de connectivité',
                    `URL: ${API_CONFIG.BASE_URL}\n\nStatus: ${response.status}\n\n${isWorking ? '✅ API accessible' : '❌ API non accessible'}\n\nClub ID: ${currentUser?.clubId || 'Non défini'}`
                  );
                } catch (error) {
                  console.error('🔍 Erreur test:', error);
                  Alert.alert(
                    'Test de connectivité',
                    `URL: ${API_CONFIG.BASE_URL}\n\n❌ Erreur: ${error.message}`
                  );
                }
              }}
            >
              <Text style={styles.retryButtonText}>🔍 Tester API</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: '#9C27B0', marginTop: 8 }]}
              onPress={() => {
                console.log('🔍 === DEBUG UTILISATEUR ===');
                console.log('🔍 CurrentUser complet:', currentUser);
                console.log('🔍 CurrentUser.clubId:', currentUser?.clubId);
                console.log('🔍 CurrentUser.primaryClubId:', currentUser?.primaryClubId);
                console.log('🔍 IsAuthenticated:', isAuthenticated);
                console.log('🔍 Membres actuels:', members);

                Alert.alert(
                  'Debug Utilisateur',
                  `Utilisateur: ${currentUser?.fullName || 'Non défini'}\n\nClub ID: ${currentUser?.clubId || 'Non défini'}\n\nPrimary Club ID: ${currentUser?.primaryClubId || 'Non défini'}\n\nClub Name: ${currentUser?.clubName || currentUser?.primaryClubName || 'Non défini'}\n\nNombre de membres: ${members.length}\n\nAuthentifié: ${isAuthenticated ? 'Oui' : 'Non'}`
                );
              }}
            >
              <Text style={styles.retryButtonText}>🔍 Debug User</Text>
            </TouchableOpacity>
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
                      {item.fullName ?
                        item.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2) :
                        ((item.firstName || item.prenom || 'U')[0] + (item.lastName || item.nom || 'U')[0])
                      }
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>
                      {item.fullName || `${item.firstName || item.prenom || ''} ${item.lastName || item.nom || ''}`.trim() || 'Nom non disponible'}
                    </Text>
                    <Text style={styles.memberRole}>
                      {item.roles && item.roles.length > 0 ? item.roles.join(', ') :
                       item.poste || 'Membre'}
                    </Text>
                    {item.departement && (
                      <Text style={styles.memberDepartment}>{item.departement}</Text>
                    )}
                  </View>
                  <View style={styles.memberStatus}>
                    <View style={[
                      styles.statusIndicator,
                      item.isActive ? styles.statusActive : styles.statusInactive
                    ]} />
                  </View>
                </View>
                <View style={styles.memberDetails}>
                  <Text style={styles.memberEmail}>{item.email}</Text>
                  {item.phoneNumber && (
                    <Text style={styles.memberPhone}>📞 {item.phoneNumber}</Text>
                  )}
                  <Text style={styles.memberJoinDate}>
                    Membre depuis: {item.clubJoinedDateFormatted || 'Date non disponible'}
                  </Text>
                  {item.clubName && (
                    <Text style={styles.memberClub}>🏢 {item.clubName}</Text>
                  )}
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

    // Debug modal
    console.log('🔍 DEBUG MODAL:', {
      showClubPicker,
      clubsLength: clubs.length,
      clubsData: clubs.map(c => ({ id: c.id, name: c.name }))
    });

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
                    Alert.alert('Aucun club', 'Aucun club disponible. Vérifiez votre connexion API.');
                    return;
                  }
                  console.log(`🎯 Ouverture du sélecteur de clubs avec ${clubs.length} clubs disponibles`);
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
                    ? '⚠️ Aucun club disponible'
                    : loginForm.clubId
                      ? clubs.find(club => club.id === loginForm.clubId)?.name || 'Sélectionnez votre club'
                      : `Sélectionnez votre club (${clubs.length} disponibles)`
                  }
                </Text>
                <Text style={styles.selectArrow}>▼</Text>
              </TouchableOpacity>
            </View>


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
            onPress={async () => {
              console.log('🔍 === TEST NOUVELLE URL NGROK ===');
              try {
                const response = await fetch(`${API_CONFIG.BASE_URL}/api/Clubs`, {
                  method: 'GET',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                    'User-Agent': 'RotaryClubMobile/1.0',
                    'Origin': 'https://snack.expo.dev',
                  },
                });

                const isWorking = response.ok;
                console.log('🔍 Test URL - Status:', response.status);
                console.log('🔍 Test URL - OK:', isWorking);

                Alert.alert(
                  'Test URL ngrok',
                  `URL: ${API_CONFIG.BASE_URL}\n\nStatus: ${response.status}\n\n${isWorking ? '✅ API accessible !' : '❌ API non accessible'}\n\nClubs locaux: ${clubs.length}`
                );
              } catch (error) {
                console.error('🔍 Erreur test URL:', error);
                Alert.alert(
                  'Test URL ngrok',
                  `URL: ${API_CONFIG.BASE_URL}\n\n❌ Erreur: ${error.message}\n\nClubs locaux: ${clubs.length}`
                );
              }
            }}
          >
            <Text style={styles.debugButtonText}>🔍 Tester URL ngrok</Text>
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
              <Text style={styles.modalTitle}>
                Sélectionnez votre club ({clubs.length} disponibles)
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  console.log('🚪 Fermeture de la modal');
                  setShowClubPicker(false);
                }}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              {clubs.length === 0 ? (
                <View style={styles.modalEmptyState}>
                  <Text style={styles.modalEmptyText}>
                    Aucun club disponible.{'\n'}
                    Vérifiez votre connexion API.
                  </Text>
                </View>
              ) : (
                clubs.map((club, index) => {
                  console.log(`🏢 Rendu club modal ${index + 1}/${clubs.length}: ${club.name}`);
                  return (
                    <TouchableOpacity
                      key={club.id}
                      style={[
                        styles.modalOption,
                        loginForm.clubId === club.id && styles.modalOptionSelected
                      ]}
                      onPress={() => {
                        console.log(`🎯 Club sélectionné: ${club.name} (ID: ${club.id})`);
                        setLoginForm(prev => ({ ...prev, clubId: club.id }));
                        setShowClubPicker(false);
                      }}
                    >
                      <View style={styles.modalOptionContent}>
                        <Text style={[
                          styles.modalOptionText,
                          loginForm.clubId === club.id && styles.modalOptionTextSelected
                        ]}>
                          {club.name}
                        </Text>
                        <Text style={styles.modalOptionSubtext}>
                          {club.city}, {club.country}
                        </Text>
                      </View>
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

      {/* Modals de création de réunion */}
      <CreateReunionModal />
      <TypeReunionPickerModal />

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
          onPress={() => {
            console.log('🎯 Navigation vers Reunions');
            setCurrentScreen('Reunions');
            // Forcer le rechargement des réunions si nécessaire
            if (currentUser?.clubId && reunions.length === 0 && !loading) {
              console.log('🔄 Chargement automatique des réunions');
              loadReunions(currentUser.clubId);
            }
          }}
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
          onPress={() => {
            console.log('🎯 Navigation vers Members');
            setCurrentScreen('Members');
            // Forcer le rechargement des membres si nécessaire
            if (currentUser?.clubId && members.length === 0 && !loading) {
              console.log('🔄 Chargement automatique des membres');
              loadMembers(currentUser.clubId);
            }
          }}
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

// Styles
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
    textAlign: 'center',
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
    marginBottom: 4,
  },
  roleText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginBottom: 16,
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
    color: '#666',
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
    color: colors.text,
    marginBottom: 12,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  meetingDate: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 4,
  },
  meetingLocation: {
    fontSize: 14,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    margin: 16,
  },
  actionButton: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '30%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  meetingCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  meetingAttendees: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  meetingTypeIndicator: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  meetingTypeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  meetingTime: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 4,
    fontWeight: '500',
  },
  meetingStats: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  meetingStatItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  meetingDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  // Styles pour la création de réunion
  ordresJourHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  ordreJourItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeButton: {
    backgroundColor: colors.error,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  modalButtonSecondary: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalButtonPrimary: {
    backgroundColor: colors.primary,
  },
  modalButtonDisabled: {
    backgroundColor: '#ccc',
  },
  modalButtonTextSecondary: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  modalButtonTextPrimary: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberInfo: {
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
    paddingLeft: 62,
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  memberPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  memberJoinDate: {
    fontSize: 12,
    color: '#999',
  },
  memberDepartment: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  memberClub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  memberStatus: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: '#4CAF50',
  },
  statusInactive: {
    backgroundColor: '#F44336',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  refreshButton: {
    backgroundColor: colors.secondary,
    padding: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 16,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  loginContainer: {
    flex: 1,
    padding: 16,
  },
  loginForm: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loginLogo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  selectContainer: {
    position: 'relative',
  },
  selectButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectButtonDisabled: {
    backgroundColor: '#f0f0f0',
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
    color: '#999',
  },
  selectArrow: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  loginSubmitButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loginSubmitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginSubmitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  debugButton: {
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  debugButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  loginNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  // Styles pour la modal de sélection des clubs
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
    maxHeight: '80%',
    overflow: 'hidden',
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
    backgroundColor: colors.surface,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  modalCloseButton: {
    padding: 5,
    marginLeft: 10,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  modalScrollView: {
    maxHeight: 400,
    backgroundColor: colors.surface,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: colors.surface,
    minHeight: 60,
  },
  modalOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  modalOptionContent: {
    flex: 1,
    marginRight: 10,
  },
  modalOptionText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  modalOptionTextSelected: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  modalOptionSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  modalCheckmark: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
  },
  modalEmptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  modalEmptyText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
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
    fontSize: 32,
  },
  profileName: {
    fontSize: 28,
  },
  profileRole: {
    fontSize: 18,
  },
  profileSection: {
    backgroundColor: colors.surface,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    padding: 16,
    paddingBottom: 8,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileItemText: {
    marginLeft: 12,
    flex: 1,
  },
  profileItemLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  profileItemValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  profileAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileActionText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
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
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
