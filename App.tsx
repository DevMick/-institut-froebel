import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Modal
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';

// Configuration API
const API_CONFIG = {
  // URL de base de l'API (ngrok ou serveur de production)
  BASE_URL: 'https://fc4f-102-212-189-1.ngrok-free.app', // ✅ URL ngrok mise à jour
  API_PREFIX: '/api',
  // Timeout pour les requêtes (en millisecondes)
  TIMEOUT: 30000,
  // Headers par défaut
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
};

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  clubId: string;
  clubName: string;
  role?: string;
  roles?: string[];
  phoneNumber?: string;
  joinedDate?: string;
  isActive?: boolean;
  primaryClubId?: string;
  primaryClubName?: string;
}

interface Club {
  id: string;
  name: string;
  description?: string;
}

interface Reunion {
  id: string;
  date: string;
  heure: string;
  type: string;
  typeReunionLibelle: string;
  lieu?: string;
  description?: string;
  ordresDuJour: any[];
  presences: any[];
  invites: any[];
  dateFormatted: string;
  heureFormatted: string;
  ordresDuJourCount: number;
  presencesCount: number;
  invitesCount: number;
  nombreOrdresDuJour?: number;
  nombrePresences?: number;
  nombreInvites?: number;
}

// Interface pour les types de réponse API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Interface pour les membres
interface Member {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  userJoinedDate?: string;
  clubJoinedDate?: string;
  userJoinedDateFormatted?: string;
  clubJoinedDateFormatted?: string;
  isActive: boolean;
  roles?: string[];
  clubId: string;
  clubName: string;
  userClubId?: string;
  fonctions?: Array<{
    comiteId: string;
    comiteNom: string;
    estResponsable: boolean;
    estActif: boolean;
    dateNomination: string;
    mandatAnnee: number;
  }>;
  commissions?: Array<{
    commissionId: string;
    commissionNom: string;
    estResponsable: boolean;
    estActif: boolean;
    dateNomination: string;
    mandatAnnee: number;
  }>;
}

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
}

