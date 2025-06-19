import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Linking,
  Platform
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';

// Configuration de l'API
const API_CONFIG = {
  BASE_URL: 'https://fc4f-102-212-189-1.ngrok-free.app',
  API_PREFIX: '/api'
};

// Types de base
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  clubId: string;
  clubName: string;
  role?: string;
}

interface Club {
  id: string;
  name: string;
  description?: string;
}

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
  clubId: string;
  fonction?: string;
  fonctions?: string[];
  commissions?: string[];
}

interface Reunion {
  id: string;
  date: string;
  heure: string;
  type: string;
  typeReunionLibelle: string;
  lieu?: string;
  description?: string;
  ordresDuJour: string[];
  presences: any[];
  invites: any[];
  dateFormatted: string;
  heureFormatted: string;
  ordresDuJourCount: number;
  presencesCount: number;
  invitesCount: number;
}

// Service API simplifié
class ApiService {
  private baseUrl = API_CONFIG.BASE_URL;
  private apiPrefix = API_CONFIG.API_PREFIX;

  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  }

  async saveToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync('authToken', token);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token:', error);
    }
  }

  async login(email: string, password: string, clubId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ email, password, clubId })
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.success && result.token) {
      await this.saveToken(result.token);
      return result;
    }
    throw new Error(result.message || 'Erreur de connexion');
  }

  async getClubs(): Promise<Club[]> {
    try {
      const response = await fetch(`${this.baseUrl}${this.apiPrefix}/clubs`, {
        headers: {
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des clubs:', error);
      return [];
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '', clubId: '' });
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('Home');

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      const clubsData = await apiService.getClubs();
      setClubs(clubsData);
    } catch (error) {
      console.error('Erreur chargement clubs:', error);
    }
  };

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password || !loginForm.clubId) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      const result = await apiService.login(loginForm.email, loginForm.password, loginForm.clubId);
      
      setCurrentUser({
        id: result.user?.id || '',
        email: result.user?.email || loginForm.email,
        firstName: result.user?.firstName || '',
        lastName: result.user?.lastName || '',
        fullName: result.user?.fullName || '',
        clubId: loginForm.clubId,
        clubName: clubs.find(c => c.id === loginForm.clubId)?.name || ''
      });
      
      setIsAuthenticated(true);
      setShowLogin(false);
      Alert.alert('Succès', 'Connexion réussie !');
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  if (showLogin) {
    return (
      <SafeAreaView style={styles.container}>
        <ExpoStatusBar style="light" backgroundColor={colors.primary} />
        <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
        
        <View style={styles.loginContainer}>
          <Text style={styles.loginTitle}>Rotary Club Mobile</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={loginForm.email}
            onChangeText={(text) => setLoginForm({...loginForm, email: text})}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            value={loginForm.password}
            onChangeText={(text) => setLoginForm({...loginForm, password: text})}
            secureTextEntry
          />
          
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Club :</Text>
            <ScrollView style={styles.clubList} showsVerticalScrollIndicator={false}>
              {clubs.map((club) => (
                <TouchableOpacity
                  key={club.id}
                  style={[
                    styles.clubItem,
                    loginForm.clubId === club.id && styles.clubItemSelected
                  ]}
                  onPress={() => setLoginForm({...loginForm, clubId: club.id})}
                >
                  <Text style={[
                    styles.clubItemText,
                    loginForm.clubId === club.id && styles.clubItemTextSelected
                  ]}>
                    {club.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="light" backgroundColor={colors.primary} />
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rotary Club Mobile</Text>
        <Text style={styles.headerSubtitle}>{currentUser?.clubName}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.welcomeText}>
          Bienvenue {currentUser?.fullName || currentUser?.firstName}
        </Text>
        <Text style={styles.infoText}>
          Application mobile Rotary Club en cours de développement.
        </Text>
      </View>
      
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navText}>🏠 Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navText}>📅 Réunions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navText}>👥 Membres</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navText}>👤 Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.surface,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.text,
  },
  clubList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  clubItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  clubItemSelected: {
    backgroundColor: colors.primary,
  },
  clubItemText: {
    fontSize: 16,
    color: colors.text,
  },
  clubItemTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    opacity: 0.7,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navItem: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
});
