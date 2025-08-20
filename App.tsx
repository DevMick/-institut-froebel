/**
 * Rotary Club Mobile App - Version Modulaire pour Expo Snack
 * Application connectée à l'API ASP.NET Core avec PostgreSQL
 */

import React, { useState, useEffect } from 'react';
import { Alert, View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Imports des composants modulaires
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { Dashboard } from './components/Dashboard';
import { MembersScreen } from './components/MembersScreen';
import { ReunionsScreen } from './components/ReunionsScreen';
import CotisationsScreen from './components/CotisationsScreen';
import { SituationCotisationScreen } from './components/SituationCotisationScreen';
import { CalendrierScreen } from './components/CalendrierScreen';
import { ClubsScreen } from './components/ClubsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { EmailScreen } from './components/EmailScreen';
import { WhatsAppScreen } from './components/WhatsAppScreen';
import { ApiService } from './services/ApiService';
import { User, Club, NavigationScreen } from './types';

export default function App() {
  // États principaux de l'application
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<NavigationScreen>('login');

  const apiService = new ApiService();

  // Chargement initial des clubs
  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des clubs...');
      const clubsData = await apiService.getClubs();
      console.log('✅ Clubs chargés:', clubsData.length);
      setClubs(clubsData);
    } catch (error: any) {
      console.error('❌ Erreur chargement clubs:', error);
      Alert.alert(
        'Erreur de connexion',
        'Impossible de charger les clubs. Vérifiez que votre API backend est démarrée et que l\'URL ngrok est correcte.',
        [
          { text: 'Réessayer', onPress: loadClubs },
          { text: 'OK' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (userData: User, club: Club) => {
    try {
      // 🔍 LOG: Vérification des données utilisateur lors de la connexion
      console.log('🔍 CONNEXION - Données utilisateur reçues du login:', {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: userData.fullName,
        clubId: userData.clubId
      });

      setUser(userData);
      setSelectedClub(club);
      setIsAuthenticated(true);
      setCurrentScreen('dashboard');
    } catch (error: any) {
      console.error('❌ Erreur lors de la connexion:', error);
      Alert.alert('Erreur', 'Erreur lors de la connexion');
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      setIsAuthenticated(false);
      setUser(null);
      setSelectedClub(null);
      setCurrentScreen('login');
      console.log('✅ Déconnexion réussie');
    } catch (error: any) {
      console.error('❌ Erreur lors de la déconnexion:', error);
    }
  };

  const handleNavigation = (screen: NavigationScreen) => {
    console.log('🧭 Navigation vers:', screen);
    setCurrentScreen(screen);
  };

  const handleNavigateToRegister = () => {
    setCurrentScreen('register');
  };

  const handleNavigateToLogin = () => {
    setCurrentScreen('login');
  };

  // Écran de chargement initial
  if (loading && clubs.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" backgroundColor="#005AA9" />
        <Text style={styles.loadingText}>Chargement...</Text>
        <Text style={styles.loadingSubtext}>Connexion au serveur</Text>
      </View>
    );
  }

  // Écrans de connexion et d'inscription
  if (!isAuthenticated) {
    if (currentScreen === 'register') {
      return (
        <>
          <StatusBar style="light" backgroundColor="#005AA9" />
          <RegisterScreen
            clubs={clubs}
            loading={loading}
            onNavigateToLogin={handleNavigateToLogin}
            onLoadClubs={loadClubs}
          />
        </>
      );
    }

    // Écran de connexion par défaut
    return (
      <>
        <StatusBar style="light" backgroundColor="#005AA9" />
        <LoginScreen
          clubs={clubs}
          loading={loading}
          onLogin={handleLogin}
          onLoadClubs={loadClubs}
          onNavigateToRegister={handleNavigateToRegister}
        />
      </>
    );
  }

  // Navigation vers les différents écrans
  if (user && selectedClub) {
    const handleBackToDashboard = () => setCurrentScreen('dashboard');

    switch (currentScreen) {
      case 'dashboard':
        return (
          <>
            <StatusBar style="light" backgroundColor="#005AA9" />
            <Dashboard
              user={user}
              club={selectedClub}
              onLogout={handleLogout}
              onNavigate={handleNavigation}
            />
          </>
        );

      case 'members':
        return (
          <>
            <StatusBar style="light" backgroundColor="#005AA9" />
            <MembersScreen
              club={selectedClub}
              onBack={handleBackToDashboard}
            />
          </>
        );

      case 'reunions':
        return (
          <>
            <StatusBar style="light" backgroundColor="#005AA9" />
            <ReunionsScreen
              club={selectedClub}
              onBack={handleBackToDashboard}
            />
          </>
        );

      case 'cotisations':
        return (
          <>
            <StatusBar style="light" backgroundColor="#005AA9" />
            <CotisationsScreen
              club={selectedClub}
              user={user}
              onBack={handleBackToDashboard}
            />
          </>
        );

              case 'situation-cotisation':
          return (
            <>
              <StatusBar style="light" backgroundColor="#005AA9" />
              <SituationCotisationScreen
                club={selectedClub}
                user={user}
                onBack={handleBackToDashboard}
              />
            </>
          );

        case 'calendrier':
          return (
            <>
              <StatusBar style="light" backgroundColor="#005AA9" />
              <CalendrierScreen
                club={selectedClub}
                user={user}
                onBack={handleBackToDashboard}
              />
            </>
          );

        case 'email':
        return (
          <>
            <StatusBar style="light" backgroundColor="#005AA9" />
            <EmailScreen
              user={user}
              club={selectedClub}
              onBack={handleBackToDashboard}
            />
          </>
        );

      case 'whatsapp':
        return (
          <>
            <StatusBar style="light" backgroundColor="#005AA9" />
            <WhatsAppScreen
              user={user}
              club={selectedClub}
              onBack={handleBackToDashboard}
            />
          </>
        );

      case 'clubs':
        return (
          <>
            <StatusBar style="light" backgroundColor="#005AA9" />
            <ClubsScreen
              onBack={handleBackToDashboard}
            />
          </>
        );

      case 'profile':
        return (
          <>
            <StatusBar style="light" backgroundColor="#005AA9" />
            <ProfileScreen
              user={user}
              club={selectedClub}
              onBack={handleBackToDashboard}
            />
          </>
        );

      case 'settings':
        return (
          <>
            <StatusBar style="light" backgroundColor="#005AA9" />
            <SettingsScreen
              user={user}
              club={selectedClub}
              onBack={handleBackToDashboard}
              onLogout={handleLogout}
            />
          </>
        );

      default:
        return (
          <>
            <StatusBar style="light" backgroundColor="#005AA9" />
            <Dashboard
              user={user}
              club={selectedClub}
              onLogout={handleLogout}
              onNavigate={handleNavigation}
            />
          </>
        );
    }
  }

  // Écran par défaut (ne devrait pas arriver)
  return (
    <View style={styles.errorContainer}>
      <StatusBar style="light" backgroundColor="#005AA9" />
      <Text style={styles.errorText}>Erreur de navigation</Text>
      <Text style={styles.errorSubtext}>
        État inattendu de l'application
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#005AA9',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  loadingSubtext: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dc3545',
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
    textAlign: 'center',
  },
});
