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

interface TypeReunion {
  id: string;
  libelle: string;
  description?: string;
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

  async getReunions(clubId: string): Promise<Reunion[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${this.baseUrl}${this.apiPrefix}/clubs/${clubId}/reunions`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const data = await response.json();
      const reunions = Array.isArray(data) ? data : (data.data || []);

      // Formater les données
      return reunions.map(reunion => ({
        ...reunion,
        dateFormatted: new Date(reunion.date).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        heureFormatted: reunion.heure || '18:00:00',
        ordresDuJourCount: reunion.ordresDuJour?.length || 0,
        presencesCount: reunion.presences?.length || 0,
        invitesCount: reunion.invites?.length || 0
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des réunions:', error);
      return [];
    }
  }

  async getReunionDetails(clubId: string, reunionId: string): Promise<Reunion | null> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${this.baseUrl}${this.apiPrefix}/clubs/${clubId}/reunions/${reunionId}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const reunion = await response.json();
      return {
        ...reunion,
        dateFormatted: new Date(reunion.date).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        heureFormatted: reunion.heure || '18:00:00',
        ordresDuJourCount: reunion.ordresDuJour?.length || 0,
        presencesCount: reunion.presences?.length || 0,
        invitesCount: reunion.invites?.length || 0
      };
    } catch (error) {
      console.error('Erreur lors du chargement des détails de la réunion:', error);
      return null;
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

  // États pour les réunions
  const [reunions, setReunions] = useState<Reunion[]>([]);
  const [selectedReunion, setSelectedReunion] = useState<Reunion | null>(null);
  const [showReunionDetails, setShowReunionDetails] = useState(false);

  // États pour le compte-rendu
  const [compteRenduData, setCompteRenduData] = useState<any>(null);
  const [compteRenduLoading, setCompteRenduLoading] = useState(false);

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

  const loadReunions = async () => {
    if (!currentUser?.clubId) return;

    try {
      setLoading(true);
      const reunionsData = await apiService.getReunions(currentUser.clubId);
      setReunions(reunionsData);
    } catch (error) {
      console.error('Erreur chargement réunions:', error);
      Alert.alert('Erreur', 'Impossible de charger les réunions');
    } finally {
      setLoading(false);
    }
  };

  const loadReunionDetails = async (reunionId: string) => {
    if (!currentUser?.clubId) return;

    try {
      setCompteRenduLoading(true);
      const reunion = await apiService.getReunionDetails(currentUser.clubId, reunionId);
      if (reunion) {
        setSelectedReunion(reunion);
        await loadCompteRenduData(reunion);
      }
    } catch (error) {
      console.error('Erreur chargement détails réunion:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de la réunion');
    } finally {
      setCompteRenduLoading(false);
    }
  };

  const loadCompteRenduData = async (reunion: Reunion) => {
    try {
      // Construction du compte-rendu à partir des données de la réunion
      const compteRendu = {
        reunion: {
          id: reunion.id,
          date: reunion.date,
          heure: reunion.heure || "16:00:00",
          typeReunion: reunion.type || reunion.typeReunionLibelle || "Réunion",
          clubId: currentUser?.clubId || ''
        },
        presences: (reunion.presences || []).map((p: any) => ({
          membreId: p.membreId,
          nomComplet: p.nomCompletMembre || p.nomComplet || 'Nom non disponible',
          selected: true
        })),
        invites: (reunion.invites || []).map((i: any) => ({
          id: i.id,
          nom: i.nom,
          prenom: i.prenom,
          organisation: i.organisation || '',
          selected: true
        })),
        ordresDuJour: (reunion.ordresDuJour || []).map((ordre: any, index: number) => ({
          numero: index + 1,
          id: `ordre-${index + 1}`,
          description: typeof ordre === 'string' ? ordre : ordre.description || ordre.titre || `Ordre du jour ${index + 1}`,
          contenu: '' // Pas de contenu détaillé pour le moment
        })),
        divers: '', // Pas de points divers pour le moment
        statistiques: {
          totalPresences: reunion.presences?.length || 0,
          totalInvites: reunion.invites?.length || 0,
          totalParticipants: (reunion.presences?.length || 0) + (reunion.invites?.length || 0),
          totalOrdresDuJour: reunion.ordresDuJour?.length || 0,
          ordresAvecContenu: 0
        }
      };

      setCompteRenduData(compteRendu);
    } catch (error) {
      console.error('Erreur construction compte-rendu:', error);
      setCompteRenduData(null);
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
      
      const user = {
        id: result.user?.id || '',
        email: result.user?.email || loginForm.email,
        firstName: result.user?.firstName || '',
        lastName: result.user?.lastName || '',
        fullName: result.user?.fullName || '',
        clubId: loginForm.clubId,
        clubName: clubs.find(c => c.id === loginForm.clubId)?.name || ''
      };

      setCurrentUser(user);
      setIsAuthenticated(true);
      setShowLogin(false);

      // Charger les données du club
      await loadReunions();

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
        {currentScreen === 'Home' && (
          <>
            <Text style={styles.welcomeText}>
              Bienvenue {currentUser?.fullName || currentUser?.firstName}
            </Text>
            <Text style={styles.infoText}>
              {reunions.length} réunion(s) disponible(s)
            </Text>
          </>
        )}

        {currentScreen === 'Reunions' && (
          <ScrollView style={styles.reunionsContainer}>
            <Text style={styles.sectionTitle}>Réunions ({reunions.length})</Text>
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
            ) : (
              reunions.map((reunion) => (
                <TouchableOpacity
                  key={reunion.id}
                  style={styles.reunionCard}
                  onPress={() => {
                    loadReunionDetails(reunion.id);
                    setShowReunionDetails(true);
                  }}
                >
                  <View style={styles.reunionHeader}>
                    <Text style={styles.reunionType}>{reunion.typeReunionLibelle}</Text>
                    <Text style={styles.reunionDate}>{reunion.dateFormatted}</Text>
                  </View>
                  <Text style={styles.reunionTime}>🕐 {reunion.heureFormatted}</Text>
                  <View style={styles.reunionStats}>
                    <Text style={styles.statItem}>👥 {reunion.presencesCount} présents</Text>
                    <Text style={styles.statItem}>🎯 {reunion.invitesCount} invités</Text>
                    <Text style={styles.statItem}>📋 {reunion.ordresDuJourCount} ordres</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
      </View>
      
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, currentScreen === 'Home' && styles.navItemActive]}
          onPress={() => setCurrentScreen('Home')}
        >
          <Text style={[styles.navText, currentScreen === 'Home' && styles.navTextActive]}>🏠 Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, currentScreen === 'Reunions' && styles.navItemActive]}
          onPress={() => setCurrentScreen('Reunions')}
        >
          <Text style={[styles.navText, currentScreen === 'Reunions' && styles.navTextActive]}>📅 Réunions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, currentScreen === 'Membres' && styles.navItemActive]}
          onPress={() => setCurrentScreen('Membres')}
        >
          <Text style={[styles.navText, currentScreen === 'Membres' && styles.navTextActive]}>👥 Membres</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, currentScreen === 'Profil' && styles.navItemActive]}
          onPress={() => setCurrentScreen('Profil')}
        >
          <Text style={[styles.navText, currentScreen === 'Profil' && styles.navTextActive]}>👤 Profil</Text>
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
  navItemActive: {
    backgroundColor: colors.primary,
  },
  navTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  reunionsContainer: {
    flex: 1,
    padding: 10,
  },
  reunionCard: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reunionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reunionType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    flex: 1,
  },
  reunionDate: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
  },
  reunionTime: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  reunionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.8,
  },
  loader: {
    marginTop: 50,
  },
});
