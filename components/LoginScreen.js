import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../services/ApiService';

export const LoginScreen = ({
  clubs,
  loading,
  onLogin,
  onLoadClubs,
  onNavigateToRegister,
}) => {
  // Logs de débogage pour les clubs
  console.log('🔍 LoginScreen - Props reçues:');
  console.log('📊 clubs:', clubs);
  console.log('📊 loading:', loading);
  console.log('📊 Nombre de clubs:', clubs?.length || 0);
  console.log('📊 Type de clubs:', typeof clubs);
  console.log('📊 Est un tableau?', Array.isArray(clubs));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedClubId, setSelectedClubId] = useState('');
  const [showClubModal, setShowClubModal] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const apiService = new ApiService();

  const handleLogin = async () => {
    if (!email || !password || !selectedClubId) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoginLoading(true);
      const loginData = { email, password, clubId: selectedClubId };
      const userData = await apiService.login(loginData);
      
      const selectedClub = clubs.find(c => c.id === selectedClubId);
      if (selectedClub) {
        onLogin(userData, selectedClub);
        Alert.alert('Succès', 'Connexion réussie !');
      } else {
        throw new Error('Club sélectionné introuvable');
      }
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Erreur de connexion');
    } finally {
      setLoginLoading(false);
    }
  };

  const renderClubSelector = () => (
    <View>
      <TouchableOpacity
        style={styles.clubSelector}
        onPress={() => setShowClubModal(true)}
      >
        <Text style={styles.clubSelectorText}>
          {selectedClubId 
            ? clubs.find(c => c.id === selectedClubId)?.name || 'Sélectionner un club'
            : 'Sélectionner un club'
          }
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>
      
      {/* Bouton de test pour forcer le rechargement */}
      <TouchableOpacity
        style={styles.testButton}
        onPress={() => {
          console.log('🧪 Test de rechargement des clubs...');
          onLoadClubs();
        }}
      >
        <Text style={styles.testButtonText}>🔄 Recharger les clubs</Text>
      </TouchableOpacity>
    </View>
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
            {(() => {
              console.log('🔍 Rendu modal - État actuel:');
              console.log('📊 loading:', loading);
              console.log('📊 clubs:', clubs);
              console.log('📊 clubs.length:', clubs?.length);
              
              if (loading) {
                console.log('⏳ Affichage du loader...');
                return (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#005AA9" />
                    <Text style={styles.loadingText}>Chargement des clubs...</Text>
                  </View>
                );
              } else if (clubs && clubs.length > 0) {
                console.log('✅ Affichage des clubs:', clubs.length);
                return clubs.map((club) => (
                <TouchableOpacity
                  key={club.id}
                  style={styles.clubItem}
                  onPress={() => {
                    setSelectedClubId(club.id);
                    setShowClubModal(false);
                  }}
                >
                  <Text style={styles.clubItemText}>{club.name}</Text>
                  <Text style={styles.clubItemSubtext}>{club.city || 'Ville non spécifiée'}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noClubsContainer}>
                <Ionicons name="alert-circle" size={48} color="#FF9800" />
                <Text style={styles.noClubsText}>Aucun club disponible</Text>
                <Text style={styles.noClubsSubtext}>
                  Vérifiez votre connexion ou contactez l'administrateur
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={onLoadClubs}
                >
                  <Ionicons name="refresh" size={16} color="white" />
                  <Text style={styles.retryButtonText}>Réessayer</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Rotary Club Mobile</Text>
          <Text style={styles.subtitle}>Connexion</Text>
        </View>

        {/* Formulaire */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {renderClubSelector()}

          <TouchableOpacity
            style={[styles.loginButton, loginLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loginLoading}
          >
            {loginLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={onNavigateToRegister}
          >
            <Text style={styles.registerButtonText}>
              Pas encore de compte ? S'inscrire
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bouton de rechargement des clubs */}
        <TouchableOpacity
          style={styles.reloadButton}
          onPress={onLoadClubs}
          disabled={loading}
        >
          <Ionicons name="refresh" size={20} color="#005AA9" />
          <Text style={styles.reloadButtonText}>
            {loading ? 'Chargement...' : 'Recharger les clubs'}
          </Text>
        </TouchableOpacity>
      </View>

      {renderClubModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#005AA9',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    opacity: 0.8,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  clubSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 50,
  },
  clubSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#005AA9',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
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
  registerButton: {
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#005AA9',
    fontSize: 14,
  },
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
  },
  reloadButtonText: {
    color: '#005AA9',
    fontSize: 14,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: '90%',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  clubItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  clubItemSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  noClubsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noClubsText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  noClubsSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#005AA9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  testButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
