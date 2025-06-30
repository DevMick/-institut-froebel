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
import { Club, User, LoginData } from '../types';
import { ApiService } from '../services/ApiService';

interface LoginScreenProps {
  clubs: Club[];
  loading: boolean;
  onLogin: (user: User, club: Club) => void;
  onLoadClubs: () => void;
  onNavigateToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  clubs,
  loading,
  onLogin,
  onLoadClubs,
  onNavigateToRegister,
}) => {
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
      const loginData: LoginData = { email, password, clubId: selectedClubId };
      const userData = await apiService.login(loginData);
      
      const selectedClub = clubs.find(c => c.id === selectedClubId);
      if (selectedClub) {
        onLogin(userData, selectedClub);
        Alert.alert('Succès', 'Connexion réussie !');
      } else {
        throw new Error('Club sélectionné introuvable');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur de connexion');
    } finally {
      setLoginLoading(false);
    }
  };

  const renderClubSelector = () => (
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

  return (
    <SafeAreaView style={styles.container}>
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
            style={[styles.loginButton, (loading || loginLoading) && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading || loginLoading}
          >
            {(loading || loginLoading) ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerSection}>
            <Text style={styles.registerText}>Pas encore membre ? </Text>
            <TouchableOpacity onPress={() => onNavigateToRegister()}>
              <Text style={styles.registerLink}>Créer un compte</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {renderClubModal()}
    </SafeAreaView>
  );
};

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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#005AA9',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
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
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  registerLink: {
    color: '#005AA9',
    fontSize: 14,
    fontWeight: 'bold',
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
});
