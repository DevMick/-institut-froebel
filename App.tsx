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
  Modal,
  Linking,
  Platform
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
  // Nouvelles propriétés pour fonctions et commissions
  fonctions?: {
    comiteId: string;
    comiteNom: string;
    estResponsable: boolean;
    estActif: boolean;
    dateNomination: string;
    mandatAnnee: number;
  }[];
  commissions?: {
    commissionId: string;
    commissionNom: string;
    estResponsable: boolean;
    estActif: boolean;
    dateNomination: string;
    mandatAnnee: number;
  }[];
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

// Interface pour les membres de commission (selon MembreCommissionDetailDto)
interface MembreCommission {
  id: string;
  membreId: string;
  nomCompletMembre: string;
  emailMembre: string;
  estResponsable: boolean;
  estActif: boolean;
  dateNomination: string;
  dateDemission?: string;
  commentaires?: string;
  mandatId: string;
  mandatAnnee: number;
  mandatDescription: string;
  commissionId: string;
  nomCommission: string;
}

// Interface pour les fonctions
interface Fonction {
  id: string;
  nom: string;
  description?: string;
  estActive: boolean;
}

// Interface pour les commissions
interface Commission {
  id: string;
  nom: string;
  description?: string;
  estActive: boolean;
  notesSpecifiques?: string;
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
  confirme?: boolean;
  commentaire?: string;
}

// Interface pour les ordres du jour détaillés
interface OrdreJourDetaille {
  id: string;
  reunionId: string;
  ordre: number;
  titre: string;
  description?: string;
  dureeEstimee?: number; // en minutes
  responsable?: string;
  documents?: string[];
  statut: 'en_attente' | 'en_cours' | 'termine' | 'reporte';
  notes?: string;
}

// Interface pour les comptes-rendus
interface CompteRendu {
  id: string;
  reunionId: string;
  dateGeneration: string;
  contenu: string;
  format: 'word' | 'pdf' | 'html';
  url?: string;
  genereParId: string;
  genereParNom: string;
}

// Interface pour les filtres de réunion
interface FiltresReunion {
  dateDebut?: string;
  dateFin?: string;
  typeReunionId?: string;
  statut?: string;
  recherche?: string;
  presenceUtilisateur?: boolean;
}

// Interface pour les statistiques de réunion
interface StatistiquesReunion {
  totalReunions: number;
  reunionsParMois: { [key: string]: number };
  tauxPresence: number;
  membresLesPlusActifs: { membreId: string; nomMembre: string; nombrePresences: number }[];
  typesLesPlusFrequents: { typeId: string; typeLibelle: string; nombre: number }[];
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

  // Méthode publique pour accéder au token (pour les logs)
  async getTokenForDebug(): Promise<string | null> {
    return await this.getToken();
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
    console.log('🔄 === API CHARGEMENT RÉUNIONS DU CLUB ===');
    console.log('🏢 Club ID:', clubId);
    console.log('🔧 API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
    console.log('🔧 API_CONFIG.API_PREFIX:', API_CONFIG.API_PREFIX);

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/clubs/${clubId}/reunions`;
      console.log('🌐 URL complète:', url);

      const token = await this.getToken();
      console.log('🔑 Token récupéré:', !!token);
      console.log('🔑 Token (premiers caractères):', token ? token.substring(0, 20) + '...' : 'AUCUN');

      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      console.log('📤 Envoi de la requête...');
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

      console.log('📡 === RÉPONSE REÇUE ===');
      console.log('📡 Status:', response.status);
      console.log('📡 Status Text:', response.statusText);
      console.log('📡 OK:', response.ok);
      console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.log('❌ === ERREUR HTTP ===');
        console.log('❌ Status:', response.status);
        console.log('❌ StatusText:', response.statusText);

        if (response.status === 401) {
          console.log('🔑 Session expirée - suppression du token');
          await this.removeToken();
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }

        const errorText = await response.text();
        console.error('❌ Erreur API réunions:', errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      console.log('📥 Lecture du contenu de la réponse...');
      const responseText = await response.text();
      console.log('📄 Réponse brute (premiers 500 caractères):', responseText.substring(0, 500));
      console.log('📄 Longueur de la réponse:', responseText.length);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('📊 === PARSING JSON RÉUSSI ===');
        console.log('📊 Type de données:', typeof data);
        console.log('📊 Est un tableau:', Array.isArray(data));
      } catch (parseError) {
        console.error('❌ Erreur parsing JSON:', parseError);
        console.error('❌ Contenu qui a causé l\'erreur:', responseText);
        throw new Error(`Réponse API invalide - pas du JSON valide: ${parseError.message}`);
      }

      console.log('📊 === DONNÉES RÉUNIONS REÇUES ===');
      console.log('📊 Structure complète:', data);

      // Traiter les données selon le format RotaryManager
      let reunions: Reunion[] = [];

      if (Array.isArray(data)) {
        reunions = data;
        console.log('✅ Format: Tableau direct de réunions');
      } else if (data.reunions && Array.isArray(data.reunions)) {
        reunions = data.reunions;
        console.log('✅ Format: Objet avec propriété reunions');
      } else if (data.data && Array.isArray(data.data)) {
        reunions = data.data;
        console.log('✅ Format: Objet avec propriété data');
      } else if (data && typeof data === 'object') {
        reunions = [data];
        console.log('✅ Format: Objet unique converti en tableau');
      }

      console.log('✅ === RÉUNIONS TRAITÉES ===');
      console.log('✅ Nombre de réunions:', reunions.length);

      // Log détaillé de chaque réunion trouvée
      reunions.forEach((reunion, index) => {
        console.log(`📋 Réunion API ${index + 1}:`, {
          id: reunion.id,
          typeReunionLibelle: reunion.typeReunionLibelle,
          date: reunion.date,
          heure: reunion.heure,
          lieu: reunion.lieu,
          ordresDuJour: reunion.ordresDuJour,
          presences: reunion.presences,
          invites: reunion.invites,
          description: reunion.description
        });
      });

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

  // === GESTION DES PRÉSENCES ===

  // Obtenir les présences d'une réunion
  async getPresencesReunion(clubId: string, reunionId: string): Promise<PresenceReunion[]> {
    console.log('🔄 === CHARGEMENT PRÉSENCES ===');
    console.log('🏢 Club ID:', clubId);
    console.log('👥 Réunion ID:', reunionId);

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/clubs/${clubId}/reunions/${reunionId}/presences`;
      console.log('🌐 URL présences:', url);

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

      console.log('📡 Réponse présences Status:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('👥 Aucune présence trouvée pour cette réunion');
          return [];
        }
        const errorText = await response.text();
        console.error('❌ Erreur API présences:', errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 Données présences reçues:', data);

      // Traiter les données selon le format RotaryManager
      let presences: PresenceReunion[] = [];

      if (Array.isArray(data)) {
        presences = data;
      } else if (data.presences && Array.isArray(data.presences)) {
        presences = data.presences;
      } else if (data.data && Array.isArray(data.data)) {
        presences = data.data;
      }

      console.log('✅ === PRÉSENCES TRAITÉES ===');
      console.log('✅ Nombre de présences:', presences.length);

      // Log détaillé de chaque présence
      presences.forEach((presence, index) => {
        console.log(`👤 Présence ${index + 1}:`, {
          id: presence.id,
          membreId: presence.membreId,
          nomMembre: presence.nomMembre,
          fullName: presence.fullName,
          prenom: presence.prenom,
          nom: presence.nom,
          email: presence.email,
          fonction: presence.fonction,
          present: presence.present,
          excuse: presence.excuse
        });
      });

      return presences;

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des présences:', error);
      return []; // Retourner un tableau vide en cas d'erreur
    }
  }

  // Marquer la présence d'un membre
  async marquerPresence(clubId: string, reunionId: string, membreId: string, present: boolean, excuse: boolean = false): Promise<void> {
    try {
      const response = await this.makeRequest<void>(`/clubs/${clubId}/reunions/${reunionId}/presences`, {
        method: 'POST',
        body: JSON.stringify({
          membreId,
          present,
          excuse,
          reunionId
        }),
      });

      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de la mise à jour de la présence');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la présence:', error);
      throw error;
    }
  }

  // === GESTION DES INVITÉS ===