const apiService = new ApiService();

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
  const [reunions, setReunions] = useState<Reunion[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedReunion, setSelectedReunion] = useState<any>(null);
  const [showReunionModal, setShowReunionModal] = useState(false);

  // États pour le compte-rendu
  const [compteRenduData, setCompteRenduData] = useState<{
    reunion: {
      id: string;
      date: string;
      heure: string;
      typeReunion: string;
      clubId: string;
    };
    presences: Array<{
      membreId: string;
      nomComplet: string;
      selected: boolean;
    }>;
    invites: Array<{
      id: string;
      nom: string;
      prenom: string;
      organisation: string;
      selected: boolean;
    }>;
    ordresDuJour: Array<{
      numero: number;
      id: string;
      description: string;
      contenu: string;
    }>;
    divers: string;
    statistiques: {
      totalPresences: number;
      totalInvites: number;
      totalParticipants: number;
      totalOrdresDuJour: number;
      ordresAvecContenu: number;
    };
  } | null>(null);
  const [compteRenduLoading, setCompteRenduLoading] = useState(false);
  const [selectedReunion, setSelectedReunion] = useState<any>(null);
  const [showReunionModal, setShowReunionModal] = useState(false);
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

  // Charger le compte-rendu complet selon le flux détaillé
  const loadCompteRenduData = async (reunion: any) => {
    try {
      setCompteRenduLoading(true);
      setCompteRenduData(null); // Reset des données précédentes

      console.log('📄 === CHARGEMENT COMPTE-RENDU COMPLET ===');
      console.log('📄 Réunion ID:', reunion.id);
      console.log('📄 Club ID:', currentUser?.clubId);

      const token = await apiService.getToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      // ÉTAPE 1 : Récupérer les données de base de la réunion (déjà disponibles)
      console.log('📋 === ÉTAPE 1: DONNÉES DE BASE ===');
      console.log('📋 Ordres du jour à traiter:', reunion.ordresDuJour?.length || 0);

      // ÉTAPE 2 : Charger le contenu pour chaque ordre du jour
      console.log('📋 === ÉTAPE 2: CHARGEMENT CONTENU ORDRES DU JOUR ===');
      const ordresAvecContenu = [];
      let diversExistant = '';

      if (reunion.ordresDuJour && reunion.ordresDuJour.length > 0) {
        for (let i = 0; i < reunion.ordresDuJour.length; i++) {
          const ordre = reunion.ordresDuJour[i];
          console.log(`📋 Traitement ordre ${i + 1}:`, {
            id: ordre.id,
            description: ordre.description || ordre
          });

          try {
            // Construire l'URL pour les rapports de cet ordre
            const rapportsUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/clubs/${currentUser?.clubId}/reunions/${reunion.id}/ordres-du-jour/${ordre.id}/rapports`;
            console.log(`🌐 URL rapports ordre ${i + 1}:`, rapportsUrl);
            console.log(`🔍 Ordre ID: ${ordre.id}`);
            console.log(`🔍 Réunion ID: ${reunion.id}`);
            console.log(`🔍 Club ID: ${currentUser?.clubId}`);

            const rapportsResponse = await fetch(rapportsUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true'
              }
            });

            console.log(`📡 Réponse API rapports ordre ${i + 1}:`, {
              status: rapportsResponse.status,
              statusText: rapportsResponse.statusText,
              ok: rapportsResponse.ok,
              url: rapportsUrl
            });

            let contenuOrdre = '';

            if (rapportsResponse.ok) {
              const rapportsData = await rapportsResponse.json();
              console.log(`📄 === RAPPORTS REÇUS POUR ORDRE ${i + 1} ===`);
              console.log('📄 Données complètes:', JSON.stringify(rapportsData, null, 2));

              if (rapportsData && rapportsData.rapports && rapportsData.rapports.length > 0) {
                console.log(`📋 Nombre de rapports trouvés: ${rapportsData.rapports.length}`);

                // Extraire le contenu du premier rapport avec du texte
                const rapportTexte = rapportsData.rapports.find(r => r.texte && r.texte.trim());
                if (rapportTexte) {
                  contenuOrdre = rapportTexte.texte;
                  console.log(`✅ Contenu trouvé pour ordre ${i + 1}:`);
                  console.log(`📝 Longueur: ${contenuOrdre.length} caractères`);
                  console.log(`📝 Aperçu: ${contenuOrdre.substring(0, 200)}...`);
                } else {
                  console.log(`⚠️ Aucun rapport avec texte trouvé pour ordre ${i + 1}`);
                  rapportsData.rapports.forEach((r, idx) => {
                    console.log(`📋 Rapport ${idx + 1}:`, {
                      id: r.id,
                      hasTexte: !!r.texte,
                      texteLength: r.texte?.length || 0,
                      hasDivers: !!r.divers
                    });
                  });
                }

                // Extraire les points divers (une seule fois)
                if (!diversExistant) {
                  const rapportDivers = rapportsData.rapports.find(r => r.divers && r.divers.trim());
                  if (rapportDivers) {
                    diversExistant = rapportDivers.divers;
                    console.log('✅ Points divers trouvés:');
                    console.log(`📝 Longueur: ${diversExistant.length} caractères`);
                    console.log(`📝 Aperçu: ${diversExistant.substring(0, 200)}...`);
                  }
                }
              } else {
                console.log(`⚠️ Structure de réponse inattendue pour ordre ${i + 1}:`, rapportsData);
              }
            } else {
              const errorText = await rapportsResponse.text();
              console.log(`❌ Erreur API pour ordre ${i + 1}:`, {
                status: rapportsResponse.status,
                statusText: rapportsResponse.statusText,
                body: errorText,
                url: rapportsUrl
              });
            }

            ordresAvecContenu.push({
              numero: i + 1,
              id: ordre.id,
              description: ordre.description || ordre,
              contenu: contenuOrdre
            });

          } catch (error) {
            console.log(`❌ Erreur chargement rapport ordre ${i + 1}:`, error.message);
            // En cas d'erreur, ajouter l'ordre sans contenu
            ordresAvecContenu.push({
              numero: i + 1,
              id: ordre.id || `ordre-${i + 1}`,
              description: ordre.description || ordre,
              contenu: ''
            });
          }
        }
      }

      // ÉTAPE 3 : Construction de l'objet final
      console.log('📋 === ÉTAPE 3: CONSTRUCTION OBJET FINAL ===');
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
        ordresDuJour: ordresAvecContenu,
        divers: diversExistant,
        statistiques: {
          totalPresences: reunion.presences?.length || 0,
          totalInvites: reunion.invites?.length || 0,
          totalParticipants: (reunion.presences?.length || 0) + (reunion.invites?.length || 0),
          totalOrdresDuJour: ordresAvecContenu.length,
          ordresAvecContenu: ordresAvecContenu.filter(o => o.contenu && o.contenu.trim()).length
        }
      };

      console.log('✅ === COMPTE-RENDU COMPLET CHARGÉ ===');
      console.log('📊 Statistiques finales:', compteRendu.statistiques);
      console.log('👥 Présences:', compteRendu.presences.map(p => p.nomComplet));
      console.log('🎯 Invités:', compteRendu.invites.map(i => `${i.prenom} ${i.nom}`));
      console.log('📋 Ordres avec contenu:', compteRendu.ordresDuJour.filter(o => o.contenu).length);
      console.log('📝 Points divers:', diversExistant ? 'Présents' : 'Absents');

      setCompteRenduData(compteRendu);
      console.log('✅ Compte-rendu complet chargé avec succès pour réunion:', reunion.id);

    } catch (error) {
      console.error('❌ Erreur lors du chargement du compte-rendu complet:', error);
      setCompteRenduData(null);
    } finally {
      setCompteRenduLoading(false);
    }
  };

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
        const reunionComplete = {
          ...reunionExistante,
          ...detailsSupplementaires,
          // S'assurer que les tableaux existent
          ordresDuJour: detailsSupplementaires.ordresDuJour || reunionExistante.ordresDuJour || [],
          presences: detailsSupplementaires.presences || reunionExistante.presences || [],
          invites: detailsSupplementaires.invites || reunionExistante.invites || []
        };

        setSelectedReunion(reunionComplete);

        // Charger les données du compte-rendu
        await loadCompteRenduData(reunionComplete);

      } catch (detailError) {
        console.log('⚠️ Impossible de charger les détails supplémentaires, utilisation des données existantes');
        // Utiliser les données existantes
        const reunionComplete = {
          ...reunionExistante,
          // S'assurer que les tableaux existent
          ordresDuJour: reunionExistante.ordresDuJour || [],
          presences: reunionExistante.presences || [],
          invites: reunionExistante.invites || []
        };

        setSelectedReunion(reunionComplete);

        // Charger les données du compte-rendu
        await loadCompteRenduData(reunionComplete);
      }

      console.log('✅ Détails de la réunion chargés avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du chargement des détails:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de la réunion');
    } finally {
      setLoading(false);
    }
  };

  // Gérer le clic sur une réunion
  const handleReunionPress = async (reunion: Reunion) => {
    console.log('🎯 === CLIC SUR RÉUNION ===');
    console.log('🎯 Réunion cliquée:', reunion.id, reunion.typeReunionLibelle);
    console.log('🎯 Données de la réunion:', reunion);

    await loadReunionDetails(reunion.id);
    setShowReunionModal(true);
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
                  onPress={() => handleReunionPress(reunion)}
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

      {/* Modal du compte-rendu */}
      <Modal
        visible={showReunionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowReunionModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedReunion?.typeReunionLibelle || 'Réunion'}
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowReunionModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          {selectedReunion && (
            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={true}>
              {/* Affichage du Compte-rendu */}
              {compteRenduLoading ? (
                <View style={styles.compteRenduContainer}>
                  <View style={styles.compteRenduLoadingState}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.compteRenduLoadingText}>Chargement du compte-rendu...</Text>
                  </View>
                </View>
              ) : compteRenduData ? (
                <View style={styles.compteRenduContainer}>
                  <Text style={styles.compteRenduTitle}>📄 Compte-rendu de la réunion</Text>

                  {/* Statistiques rapides */}
                  {compteRenduData.statistiques && (
                    <View style={styles.compteRenduStatsContainer}>
                      <View style={styles.compteRenduStat}>
                        <Text style={styles.compteRenduStatNumber}>{compteRenduData.statistiques.totalPresences}</Text>
                        <Text style={styles.compteRenduStatLabel}>Présents</Text>
                      </View>
                      <View style={styles.compteRenduStat}>
                        <Text style={styles.compteRenduStatNumber}>{compteRenduData.statistiques.totalInvites}</Text>
                        <Text style={styles.compteRenduStatLabel}>Invités</Text>
                      </View>
                      <View style={styles.compteRenduStat}>
                        <Text style={styles.compteRenduStatNumber}>{compteRenduData.statistiques.totalOrdresDuJour}</Text>
                        <Text style={styles.compteRenduStatLabel}>Ordres</Text>
                      </View>
                    </View>
                  )}

                  {/* Informations de la réunion */}
                  <View style={styles.compteRenduSection}>
                    <Text style={styles.compteRenduSectionTitle}>📅 Informations</Text>
                    <Text style={styles.compteRenduText}>
                      Date: {compteRenduData.reunion?.date ? new Date(compteRenduData.reunion.date).toLocaleDateString('fr-FR') : selectedReunion.dateFormatted || selectedReunion.date}
                    </Text>
                    <Text style={styles.compteRenduText}>
                      Heure: {compteRenduData.reunion?.heure || selectedReunion.heure || 'Non spécifiée'}
                    </Text>
                    <Text style={styles.compteRenduText}>
                      Type: {compteRenduData.reunion?.typeReunion || selectedReunion.typeReunionLibelle || 'Réunion'}
                    </Text>
                  </View>

                  {/* Présences */}
                  {compteRenduData.presences && compteRenduData.presences.length > 0 && (
                    <View style={styles.compteRenduSection}>
                      <Text style={styles.compteRenduSectionTitle}>
                        👥 Présences ({compteRenduData.presences.length})
                      </Text>
                      {compteRenduData.presences.map((presence, index) => (
                        <Text key={index} style={styles.compteRenduListItem}>
                          • {presence.nomComplet || presence.nomCompletMembre || presence.nomMembre || 'Nom non disponible'}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Invités */}
                  {compteRenduData.invites && compteRenduData.invites.length > 0 && (
                    <View style={styles.compteRenduSection}>
                      <Text style={styles.compteRenduSectionTitle}>
                        🎯 Invités ({compteRenduData.invites.length})
                      </Text>
                      {compteRenduData.invites.map((invite, index) => (
                        <Text key={index} style={styles.compteRenduListItem}>
                          • {invite.prenom} {invite.nom}
                          {invite.organisation && ` (${invite.organisation})`}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Ordres du jour */}
                  {compteRenduData.ordresDuJour && compteRenduData.ordresDuJour.length > 0 && (
                    <View style={styles.compteRenduSection}>
                      <Text style={styles.compteRenduSectionTitle}>
                        📋 Ordres du jour ({compteRenduData.ordresDuJour.length})
                      </Text>
                      {compteRenduData.ordresDuJour.map((ordre, index) => (
                        <View key={ordre.id || index} style={styles.compteRenduOrdreItem}>
                          <Text style={styles.compteRenduOrdreTitle}>
                            {ordre.numero || (index + 1)}. {ordre.description}
                          </Text>
                          {ordre.contenu && ordre.contenu.trim() ? (
                            <View style={styles.compteRenduOrdreContenuContainer}>
                              <Text style={styles.compteRenduOrdreContenu}>
                                {ordre.contenu}
                              </Text>
                            </View>
                          ) : (
                            <View style={styles.compteRenduOrdreVideContainer}>
                              <Text style={styles.compteRenduOrdreVide}>
                                📝 Ordre du jour défini - Contenu détaillé à venir
                              </Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Points divers */}
                  {compteRenduData.divers && compteRenduData.divers.trim() ? (
                    <View style={styles.compteRenduSection}>
                      <Text style={styles.compteRenduSectionTitle}>📝 Points divers</Text>
                      <View style={styles.compteRenduDiversContainer}>
                        <Text style={styles.compteRenduDiversText}>{compteRenduData.divers}</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.compteRenduSection}>
                      <Text style={styles.compteRenduSectionTitle}>📝 Points divers</Text>
                      <View style={styles.compteRenduDiversVideContainer}>
                        <Text style={styles.compteRenduDiversVide}>
                          Aucun point divers enregistré pour cette réunion.
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.compteRenduContainer}>
                  <View style={styles.compteRenduEmptyState}>
                    <Text style={styles.compteRenduEmptyIcon}>📄</Text>
                    <Text style={styles.compteRenduEmptyTitle}>Compte-rendu non disponible</Text>
                    <Text style={styles.compteRenduEmptyText}>
                      Le compte-rendu de cette réunion n'a pas encore été rédigé ou n'est pas disponible.
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
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
  // Styles pour le modal
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalScrollView: {
    flex: 1,
  },
  // Styles pour le compte-rendu
  compteRenduContainer: {
    padding: 20,
  },
  compteRenduTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  compteRenduLoadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  compteRenduLoadingText: {
    fontSize: 16,
    color: colors.text,
    marginTop: 15,
    textAlign: 'center',
  },
  compteRenduEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  compteRenduEmptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  compteRenduEmptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  compteRenduEmptyText: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
  },
  compteRenduStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  compteRenduStat: {
    alignItems: 'center',
  },
  compteRenduStatNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  compteRenduStatLabel: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    marginTop: 4,
  },
  compteRenduSection: {
    marginBottom: 25,
  },
  compteRenduSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  compteRenduText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 6,
  },
  compteRenduListItem: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 4,
    paddingLeft: 10,
  },
  compteRenduOrdreItem: {
    marginBottom: 20,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  compteRenduOrdreTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    lineHeight: 22,
  },
  compteRenduOrdreContenuContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  compteRenduOrdreContenu: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    textAlign: 'justify',
  },
  compteRenduOrdreVideContainer: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  compteRenduOrdreVide: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  compteRenduDiversContainer: {
    padding: 15,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  compteRenduDiversText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    textAlign: 'justify',
  },
  compteRenduDiversVideContainer: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  compteRenduDiversVide: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
