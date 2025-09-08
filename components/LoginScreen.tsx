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
  StatusBar,
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
  const [showPassword, setShowPassword] = useState(false);

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
        Alert.alert('✅ Succès', 'Connexion réussie !');
      } else {
        throw new Error('Club sélectionné introuvable');
      }
    } catch (error: any) {
      Alert.alert('❌ Erreur', error.message || 'Erreur de connexion');
    } finally {
      setLoginLoading(false);
    }
  };

  const renderClubSelector = () => (
    <TouchableOpacity
      style={styles.clubSelector}
      onPress={() => setShowClubModal(true)}
      activeOpacity={0.7}
    >
      <View style={styles.clubSelectorContent}>
        <Ionicons name="business" size={20} color="#005AA9" style={styles.clubIcon} />
        <Text style={styles.clubSelectorText}>
          {selectedClubId 
            ? clubs.find(c => c.id === selectedClubId)?.name || 'Sélectionner un club'
            : 'Sélectionner un club'
          }
        </Text>
      </View>
      <Ionicons name="chevron-down" size={20} color="#005AA9" />
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
            <TouchableOpacity 
              onPress={() => setShowClubModal(false)}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.clubList} showsVerticalScrollIndicator={false}>
            {clubs.map((club) => (
              <TouchableOpacity
                key={club.id}
                style={styles.clubItem}
                onPress={() => {
                  setSelectedClubId(club.id);
                  setShowClubModal(false);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.clubItemContent}>
                  <View style={styles.clubIconContainer}>
                    <Ionicons name="business" size={20} color="#005AA9" />
                  </View>
                  <View style={styles.clubInfo}>
                    <Text style={styles.clubName}>{club.name}</Text>
                    <Text style={styles.clubCity}>{club.city}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      <View style={styles.content}>
        {/* Header avec Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Ionicons name="people-circle" size={60} color="white" />
            </View>
          </View>
          <Text style={styles.title}>Rotary Club Mobile</Text>
          <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
        </View>

        {/* Formulaire */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIconContainer}>
              <Ionicons name="mail" size={20} color="#005AA9" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Adresse email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#9E9E9E"
            />
          </View>
          
          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIconContainer}>
              <Ionicons name="lock-closed" size={20} color="#005AA9" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#9E9E9E"
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#9E9E9E" 
              />
            </TouchableOpacity>
          </View>

          {/* Club Selector */}
          {renderClubSelector()}

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              (loading || loginLoading) && styles.loginButtonDisabled
            ]}
            onPress={handleLogin}
            disabled={loading || loginLoading}
            activeOpacity={0.8}
          >
            {(loading || loginLoading) ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <View style={styles.loginButtonContent}>
                <Ionicons name="log-in" size={20} color="white" />
                <Text style={styles.loginButtonText}>Se connecter</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Register Section */}
          <View style={styles.registerSection}>
            <Text style={styles.registerText}>Pas encore membre ? </Text>
            <TouchableOpacity onPress={() => onNavigateToRegister()} activeOpacity={0.7}>
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
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#005AA9',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#005AA9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputIconContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    paddingVertical: 16,
    paddingRight: 16,
  },
  passwordToggle: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  clubSelector: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  clubSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clubIcon: {
    marginRight: 12,
  },
  clubSelectorText: {
    fontSize: 16,
    color: '#2C3E50',
    flex: 1,
  },
  loginButton: {
    backgroundColor: '#005AA9',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#005AA9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#7F8C8D',
    fontSize: 14,
  },
  registerLink: {
    color: '#005AA9',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  closeButton: {
    padding: 4,
  },
  clubList: {
    maxHeight: 400,
  },
  clubItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  clubItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clubIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  clubCity: {
    fontSize: 14,
    color: '#7F8C8D',
  },
});