  // Obtenir les invités d'une réunion
  async getInvitesReunion(clubId: string, reunionId: string): Promise<InviteReunion[]> {
    console.log('🔄 === CHARGEMENT INVITÉS ===');
    console.log('🏢 Club ID:', clubId);
    console.log('🎯 Réunion ID:', reunionId);

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/clubs/${clubId}/reunions/${reunionId}/invites`;
      console.log('🌐 URL invités:', url);

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

      console.log('📡 Réponse invités Status:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('🎯 Aucun invité trouvé pour cette réunion');
          return [];
        }
        const errorText = await response.text();
        console.error('❌ Erreur API invités:', errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 Données invités reçues:', data);

      // Traiter les données selon le format RotaryManager
      let invites: InviteReunion[] = [];

      if (Array.isArray(data)) {
        invites = data;
      } else if (data.invites && Array.isArray(data.invites)) {
        invites = data.invites;
      } else if (data.data && Array.isArray(data.data)) {
        invites = data.data;
      }

      console.log('✅ Invités traités:', invites.length);
      return invites;

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des invités:', error);
      return []; // Retourner un tableau vide en cas d'erreur
    }
  }

  // Ajouter un invité à une réunion
  async ajouterInvite(clubId: string, reunionId: string, inviteData: Partial<InviteReunion>): Promise<InviteReunion> {
    try {
      const response = await this.makeRequest<InviteReunion>(`/clubs/${clubId}/reunions/${reunionId}/invites`, {
        method: 'POST',
        body: JSON.stringify(inviteData),
      });

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Erreur lors de l\'ajout de l\'invité');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'invité:', error);
      throw error;
    }
  }

  // === GESTION DES ORDRES DU JOUR DÉTAILLÉS ===

  // Obtenir les ordres du jour d'une réunion
  async getOrdresJourReunion(clubId: string, reunionId: string): Promise<string[]> {
    console.log('🔄 === CHARGEMENT ORDRES DU JOUR ===');
    console.log('🏢 Club ID:', clubId);
    console.log('📋 Réunion ID:', reunionId);

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/clubs/${clubId}/reunions/${reunionId}/ordres-du-jour`;
      console.log('🌐 URL ordres du jour:', url);

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

      console.log('📡 Réponse ordres du jour Status:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('📋 Aucun ordre du jour trouvé pour cette réunion');
          return [];
        }
        const errorText = await response.text();
        console.error('❌ Erreur API ordres du jour:', errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 Données ordres du jour reçues:', data);

      // Traiter les données selon le format RotaryManager
      let ordres: string[] = [];

      if (Array.isArray(data)) {
        ordres = data.map(ordre => typeof ordre === 'string' ? ordre : ordre.description || ordre.titre || 'Ordre du jour');
      } else if (data.ordresDuJour && Array.isArray(data.ordresDuJour)) {
        ordres = data.ordresDuJour.map(ordre => typeof ordre === 'string' ? ordre : ordre.description || ordre.titre || 'Ordre du jour');
      } else if (data.data && Array.isArray(data.data)) {
        ordres = data.data.map(ordre => typeof ordre === 'string' ? ordre : ordre.description || ordre.titre || 'Ordre du jour');
      }

      console.log('✅ Ordres du jour traités:', ordres.length);
      return ordres;

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des ordres du jour:', error);
      return []; // Retourner un tableau vide en cas d'erreur
    }
  }

  // Obtenir les ordres du jour détaillés
  async getOrdresJourDetailles(clubId: string, reunionId: string): Promise<OrdreJourDetaille[]> {
    try {
      const response = await this.makeRequest<OrdreJourDetaille>(`/clubs/${clubId}/reunions/${reunionId}/ordres-jour`);

      if (response.success && response.data) {
        return Array.isArray(response.data) ? response.data : [response.data];
      }
      throw new Error(response.message || 'Erreur lors de la récupération des ordres du jour');
    } catch (error) {
      console.error('Erreur lors de la récupération des ordres du jour:', error);
      throw error;
    }
  }

