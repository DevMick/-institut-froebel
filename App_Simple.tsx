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
  FlatList,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

// Configuration API
const API_CONFIG = {
  BASE_URL: 'https://4a45-102-212-189-1.ngrok-free.app',
  API_PREFIX: '/api',
  TIMEOUT: 10000,
};

// Types de base
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

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  clubId?: string;
  clubName?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Service API simplifié
class ApiService {
  private async getToken(): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('authToken');
      }
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('Erreur token:', error);
      return null;
    }
  }

  private async setToken(token: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('authToken', token);
        return;
      }
      await SecureStore.setItemAsync('authToken', token);
    } catch (error) {
      console.error('Erreur sauvegarde token:', error);
    }
  }

  async login(email: string, password: string, clubId: string): Promise<User> {
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

      if (result.token) {
        await this.setToken(result.token);
        return {
          id: 'user-id',
          email: email,
          firstName: 'Utilisateur',
          lastName: 'Connecté',
          fullName: 'Utilisateur Connecté',
          clubId: clubId
        };
      }

      throw new Error(result.message || 'Erreur de connexion');
    } catch (error) {
      console.error('Erreur login:', error);
      throw error;
    }
  }

  async getClubs(): Promise<Club[]> {
    try {
      const url = `${API_CONFIG.BASE_URL}/api/Clubs`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
      console.error('Erreur chargement clubs:', error);
      throw error;
    }
  }
}

// Composant principal
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  
  // États du formulaire de connexion
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedClubId, setSelectedClubId] = useState('');
  const [showClubModal, setShowClubModal] = useState(false);

  const apiService = new ApiService();

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      setLoading(true);
      const clubsData = await apiService.getClubs();
      setClubs(clubsData);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les clubs');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password || !selectedClubId) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      const userData = await apiService.login(email, password, selectedClubId);
      setUser(userData);
      setIsAuthenticated(true);
      setShowLogin(false);
      
      const club = clubs.find(c => c.id === selectedClubId);
      setSelectedClub(club || null);
      
      Alert.alert('Succès', 'Connexion réussie !');
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setSelectedClub(null);
    setShowLogin(true);
    setEmail('');
    setPassword('');
    setSelectedClubId('');
  };

  const renderClubSelector = () => (
    <TouchableOpacity
      style={styles.clubSelector}
      onPress={() => setShowClubModal(true)}
    >
      <Text style={styles.clubSelectorText}>
        {selectedClubId ? clubs.find(c => c.id === selectedClubId)?.name || 'Sélectionner un club' : 'Sélectionner un club'}
      </Text>
      <Ionicons name="chevron-down" size={20} color="#666" />
    </TouchableOpacity>
  );

  const renderClubModal = () => (
    <Modal
      visible={showClubModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowClubModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sélectionner un club</Text>
            <TouchableOpacity onPress={() => setShowClubModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.clubList}>
            {clubs.map((club) => (
              <TouchableOpacity
                key={club.id}
                style={styles.clubItem}
                onPress={() => {
                  setSelectedClubId(club.id);
                  setShowClubModal(false);
                }}
              >
                <Text style={styles.clubName}>{club.name}</Text>
                <Text style={styles.clubCity}>{club.city}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (showLogin) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor="#005AA9" />
        <View style={styles.loginContainer}>
          <View style={styles.header}>
            <Ionicons name="people-circle" size={80} color="#005AA9" />
            <Text style={styles.title}>Rotary Club Mobile</Text>
            <Text style={styles.subtitle}>Connexion</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {renderClubSelector()}

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loginButtonText}>Se connecter</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadClubs}
              disabled={loading}
            >
              <Text style={styles.refreshButtonText}>
                {loading ? 'Chargement...' : 'Actualiser les clubs'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {renderClubModal()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#005AA9" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Rotary Club Mobile</Text>
        {selectedClub && (
          <Text style={styles.clubHeader}>{selectedClub.name}</Text>
        )}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>
            Bienvenue, {user?.fullName || 'Utilisateur'}
          </Text>
          {selectedClub && (
            <Text style={styles.clubInfo}>
              {selectedClub.city}, {selectedClub.country}
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="white" />
          <Text style={styles.logoutButtonText}>Déconnexion</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: '#005AA9',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
  },
  clubHeader: {
    fontSize: 14,
    color: 'white',
    marginTop: 5,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  clubSelector: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clubSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#005AA9',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  refreshButton: {
    alignItems: 'center',
    padding: 10,
  },
  refreshButtonText: {
    color: '#005AA9',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clubList: {
    maxHeight: 400,
  },
  clubItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  clubName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  clubCity: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: 'white',
    borderRadius: 10,
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
  logoutButton: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