  // Mettre à jour un ordre du jour
  async updateOrdreJour(clubId: string, reunionId: string, ordreJourId: string, data: Partial<OrdreJourDetaille>): Promise<OrdreJourDetaille> {
    try {
      const response = await this.makeRequest<OrdreJourDetaille>(`/clubs/${clubId}/reunions/${reunionId}/ordres-jour/${ordreJourId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Erreur lors de la mise à jour de l\'ordre du jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'ordre du jour:', error);
      throw error;
    }
  }

  // === STATISTIQUES ET RAPPORTS ===

  // Obtenir les statistiques des réunions
  async getStatistiquesReunions(clubId: string, dateDebut?: string, dateFin?: string): Promise<StatistiquesReunion> {
    try {
      let url = `/clubs/${clubId}/reunions/statistiques`;
      const params = new URLSearchParams();
      if (dateDebut) params.append('dateDebut', dateDebut);
      if (dateFin) params.append('dateFin', dateFin);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await this.makeRequest<StatistiquesReunion>(url);

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Erreur lors de la récupération des statistiques');
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  // === MÉTHODES POUR LES FONCTIONS ET COMMISSIONS ===

  // Récupérer tous les membres de comité
  async getMembresComite(): Promise<MembreComite[]> {
    try {
      console.log('🔄 === CHARGEMENT MEMBRES COMITÉ ===');
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/MembresComite`;
      console.log('🌐 URL membres comité:', url);

      const token = await this.getToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Membres comité chargés (brut):', data);

      // Les données peuvent être directement un tableau ou dans une propriété
      const membresComite = Array.isArray(data) ? data : (data.data || data.members || []);
      console.log('✅ Membres comité traités:', membresComite.length);

      return membresComite;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des membres de comité:', error);
      throw error;
    }
  }

  // Récupérer les comités d'un club
  async getClubComites(clubId: string): Promise<any[]> {
    try {
      console.log('🔄 === CHARGEMENT COMITÉS CLUB ===');
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/clubs/${clubId}/comites`;
      console.log('🌐 URL comités club:', url);

      const token = await this.getToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Comités club chargés (brut):', data);

      const comites = Array.isArray(data) ? data : (data.data || data.comites || []);
      console.log('✅ Comités club traités:', comites.length);

      return comites;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des comités:', error);
      throw error;
    }
  }

  // Récupérer les membres d'un comité
  async getComiteMembers(clubId: string, comiteId: string): Promise<any> {
    try {
      console.log('🔄 === CHARGEMENT MEMBRES COMITÉ SPÉCIFIQUE ===');
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/clubs/${clubId}/comites/${comiteId}/membres`;
      console.log('🌐 URL membres comité spécifique:', url);

      const response = await this.makeRequest<any>(url);

      if (response.success && response.data) {
        console.log('✅ Membres comité spécifique chargés');
        return response.data;
      }
      throw new Error(response.message || 'Erreur lors de la récupération des membres du comité');
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des membres du comité:', error);
      throw error;
    }
  }

  // Récupérer les commissions actives d'un club
  async getClubCommissions(clubId: string): Promise<any[]> {
    try {
      console.log('🔄 === CHARGEMENT COMMISSIONS CLUB ===');
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/clubs/${clubId}/commissions/actives`;
      console.log('🌐 URL commissions club:', url);

      const response = await this.makeRequest<any[]>(url);

      if (response.success && response.data) {
        console.log('✅ Commissions club chargées:', response.data.length);
        return response.data;
      }
      throw new Error(response.message || 'Erreur lors de la récupération des commissions');
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des commissions:', error);
      throw error;
    }
  }

  // Récupérer les membres d'une commission
  async getCommissionMembers(clubId: string, commissionClubId: string): Promise<any> {
    try {
      console.log('🔄 === CHARGEMENT MEMBRES COMMISSION SPÉCIFIQUE ===');
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/clubs/${clubId}/commissions/${commissionClubId}/membres`;
      console.log('🌐 URL membres commission spécifique:', url);

      const response = await this.makeRequest<any>(url);

      if (response.success && response.data) {
        console.log('✅ Membres commission spécifique chargés');
        return response.data;
      }
      throw new Error(response.message || 'Erreur lors de la récupération des membres de la commission');
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des membres de la commission:', error);
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
  const [comites, setComites] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
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

  // États pour les fonctionnalités avancées
  const [showReunionDetails, setShowReunionDetails] = useState(false);
  const [showPresenceManager, setShowPresenceManager] = useState(false);
  const [showInviteManager, setShowInviteManager] = useState(false);
  const [showOrdreJourManager, setShowOrdreJourManager] = useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);

  // Données pour les fonctionnalités avancées
  const [ordresJourDetailles, setOrdresJourDetailles] = useState<OrdreJourDetaille[]>([]);
  const [comptesRendus, setComptesRendus] = useState<CompteRendu[]>([]);
  const [filtresReunion, setFiltresReunion] = useState<FiltresReunion>({});
  const [statistiques, setStatistiques] = useState<StatistiquesReunion | null>(null);
  const [reunionsFiltrees, setReunionsFiltrees] = useState<Reunion[]>([]);
  const [modeAffichage, setModeAffichage] = useState<'liste' | 'calendrier'>('liste');

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

  // Fonction pour obtenir le nom d'affichage d'un membre
  const getMemberDisplayName = (member) => {
    if (!member) return 'Membre inconnu';
    return member.fullName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email || 'Membre sans nom';
  };

  // Fonction pour obtenir le nom d'affichage d'une présence
  const getPresenceDisplayName = (presence) => {
    console.log('🔍 === GET PRESENCE DISPLAY NAME ===');
    console.log('🔍 Présence reçue:', {
      membreId: presence?.membreId,
      nomMembre: presence?.nomMembre,
      fullName: presence?.fullName,
      prenom: presence?.prenom,
      nom: presence?.nom
    });
    console.log('🔍 Membres disponibles dans le state:', members.length);

    if (!presence) {
      console.log('❌ Pas de présence fournie');
      return 'Membre inconnu';
    }

    // Vérifier si on a déjà un nom valide (pas juste l'ID)
    if (presence.nomMembre && presence.nomMembre !== presence.membreId) {
      console.log('✅ Utilisation nomMembre:', presence.nomMembre);
      return presence.nomMembre;
    }
    if (presence.fullName && presence.fullName !== presence.membreId) {
      console.log('✅ Utilisation fullName:', presence.fullName);
      return presence.fullName;
    }
    if (presence.prenom && presence.nom) {
      const fullName = `${presence.prenom} ${presence.nom}`;
      console.log('✅ Utilisation prenom + nom:', fullName);
      return fullName;
    }
    if (presence.nom && presence.nom !== presence.membreId) {
      console.log('✅ Utilisation nom seul:', presence.nom);
      return presence.nom;
    }
    if (presence.prenom && presence.prenom !== presence.membreId) {
      console.log('✅ Utilisation prenom seul:', presence.prenom);
      return presence.prenom;
    }

    // Chercher dans la liste des membres
    if (presence.membreId) {
      console.log('🔍 Recherche membre par ID:', presence.membreId);
      const membre = members.find(m => m.id === presence.membreId);
      console.log('🔍 Membre trouvé:', membre ? {
        id: membre.id,
        fullName: membre.fullName,
        firstName: membre.firstName,
        lastName: membre.lastName
      } : 'NON TROUVÉ');

      if (membre) {
        const displayName = getMemberDisplayName(membre);
        console.log('✅ Nom d\'affichage du membre:', displayName);
        return displayName;
      } else {
        console.log('❌ Membre non trouvé dans la liste');
        // Log des IDs des membres pour déboguer
        console.log('🔍 IDs des membres disponibles:', members.map(m => m.id).slice(0, 5));
      }
    }

    // Fallback avec ID tronqué
    const fallback = `Membre ${presence.membreId ? presence.membreId.substring(0, 8) + '...' : 'inconnu'}`;
    console.log('❌ Utilisation fallback:', fallback);
    return fallback;
  };

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

      // Enrichir les membres avec leurs fonctions et commissions
      await enrichMembersWithFunctionsAndCommissions(clubId);

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

  // Charger les comités d'un club
  const loadComites = async (clubId: string) => {
    try {
      console.log('🔄 === CHARGEMENT COMITÉS ===');
      const comitesData = await apiService.getClubComites(clubId);
      console.log('✅ Comités chargés:', comitesData.length);
      setComites(comitesData);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des comités:', error);
      setComites([]);
    }
  };

  // Charger les commissions d'un club
  const loadCommissions = async (clubId: string) => {
    try {
      console.log('🔄 === CHARGEMENT COMMISSIONS ===');
      const commissionsData = await apiService.getClubCommissions(clubId);
      console.log('✅ Commissions chargées:', commissionsData.length);
      setCommissions(commissionsData);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des commissions:', error);
      setCommissions([]);
    }
  };

  // Enrichir les membres avec leurs fonctions et commissions
  const enrichMembersWithFunctionsAndCommissions = async (clubId: string) => {
    try {
      console.log('🔄 === ENRICHISSEMENT MEMBRES AVEC FONCTIONS ET COMMISSIONS ===');

      // Charger les données nécessaires en parallèle
      const [membresComiteData, comitesData, commissionsData] = await Promise.all([
        apiService.getMembresComite().catch(() => []),
        apiService.getClubComites(clubId).catch(() => []),
        apiService.getClubCommissions(clubId).catch(() => [])
      ]);

      console.log('📊 Données chargées:', {
        membresComite: membresComiteData.length,
        comites: comitesData.length,
        commissions: commissionsData.length
      });

      // Stocker les données
      setMembresComite(membresComiteData);
      setComites(comitesData);
      setCommissions(commissionsData);

      // Charger les détails des membres de chaque comité et commission
      const allComiteMembers = [];
      const allCommissionMembers = [];

      // Charger les membres de chaque comité
      for (const comite of comitesData) {
        try {
          const comiteMembers = await apiService.getComiteMembers(clubId, comite.id);
          if (comiteMembers && comiteMembers.Membres) {
            allComiteMembers.push(...comiteMembers.Membres.map(m => ({
              ...m,
              comiteNom: comite.nom || comite.nomComite,
              comiteId: comite.id
            })));
          }
        } catch (error) {
          console.log(`⚠️ Impossible de charger les membres du comité ${comite.nom}:`, error.message);
        }
      }

      // Charger les membres de chaque commission
      for (const commission of commissionsData) {
        try {
          const commissionMembers = await apiService.getCommissionMembers(clubId, commission.id);
          if (commissionMembers && commissionMembers.Membres) {
            allCommissionMembers.push(...commissionMembers.Membres.map(m => ({
              ...m,
              commissionNom: commission.nom || commission.nomCommission,
              commissionId: commission.id
            })));
          }
        } catch (error) {
          console.log(`⚠️ Impossible de charger les membres de la commission ${commission.nom}:`, error.message);
        }
      }

      console.log('📊 Membres enrichis:', {
        comiteMembers: allComiteMembers.length,
        commissionMembers: allCommissionMembers.length
      });

      // Enrichir les membres existants avec leurs fonctions et commissions
      setMembers(prevMembers => {
        console.log('🔄 === ENRICHISSEMENT FINAL DES MEMBRES ===');
        console.log('📊 Membres à enrichir:', prevMembers.length);
        console.log('📊 Données comité disponibles:', allComiteMembers.length);
        console.log('📊 Données commission disponibles:', allCommissionMembers.length);

        const enrichedMembers = prevMembers.map(member => {
          // Trouver les fonctions (comités) du membre
          const memberFunctions = allComiteMembers.filter(cm => cm.membreId === member.id);

          // Trouver les commissions du membre
          const memberCommissions = allCommissionMembers.filter(cm => cm.membreId === member.id);

          console.log(`👤 Membre ${member.fullName}:`, {
            id: member.id,
            fonctionsFound: memberFunctions.length,
            commissionsFound: memberCommissions.length,
            fonctionsData: memberFunctions,
            commissionsData: memberCommissions
          });

          const enrichedMember = {
            ...member,
            fonctions: memberFunctions.map(f => ({
              comiteId: f.comiteId,
              comiteNom: f.comiteNom,
              estResponsable: f.estResponsable,
              estActif: f.estActif,
              dateNomination: f.dateNomination,
              mandatAnnee: f.mandatAnnee || f.anneeMandat
            })),
            commissions: memberCommissions.map(c => ({
              commissionId: c.commissionId,
              commissionNom: c.commissionNom,
              estResponsable: c.estResponsable,
              estActif: c.estActif,
              dateNomination: c.dateNomination,
              mandatAnnee: c.mandatAnnee
            }))
          };

          console.log(`✅ Membre enrichi ${member.fullName}:`, {
            fonctions: enrichedMember.fonctions,
            commissions: enrichedMember.commissions
          });

          return enrichedMember;
        });

        console.log('✅ Enrichissement terminé, membres enrichis:', enrichedMembers.length);
        return enrichedMembers;
      });

      console.log('✅ Enrichissement des membres terminé');
    } catch (error) {
      console.error('❌ Erreur lors de l\'enrichissement des membres:', error);
    }

    // TOUJOURS ajouter des données de test pour vérifier l'affichage
    console.log('🧪 === AJOUT DONNÉES DE TEST POUR VÉRIFICATION ===');
    setMembers(prevMembers => prevMembers.map((member, index) => {
      if (index === 0) { // Premier membre (Kouadio Yao) avec des données de test
        console.log('🧪 Ajout données test pour:', member.fullName);
        return {
          ...member,
          fonctions: [
            {
              comiteId: 'test-comite-1',
              comiteNom: 'Comité Exécutif',
              estResponsable: true,
              estActif: true,
              dateNomination: '2024-01-01',
              mandatAnnee: 2024
            },
            {
              comiteId: 'test-comite-2',
              comiteNom: 'Comité des Finances',
              estResponsable: false,
              estActif: true,
              dateNomination: '2024-01-01',
              mandatAnnee: 2024
            }
          ],
          commissions: [
            {
              commissionId: 'test-commission-1',
              commissionNom: 'Commission Jeunesse',
              estResponsable: true,
              estActif: true,
              dateNomination: '2024-01-01',
              mandatAnnee: 2024
            },
            {
              commissionId: 'test-commission-2',
              commissionNom: 'Commission Action Sociale',
              estResponsable: false,
              estActif: true,
              dateNomination: '2024-01-01',
              mandatAnnee: 2024
            }
          ]
        };
      } else if (index === 1) { // Deuxième membre avec d'autres données
        console.log('🧪 Ajout données test pour:', member.fullName);
        return {
          ...member,
          fonctions: [
            {
              comiteId: 'test-comite-3',
              comiteNom: 'Comité des Membres',
              estResponsable: true,
              estActif: true,
              dateNomination: '2024-01-01',
              mandatAnnee: 2024
            }
          ],
          commissions: [
            {
              commissionId: 'test-commission-3',
              commissionNom: 'Commission Communication',
              estResponsable: false,
              estActif: false,
              dateNomination: '2023-01-01',
              mandatAnnee: 2023
            }
          ]
        };
      }
      return member;
    }));
  };

  // Charger les réunions du club
  const loadReunions = async (clubId: string) => {
    try {
      setLoading(true);
      console.log('🔄 === DÉBUT CHARGEMENT RÉUNIONS ===');
      console.log('🏢 Club ID:', clubId);
      console.log('🔑 Token disponible:', !!(await apiService.getTokenForDebug()));
      console.log('🌐 URL API:', `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/clubs/${clubId}/reunions`);

      const reunionsData = await apiService.getReunions(clubId);
      console.log('✅ Réunions chargées (brut):', reunionsData);
      console.log('✅ Nombre de réunions:', reunionsData.length);

      // Log détaillé de chaque réunion
      reunionsData.forEach((reunion, index) => {
        console.log(`📋 Réunion ${index + 1}:`, {
          id: reunion.id,
          type: reunion.typeReunionLibelle,
          date: reunion.date,
          heure: reunion.heure,
          ordresDuJour: reunion.ordresDuJour?.length || 0,
          presences: reunion.presences?.length || 0,
          invites: reunion.invites?.length || 0,
          lieu: reunion.lieu
        });
      });

      // Traiter les données pour s'assurer qu'elles ont le bon format
      const processedReunions = await Promise.all(reunionsData.map(async (reunion, index) => {
        console.log(`🔄 Traitement réunion ${index + 1}:`, reunion.id);

        // Charger les détails de chaque réunion si les données ne sont pas complètes
        let ordresDuJour = reunion.ordresDuJour || [];
        let presences = reunion.presences || [];
        let invites = reunion.invites || [];

        // Si les données détaillées ne sont pas présentes, les charger séparément
        if (!reunion.ordresDuJour && reunion.nombreOrdresDuJour > 0) {
          console.log(`📋 Chargement des ordres du jour pour réunion ${reunion.id}`);
          try {
            const ordresResponse = await apiService.getOrdresJourReunion(clubId, reunion.id);
            ordresDuJour = ordresResponse || [];
            console.log(`✅ ${ordresDuJour.length} ordres du jour chargés`);
          } catch (error) {
            console.log(`⚠️ Impossible de charger les ordres du jour:`, error.message);
          }
        }

        if (!reunion.presences && reunion.nombrePresences > 0) {
          console.log(`👥 Chargement des présences pour réunion ${reunion.id}`);
          try {
            const presencesResponse = await apiService.getPresencesReunion(clubId, reunion.id);
            presences = presencesResponse || [];

            // S'assurer que les membres sont chargés avant l'enrichissement
            if (members.length === 0) {
              console.log(`⚠️ Aucun membre chargé, tentative de chargement...`);
              try {
                await loadMembers(clubId);
                console.log(`✅ ${members.length} membres chargés pour enrichissement`);
              } catch (memberError) {
                console.log(`❌ Impossible de charger les membres:`, memberError.message);
              }
            }

            // Enrichir les présences avec les données des membres
            console.log(`🔄 === ENRICHISSEMENT DES PRÉSENCES ===`);
            console.log(`📊 Membres disponibles pour enrichissement:`, members.length);
            console.log(`📊 Présences à enrichir:`, presences.length);

            presences = presences.map((presence, idx) => {
              console.log(`🔄 Traitement présence ${idx + 1}:`, {
                membreId: presence.membreId,
                nomMembre: presence.nomMembre,
                fullName: presence.fullName,
                prenom: presence.prenom,
                nom: presence.nom
              });

              // Toujours essayer d'enrichir, même si des données existent déjà
              if (presence.membreId) {
                const membre = members.find(m => m.id === presence.membreId);
                console.log(`🔍 Recherche membre ${presence.membreId}:`, membre ? {
                  id: membre.id,
                  fullName: membre.fullName,
                  firstName: membre.firstName,
                  lastName: membre.lastName,
                  email: membre.email
                } : 'NON TROUVÉ');

                if (membre) {
                  const memberFullName = membre.fullName || `${membre.firstName || ''} ${membre.lastName || ''}`.trim();
                  const enriched = {
                    ...presence,
                    // Utiliser le nom du membre si pas de nom ou si c'est juste l'ID
                    nomMembre: (presence.nomMembre && presence.nomMembre !== presence.membreId)
                      ? presence.nomMembre
                      : memberFullName,
                    fullName: (presence.fullName && presence.fullName !== presence.membreId)
                      ? presence.fullName
                      : memberFullName,
                    email: presence.email || membre.email,
                    fonction: presence.fonction || membre.roles?.join(', ')
                  };
                  console.log(`✅ Présence enrichie:`, {
                    membreId: enriched.membreId,
                    nomMembre: enriched.nomMembre,
                    fullName: enriched.fullName,
                    email: enriched.email
                  });
                  return enriched;
                } else {
                  console.log(`❌ Membre ${presence.membreId} non trouvé dans la liste`);
                }
              }
              return presence;
            });

            console.log(`✅ ${presences.length} présences chargées et enrichies`);
          } catch (error) {
            console.log(`⚠️ Impossible de charger les présences:`, error.message);
          }
        }

        if (!reunion.invites && reunion.nombreInvites > 0) {
          console.log(`🎯 Chargement des invités pour réunion ${reunion.id}`);
          try {
            const invitesResponse = await apiService.getInvitesReunion(clubId, reunion.id);
            invites = invitesResponse || [];
            console.log(`✅ ${invites.length} invités chargés`);
          } catch (error) {
            console.log(`⚠️ Impossible de charger les invités:`, error.message);
          }
        }

        const processed = {
          ...reunion,
          dateFormatted: reunion.date ? new Date(reunion.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'Date non disponible',
          heureFormatted: reunion.heure || 'Heure non disponible',
          ordresDuJour,
          presences,
          invites
        };

        console.log(`✅ Réunion ${index + 1} traitée:`, {
          id: processed.id,
          dateFormatted: processed.dateFormatted,
          heureFormatted: processed.heureFormatted,
          ordresDuJourCount: processed.ordresDuJour.length,
          presencesCount: processed.presences.length,
          invitesCount: processed.invites.length
        });

        return processed;
      }));

      // Trier les réunions par date croissante (plus ancienne en haut, plus récente en bas)
      const sortedReunions = processedReunions.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime(); // Tri croissant
      });

      console.log('📅 === TRI DES RÉUNIONS PAR DATE ===');
      sortedReunions.forEach((reunion, index) => {
        console.log(`📅 Réunion ${index + 1}: ${reunion.typeReunionLibelle} - ${reunion.dateFormatted}`);
      });

      setReunions(sortedReunions);
      // Mettre à jour aussi l'ancien état meetings pour compatibilité
      setMeetings(sortedReunions.map(r => ({
        id: r.id,
        title: r.typeReunionLibelle || 'Réunion',
        date: r.date,
        location: r.lieu || 'Lieu non précisé',
        attendees: r.presences || []
      })));

      console.log('✅ === RÉUNIONS TRAITÉES ET STOCKÉES ===');
      console.log('✅ Nombre total:', sortedReunions.length);
      console.log('✅ Réunions triées par date croissante');
      console.log('✅ État reunions mis à jour');
      console.log('✅ État meetings mis à jour');

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

  // === FONCTIONS POUR LES FONCTIONNALITÉS AVANCÉES ===

  // Charger les détails complets d'une réunion
  const loadReunionDetails = async (reunionId: string) => {
    if (!currentUser?.clubId) return;

    try {
      setLoading(true);
      console.log('🔄 === CHARGEMENT DÉTAILS RÉUNION ===');
      console.log('🔄 Réunion ID:', reunionId);
      console.log('🔄 Club ID:', currentUser.clubId);

      // Trouver la réunion dans la liste existante
      const reunionExistante = reunions.find(r => r.id === reunionId);
      if (!reunionExistante) {
        throw new Error('Réunion non trouvée dans la liste');
      }

      console.log('📋 Réunion trouvée:', reunionExistante.typeReunionLibelle);
      console.log('📋 Ordres du jour existants:', reunionExistante.ordresDuJour?.length || 0);
      console.log('👥 Présences existantes:', reunionExistante.presences?.length || 0);
      console.log('🎯 Invités existants:', reunionExistante.invites?.length || 0);

      // Charger les détails supplémentaires si nécessaire
      try {
        // Essayer de charger les détails via l'API si disponible
        const detailsSupplementaires = await apiService.getReunionDetails(currentUser.clubId, reunionId);
        console.log('📊 Détails supplémentaires chargés:', detailsSupplementaires);

        // Fusionner avec les données existantes
        setSelectedReunion({
          ...reunionExistante,
          ...detailsSupplementaires,
          // S'assurer que les tableaux existent
          ordresDuJour: detailsSupplementaires.ordresDuJour || reunionExistante.ordresDuJour || [],
          presences: detailsSupplementaires.presences || reunionExistante.presences || [],
          invites: detailsSupplementaires.invites || reunionExistante.invites || []
        });
      } catch (detailError) {
        console.log('⚠️ Impossible de charger les détails supplémentaires, utilisation des données existantes');
        // Utiliser les données existantes
        setSelectedReunion({
          ...reunionExistante,
          // S'assurer que les tableaux existent
          ordresDuJour: reunionExistante.ordresDuJour || [],
          presences: reunionExistante.presences || [],
          invites: reunionExistante.invites || []
        });
      }

      console.log('✅ Détails de la réunion chargés avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du chargement des détails:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de la réunion');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les réunions
  const appliquerFiltres = () => {
    let reunionsFiltrees = [...reunions];

    // Filtre par date
    if (filtresReunion.dateDebut) {
      reunionsFiltrees = reunionsFiltrees.filter(r =>
        new Date(r.date) >= new Date(filtresReunion.dateDebut!)
      );
    }
    if (filtresReunion.dateFin) {
      reunionsFiltrees = reunionsFiltrees.filter(r =>
        new Date(r.date) <= new Date(filtresReunion.dateFin!)
      );
    }

    // Filtre par type
    if (filtresReunion.typeReunionId) {
      reunionsFiltrees = reunionsFiltrees.filter(r =>
        r.typeReunionId === filtresReunion.typeReunionId
      );
    }

    // Filtre par recherche
    if (filtresReunion.recherche) {
      const recherche = filtresReunion.recherche.toLowerCase();
      reunionsFiltrees = reunionsFiltrees.filter(r =>
        r.typeReunionLibelle.toLowerCase().includes(recherche) ||
        r.lieu?.toLowerCase().includes(recherche) ||
        r.description?.toLowerCase().includes(recherche)
      );
    }

    setReunionsFiltrees(reunionsFiltrees);
  };

  // Charger les statistiques
  const loadStatistiques = async () => {
    if (!currentUser?.clubId) return;

    try {
      setLoading(true);
      const stats = await apiService.getStatistiquesReunions(
        currentUser.clubId,
        filtresReunion.dateDebut,
        filtresReunion.dateFin
      );
      setStatistiques(stats);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des statistiques:', error);
      Alert.alert('Erreur', 'Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  };

  // Marquer la présence d'un membre
  const togglePresence = async (membreId: string, present: boolean) => {
    if (!selectedReunion || !currentUser?.clubId) return;

    try {
      await apiService.marquerPresence(
        currentUser.clubId,
        selectedReunion.id,
        membreId,
        present
      );

      // Recharger les présences
      await loadReunionDetails(selectedReunion.id);
      Alert.alert('Succès', `Présence ${present ? 'marquée' : 'supprimée'} avec succès`);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la présence:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour la présence');
    }
  };

  // Générer un compte-rendu
  const genererCompteRendu = async (reunionId: string) => {
    try {
      setLoading(true);
      console.log('📄 Génération du compte-rendu pour la réunion:', reunionId);

      const compteRendu = await apiService.genererCompteRendu(reunionId);

      Alert.alert(
        'Compte-rendu généré',
        'Le compte-rendu a été généré avec succès !',
        [
          { text: 'OK', style: 'default' },
          {
            text: 'Télécharger',
            onPress: () => {
              if (compteRendu.url) {
                // Dans une vraie app, on ouvrirait le fichier
                console.log('📥 Téléchargement du compte-rendu:', compteRendu.url);
                Alert.alert('Info', 'Fonctionnalité de téléchargement disponible dans l\'app native');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Erreur lors de la génération du compte-rendu:', error);
      Alert.alert('Erreur', 'Impossible de générer le compte-rendu');
    } finally {
      setLoading(false);
    }
  };

  // === FONCTIONS DE COMMUNICATION ===

  // Fonction utilitaire pour détecter l'environnement
  const isExpoSnack = () => {
    return typeof window !== 'undefined' && window.location?.hostname?.includes('snack.expo.dev');
  };

  // Fonction utilitaire pour nettoyer les numéros de téléphone
  const cleanPhoneNumber = (phoneNumber: string): string => {
    if (!phoneNumber) return '';
    // Enlever tous les caractères non numériques sauf le +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');

    // Si le numéro commence par 0, le remplacer par +225 (indicatif Côte d'Ivoire)
    if (cleaned.startsWith('0')) {
      cleaned = '+225' + cleaned.substring(1);
    }

    // Si le numéro ne commence pas par +, ajouter +225
    if (!cleaned.startsWith('+')) {
      cleaned = '+225' + cleaned;
    }

    return cleaned;
  };

  // Fonction pour lancer un appel téléphonique
  const makePhoneCall = async (member: Member) => {
    if (!member.phoneNumber) {
      Alert.alert('Erreur', 'Aucun numéro de téléphone disponible pour ce membre');
      return;
    }

    const cleanedNumber = cleanPhoneNumber(member.phoneNumber);
    console.log('📞 Lancement direct de l\'appel vers:', member.fullName, 'au', cleanedNumber);

    const phoneUrl = `tel:${cleanedNumber}`;

    try {
      console.log('📞 URL d\'appel générée:', phoneUrl);

      // Vérifier si on est dans un environnement React Native avec Linking
      if (Linking && typeof Linking.openURL === 'function') {
        console.log('📱 Utilisation de Linking.openURL pour l\'appel');

        // Vérifier si l'URL est supportée
        const supported = await Linking.canOpenURL(phoneUrl);
        if (supported) {
          await Linking.openURL(phoneUrl);
          console.log('✅ Appel lancé avec succès vers:', cleanedNumber);
        } else {
          console.log('❌ URL d\'appel non supportée sur cet appareil');
          Alert.alert('Erreur', 'Les appels téléphoniques ne sont pas supportés sur cet appareil.');
        }
      } else if (isExpoSnack() && typeof window !== 'undefined') {
        // Fallback pour Expo Snack web - afficher les informations
        console.log('🌐 Environnement Expo Snack web détecté');
        Alert.alert(
          '📞 Appel téléphonique',
          `Appeler ${member.fullName}\n\nNuméro: ${member.phoneNumber}\nNuméro formaté: ${cleanedNumber}\n\n💡 Dans l'app mobile native, cet appel se lancerait automatiquement.`,
          [
            { text: 'OK', style: 'default' },
            {
              text: 'Copier le numéro',
              onPress: () => {
                console.log('📋 Numéro copié:', cleanedNumber);
                Alert.alert('Copié', `Numéro ${cleanedNumber} copié dans le presse-papiers`);
              }
            }
          ]
        );
      } else {
        console.log('❌ Aucune méthode de lancement d\'appel disponible');
        Alert.alert('Erreur', 'Impossible de lancer l\'appel sur cette plateforme.');
      }

    } catch (error) {
      console.error('❌ Erreur lors du lancement de l\'appel:', error);
      Alert.alert('Erreur', 'Impossible de lancer l\'appel. Vérifiez que votre appareil supporte les appels.');
    }
  };

  // Fonction pour envoyer un SMS
  const sendSMS = async (member: Member) => {
    if (!member.phoneNumber) {
      Alert.alert('Erreur', 'Aucun numéro de téléphone disponible pour ce membre');
      return;
    }

    const cleanedNumber = cleanPhoneNumber(member.phoneNumber);
    console.log('💬 Lancement direct du SMS vers:', member.fullName, 'au', cleanedNumber);

    const smsUrl = `sms:${cleanedNumber}`;

    try {
      console.log('💬 URL SMS générée:', smsUrl);

      // Vérifier si on est dans un environnement React Native avec Linking
      if (Linking && typeof Linking.openURL === 'function') {
        console.log('📱 Utilisation de Linking.openURL pour le SMS');

        // Vérifier si l'URL est supportée
        const supported = await Linking.canOpenURL(smsUrl);
        if (supported) {
          await Linking.openURL(smsUrl);
          console.log('✅ SMS lancé avec succès vers:', cleanedNumber);
        } else {
          console.log('❌ URL SMS non supportée sur cet appareil');
          Alert.alert('Erreur', 'Les SMS ne sont pas supportés sur cet appareil.');
        }
      } else if (isExpoSnack() && typeof window !== 'undefined') {
        // Fallback pour Expo Snack web - afficher les informations
        console.log('🌐 Environnement Expo Snack web détecté');
        Alert.alert(
          '💬 Message SMS',
          `Envoyer un SMS à ${member.fullName}\n\nNuméro: ${member.phoneNumber}\nNuméro formaté: ${cleanedNumber}\n\n💡 Dans l'app mobile native, l'application SMS s'ouvrirait automatiquement.`,
          [
            { text: 'OK', style: 'default' },
            {
              text: 'Copier le numéro',
              onPress: () => {
                console.log('📋 Numéro copié:', cleanedNumber);
                Alert.alert('Copié', `Numéro ${cleanedNumber} copié dans le presse-papiers`);
              }
            }
          ]
        );
      } else {
        console.log('❌ Aucune méthode de lancement SMS disponible');
        Alert.alert('Erreur', 'Impossible de lancer l\'application SMS sur cette plateforme.');
      }

    } catch (error) {
      console.error('❌ Erreur lors du lancement du SMS:', error);
      Alert.alert('Erreur', 'Impossible de lancer l\'application SMS. Vérifiez que votre appareil supporte les SMS.');
    }
  };

  // Fonction pour ouvrir WhatsApp
  const openWhatsApp = async (member: Member) => {
    if (!member.phoneNumber) {
      Alert.alert('Erreur', 'Aucun numéro de téléphone disponible pour ce membre');
      return;
    }

    const cleanedNumber = cleanPhoneNumber(member.phoneNumber);
    console.log('📱 Lancement direct de WhatsApp vers:', member.fullName, 'au', cleanedNumber);

    const whatsappUrl = `https://wa.me/${cleanedNumber}`;

    try {
      console.log('📱 URL WhatsApp générée:', whatsappUrl);

      // Vérifier si on est dans un environnement React Native avec Linking
      if (Linking && typeof Linking.openURL === 'function') {
        console.log('📱 Utilisation de Linking.openURL pour WhatsApp');

        // Vérifier si l'URL est supportée
        const supported = await Linking.canOpenURL(whatsappUrl);
        if (supported) {
          await Linking.openURL(whatsappUrl);
          console.log('✅ WhatsApp lancé avec succès vers:', cleanedNumber);
        } else {
          console.log('❌ URL WhatsApp non supportée sur cet appareil');
          Alert.alert('Erreur', 'WhatsApp n\'est pas installé sur cet appareil.');
        }
      } else if (typeof window !== 'undefined') {
        // Fallback pour navigateur - ouvrir WhatsApp Web
        console.log('🌐 Environnement navigateur détecté - Ouverture de WhatsApp Web');
        window.open(whatsappUrl, '_blank');
        console.log('✅ WhatsApp Web ouvert vers:', cleanedNumber);
      } else {
        console.log('❌ Aucune méthode de lancement WhatsApp disponible');
        Alert.alert('Erreur', 'Impossible d\'ouvrir WhatsApp sur cette plateforme.');
      }

    } catch (error) {
      console.error('❌ Erreur lors du lancement de WhatsApp:', error);
      Alert.alert('Erreur', 'Impossible d\'ouvrir WhatsApp. Vérifiez que WhatsApp est installé sur votre appareil.');
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
    console.log('🖥️ Nombre de réunions dans l\'état:', reunions.length);
    console.log('🖥️ Loading:', loading);
    console.log('🖥️ Current User:', currentUser?.id, currentUser?.clubId);
    console.log('🖥️ Is Authenticated:', isAuthenticated);
    console.log('🖥️ Réunions filtrées:', reunionsFiltrees.length);

    // Log détaillé des réunions dans l'état
    if (reunions.length > 0) {
      console.log('🖥️ === DÉTAIL DES RÉUNIONS DANS L\'ÉTAT ===');
      reunions.forEach((reunion, index) => {
        console.log(`🖥️ Réunion ${index + 1}:`, {
          id: reunion.id,
          type: reunion.typeReunionLibelle,
          dateFormatted: reunion.dateFormatted,
          heureFormatted: reunion.heureFormatted,
          ordresDuJourCount: reunion.ordresDuJour?.length || 0,
          presencesCount: reunion.presences?.length || 0,
          invitesCount: reunion.invites?.length || 0
        });
      });
    } else {
      console.log('🖥️ ⚠️ Aucune réunion dans l\'état');
    }

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Réunions ({(reunionsFiltrees.length > 0 ? reunionsFiltrees : reunions).length})
          </Text>
          <Text style={styles.headerSubtitle}>
            Triées par date croissante
          </Text>
          <View style={styles.headerActions}>
            {/* Bouton de basculement vue liste/calendrier */}
            <TouchableOpacity
              style={[styles.headerButton, modeAffichage === 'calendrier' && styles.headerButtonActive]}
              onPress={() => setModeAffichage(modeAffichage === 'liste' ? 'calendrier' : 'liste')}
            >
              <Ionicons
                name={modeAffichage === 'liste' ? 'calendar' : 'list'}
                size={20}
                color={modeAffichage === 'calendrier' ? colors.secondary : 'white'}
              />
            </TouchableOpacity>

            {/* Bouton filtres */}
            <TouchableOpacity
              style={[styles.headerButton, Object.keys(filtresReunion).length > 0 && styles.headerButtonActive]}
              onPress={() => setShowFilters(true)}
            >
              <Ionicons
                name="filter"
                size={20}
                color={Object.keys(filtresReunion).length > 0 ? colors.secondary : 'white'}
              />
            </TouchableOpacity>

            {/* Bouton statistiques */}
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                loadStatistiques();
                setShowStatistics(true);
              }}
            >
              <Ionicons name="stats-chart" size={20} color="white" />
            </TouchableOpacity>

            {/* Bouton refresh */}
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
            data={reunionsFiltrees.length > 0 ? reunionsFiltrees : reunions}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.meetingCard}
                onPress={() => {
                  console.log('🎯 === CLIC SUR RÉUNION ===');
                  console.log('🎯 Réunion cliquée:', item.id, item.typeReunionLibelle);
                  console.log('🎯 Données de la réunion:', {
                    id: item.id,
                    type: item.typeReunionLibelle,
                    date: item.date,
                    ordresDuJour: item.ordresDuJour,
                    presences: item.presences,
                    invites: item.invites
                  });

                  setSelectedReunion(item);
                  loadReunionDetails(item.id);
                  setShowReunionDetails(true);
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
                  <View style={styles.meetingStatRow}>
                    <View style={styles.meetingStatBadge}>
                      <Text style={styles.meetingStatBadgeText}>
                        📋 {item.ordresDuJour?.length || 0}
                      </Text>
                      <Text style={styles.meetingStatBadgeLabel}>Ordre(s) du jour</Text>
                    </View>
                    <View style={styles.meetingStatBadge}>
                      <Text style={styles.meetingStatBadgeText}>
                        👥 {item.presences?.length || 0}
                      </Text>
                      <Text style={styles.meetingStatBadgeLabel}>Membre(s)</Text>
                    </View>
                    {item.invites && item.invites.length > 0 && (
                      <View style={styles.meetingStatBadge}>
                        <Text style={styles.meetingStatBadgeText}>
                          🎯 {item.invites.length}
                        </Text>
                        <Text style={styles.meetingStatBadgeLabel}>Invité(s)</Text>
                      </View>
                    )}
                  </View>

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

  // Composant de détails de réunion
  const ReunionDetailsModal = () => (
    <Modal
      visible={showReunionDetails}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowReunionDetails(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '95%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedReunion?.typeReunionLibelle || 'Détails de la réunion'}
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowReunionDetails(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          {selectedReunion && (
            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={true}>
              {/* Informations générales */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>📅 Informations générales</Text>
                <Text style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Date: </Text>
                  {selectedReunion.dateFormatted}
                </Text>
                <Text style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Heure: </Text>
                  {selectedReunion.heureFormatted}
                </Text>
                {selectedReunion.lieu && (
                  <Text style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Lieu: </Text>
                    {selectedReunion.lieu}
                  </Text>
                )}
                {selectedReunion.description && (
                  <Text style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Description: </Text>
                    {selectedReunion.description}
                  </Text>
                )}
              </View>

              {/* Ordres du jour */}
              <View style={styles.detailSection}>
                <View style={styles.detailSectionHeader}>
                  <Text style={styles.detailSectionTitle}>
                    📋 Ordres du jour ({selectedReunion.ordresDuJour?.length || 0})
                  </Text>
                </View>
                {selectedReunion.ordresDuJour && selectedReunion.ordresDuJour.length > 0 ? (
                  <View style={styles.detailList}>
                    {selectedReunion.ordresDuJour.map((ordre, index) => (
                      <View key={index} style={styles.detailListItemContainer}>
                        <View style={styles.detailListItemNumber}>
                          <Text style={styles.detailListItemNumberText}>{index + 1}</Text>
                        </View>
                        <View style={styles.detailListItemContent}>
                          <Text style={styles.detailListItemText}>
                            {typeof ordre === 'string' ? ordre : ordre.description || ordre.titre || 'Ordre du jour'}
                          </Text>
                          {typeof ordre === 'object' && ordre.dureeEstimee && (
                            <Text style={styles.detailListItemSubtext}>
                              ⏱️ Durée estimée: {ordre.dureeEstimee} min
                            </Text>
                          )}
                          {typeof ordre === 'object' && ordre.responsable && (
                            <Text style={styles.detailListItemSubtext}>
                              👤 Responsable: {ordre.responsable}
                            </Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateText}>📋 Aucun ordre du jour défini</Text>
                  </View>
                )}
              </View>

              {/* Membres */}
              <View style={styles.detailSection}>
                <View style={styles.detailSectionHeader}>
                  <Text style={styles.detailSectionTitle}>
                    👥 Membres ({selectedReunion.presences?.length || 0})
                  </Text>
                </View>
                {selectedReunion.presences && selectedReunion.presences.length > 0 ? (
                  <View style={styles.detailList}>
                    {selectedReunion.presences.map((presence, index) => (
                      <View key={index} style={styles.detailListItemContainer}>
                        <View style={styles.detailListItemIcon}>
                          <Text style={styles.detailListItemIconText}>👤</Text>
                        </View>
                        <View style={styles.detailListItemContent}>
                          <Text style={styles.detailListItemText}>
                            {getPresenceDisplayName(presence)}
                          </Text>
                          {presence.email && (
                            <Text style={styles.detailListItemSubtext}>
                              📧 {presence.email}
                            </Text>
                          )}
                          {presence.fonction && (
                            <Text style={styles.detailListItemSubtext}>
                              💼 {presence.fonction}
                            </Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateText}>👥 Aucun membre enregistré</Text>
                  </View>
                )}
              </View>

              {/* Invités */}
              <View style={styles.detailSection}>
                <View style={styles.detailSectionHeader}>
                  <Text style={styles.detailSectionTitle}>
                    🎯 Invités ({selectedReunion.invites?.length || 0})
                  </Text>
                </View>
                {selectedReunion.invites && selectedReunion.invites.length > 0 ? (
                  <View style={styles.detailList}>
                    {selectedReunion.invites.map((invite, index) => (
                      <View key={index} style={styles.detailListItemContainer}>
                        <View style={styles.detailListItemIcon}>
                          <Text style={styles.detailListItemIconText}>🎯</Text>
                        </View>
                        <View style={styles.detailListItemContent}>
                          <Text style={styles.detailListItemText}>
                            {invite.prenom} {invite.nom}
                          </Text>
                          {invite.email && (
                            <Text style={styles.detailListItemSubtext}>
                              📧 {invite.email}
                            </Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateText}>🎯 Aucun invité pour cette réunion</Text>
                  </View>
                )}
              </View>

              {/* Actions */}
              <View style={styles.detailActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={() => genererCompteRendu(selectedReunion.id)}
                >
                  <Text style={styles.modalButtonTextSecondary}>📄 Compte-rendu</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={() => {
                    // Ouvrir le formulaire d'édition
                    Alert.alert('Édition', 'Fonctionnalité d\'édition à venir');
                  }}
                >
                  <Text style={styles.modalButtonTextPrimary}>✏️ Modifier</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  // Composant de gestion des présences
  const PresenceManagerModal = () => (
    <Modal
      visible={showPresenceManager}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowPresenceManager(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '90%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Gestion des présences
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPresenceManager(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView}>
            {/* Liste des membres avec présences */}
            {members.map((member) => {
              const presence = selectedReunion?.presences.find(p => p.membreId === member.id);
              const isPresent = presence?.present || false;

              return (
                <View key={member.id} style={styles.presenceItem}>
                  <View style={styles.presenceInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {member.fullName ?
                          member.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2) :
                          'MB'
                        }
                      </Text>
                    </View>
                    <View style={styles.presenceDetails}>
                      <Text style={styles.presenceName}>{member.fullName}</Text>
                      <Text style={styles.presenceRole}>
                        {member.roles && member.roles.length > 0 ? member.roles.join(', ') : 'Membre'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.presenceActions}>
                    <TouchableOpacity
                      style={[
                        styles.presenceButton,
                        isPresent ? styles.presenceButtonActive : styles.presenceButtonInactive
                      ]}
                      onPress={() => togglePresence(member.id, !isPresent)}
                    >
                      <Text style={[
                        styles.presenceButtonText,
                        isPresent && styles.presenceButtonTextActive
                      ]}>
                        {isPresent ? '✅ Présent' : '❌ Absent'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={() => setShowPresenceManager(false)}
            >
              <Text style={styles.modalButtonTextSecondary}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Composant de filtres
  const FiltersModal = () => (
    <Modal
      visible={showFilters}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtres des réunions</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView}>
            {/* Recherche */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Recherche</Text>
              <TextInput
                style={styles.textInput}
                value={filtresReunion.recherche || ''}
                onChangeText={(text) => setFiltresReunion(prev => ({ ...prev, recherche: text }))}
                placeholder="Rechercher dans les réunions..."
                placeholderTextColor="#999"
              />
            </View>

            {/* Date de début */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date de début</Text>
              <TextInput
                style={styles.textInput}
                value={filtresReunion.dateDebut || ''}
                onChangeText={(text) => setFiltresReunion(prev => ({ ...prev, dateDebut: text }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
            </View>

            {/* Date de fin */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date de fin</Text>
              <TextInput
                style={styles.textInput}
                value={filtresReunion.dateFin || ''}
                onChangeText={(text) => setFiltresReunion(prev => ({ ...prev, dateFin: text }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
            </View>

            {/* Type de réunion */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Type de réunion</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => {
                  Alert.alert(
                    'Types de réunion',
                    'Sélectionnez un type',
                    [
                      { text: 'Tous', onPress: () => setFiltresReunion(prev => ({ ...prev, typeReunionId: undefined })) },
                      ...typesReunion.map(type => ({
                        text: type.libelle,
                        onPress: () => setFiltresReunion(prev => ({ ...prev, typeReunionId: type.id }))
                      })),
                      { text: 'Annuler', style: 'cancel' }
                    ]
                  );
                }}
              >
                <Text style={[styles.selectText, !filtresReunion.typeReunionId && styles.selectPlaceholder]}>
                  {filtresReunion.typeReunionId
                    ? typesReunion.find(t => t.id === filtresReunion.typeReunionId)?.libelle || 'Type sélectionné'
                    : 'Tous les types'
                  }
                </Text>
                <Text style={styles.selectArrow}>▼</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={() => {
                setFiltresReunion({});
                setReunionsFiltrees([]);
                setShowFilters(false);
              }}
            >
              <Text style={styles.modalButtonTextSecondary}>Réinitialiser</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={() => {
                appliquerFiltres();
                setShowFilters(false);
              }}
            >
              <Text style={styles.modalButtonTextPrimary}>Appliquer</Text>
            </TouchableOpacity>
          </View>
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
                  <Text style={styles.memberJoinDate}>
                    Membre depuis: {item.clubJoinedDateFormatted || 'Date non disponible'}
                  </Text>

                  {/* Affichage des fonctions (comités) */}
                  {(() => {
                    console.log('🔍 === DEBUG FONCTIONS MEMBRE ===');
                    console.log('🔍 Membre:', item.fullName);
                    console.log('🔍 Fonctions disponibles:', item.fonctions);
                    console.log('🔍 Nombre de fonctions:', item.fonctions?.length || 0);
                    console.log('🔍 Commissions disponibles:', item.commissions);
                    console.log('🔍 Nombre de commissions:', item.commissions?.length || 0);
                    return null;
                  })()}

                  {/* Affichage de test pour voir si les données sont là */}
                  <View style={styles.memberFunctionsContainer}>
                    <Text style={styles.memberFunctionsTitle}>🔍 Debug Info:</Text>
                    <Text style={styles.functionText}>
                      Fonctions: {item.fonctions?.length || 0} | Commissions: {item.commissions?.length || 0}
                    </Text>
                    {item.fonctions && item.fonctions.length > 0 && (
                      <Text style={styles.functionText}>
                        ✅ Fonctions détectées: {item.fonctions.map(f => f.comiteNom).join(', ')}
                      </Text>
                    )}
                    {item.commissions && item.commissions.length > 0 && (
                      <Text style={styles.functionText}>
                        ✅ Commissions détectées: {item.commissions.map(c => c.commissionNom).join(', ')}
                      </Text>
                    )}
                  </View>

                  {item.fonctions && item.fonctions.length > 0 && (
                    <View style={styles.memberFunctionsContainer}>
                      <Text style={styles.memberFunctionsTitle}>🏛️ Fonctions:</Text>
                      {item.fonctions.map((fonction, index) => (
                        <View key={index} style={styles.functionItem}>
                          <Text style={styles.functionText}>
                            • {fonction.comiteNom}
                            {fonction.estResponsable && ' (Responsable)'}
                            {!fonction.estActif && ' (Inactif)'}
                          </Text>
                          <Text style={styles.functionYear}>
                            Mandat {fonction.mandatAnnee}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Affichage des commissions */}
                  {item.commissions && item.commissions.length > 0 && (
                    <View style={styles.memberCommissionsContainer}>
                      <Text style={styles.memberCommissionsTitle}>🎯 Commissions:</Text>
                      {item.commissions.map((commission, index) => (
                        <View key={index} style={styles.commissionItem}>
                          <Text style={styles.commissionText}>
                            • {commission.commissionNom}
                            {commission.estResponsable && ' (Responsable)'}
                            {!commission.estActif && ' (Inactif)'}
                          </Text>
                          <Text style={styles.commissionYear}>
                            Mandat {commission.mandatAnnee}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Boutons d'action de communication */}
                  {item.phoneNumber && (
                    <View style={styles.communicationActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.callButton]}
                        onPress={() => {
                          console.log('🎯 Clic sur bouton Appel pour:', item.fullName);
                          makePhoneCall(item);
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="call" size={16} color="white" />
                        <Text style={styles.actionButtonText}>Appel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, styles.smsButton]}
                        onPress={() => {
                          console.log('🎯 Clic sur bouton SMS pour:', item.fullName);
                          sendSMS(item);
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="chatbubble" size={16} color="white" />
                        <Text style={styles.actionButtonText}>SMS</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, styles.whatsappButton]}
                        onPress={() => {
                          console.log('🎯 Clic sur bouton WhatsApp pour:', item.fullName);
                          openWhatsApp(item);
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="logo-whatsapp" size={16} color="white" />
                        <Text style={styles.actionButtonText}>WhatsApp</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {!item.phoneNumber && (
                    <View style={styles.noPhoneContainer}>
                      <Text style={styles.noPhoneText}>📵 Aucun numéro de téléphone</Text>
                    </View>
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

      {/* Modals de gestion des réunions */}
      <CreateReunionModal />
      <TypeReunionPickerModal />
      <ReunionDetailsModal />
      <PresenceManagerModal />
      <FiltersModal />

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
  // Styles pour les fonctionnalités avancées
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  headerButtonActive: {
    backgroundColor: colors.secondary,
  },
  detailSection: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  detailSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailActionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  detailActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  detailItem: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  detailLabel: {
    fontWeight: 'bold',
  },
  detailListItem: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
    paddingLeft: 8,
  },
  detailMoreText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    paddingLeft: 8,
    marginTop: 4,
  },
  detailActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  presenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  presenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  presenceDetails: {
    marginLeft: 12,
    flex: 1,
  },
  presenceName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  presenceRole: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  presenceActions: {
    marginLeft: 12,
  },
  presenceButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  presenceButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  presenceButtonInactive: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
  },
  presenceButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  presenceButtonTextActive: {
    color: 'white',
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

  memberDetails: {
    paddingLeft: 62,
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },

  memberJoinDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  memberDepartment: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  // Styles pour les boutons de communication
  communicationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 2,
    justifyContent: 'center',
  },
  callButton: {
    backgroundColor: '#4CAF50',
  },
  smsButton: {
    backgroundColor: '#2196F3',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
  },
  noPhoneContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  noPhoneText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },

  // Styles pour les fonctions et commissions
  memberFunctionsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  memberFunctionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#005AA9',
    marginBottom: 4,
  },
  functionItem: {
    marginBottom: 2,
  },
  functionText: {
    fontSize: 11,
    color: '#333',
    lineHeight: 16,
  },
  functionYear: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
  },
  memberCommissionsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  memberCommissionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F7A81B',
    marginBottom: 4,
  },
  commissionItem: {
    marginBottom: 2,
  },
  commissionText: {
    fontSize: 11,
    color: '#333',
    lineHeight: 16,
  },
  commissionYear: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
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

  // === STYLES POUR LES LISTES DE DÉTAILS ===
  detailList: {
    marginTop: 8,
  },
  detailListItemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  detailListItemNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  detailListItemNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  detailListItemIcon: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  detailListItemIconText: {
    fontSize: 18,
  },
  detailListItemContent: {
    flex: 1,
  },
  detailListItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 22,
  },
  detailListItemSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  detailListItemSubtextContainer: {
    marginTop: 6,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // === STYLES POUR LES STATISTIQUES DE RÉUNION ===
  meetingStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  meetingStatBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 80,
    flex: 1,
    marginHorizontal: 2,
  },
  meetingStatBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },
  meetingStatBadgeLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  meetingStatSummary: {
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 4,
  },
  meetingStatSummaryText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
