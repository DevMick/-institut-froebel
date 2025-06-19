import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User, Club } from '../types';

interface SettingsScreenProps {
  user: User;
  club: Club;
  onBack: () => void;
  onLogout: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  user, 
  club, 
  onBack, 
  onLogout 
}) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'À propos',
      'Rotary Club Mobile v1.0.0\n\nApplication mobile pour la gestion des clubs Rotary.\n\nDéveloppé avec React Native et Expo.',
      [{ text: 'OK' }]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Support',
      'Pour obtenir de l\'aide ou signaler un problème :\n\n• Email: support@rotaryclub.com\n• Téléphone: +225 XX XX XX XX\n\nNous vous répondrons dans les plus brefs délais.',
      [{ text: 'OK' }]
    );
  };

  const settingsSections = [
    {
      title: 'Préférences',
      items: [
        {
          id: 'notifications',
          label: 'Notifications',
          subtitle: 'Recevoir les notifications push',
          icon: 'notifications',
          type: 'switch',
          value: notifications,
          onToggle: setNotifications,
        },
        {
          id: 'darkMode',
          label: 'Mode sombre',
          subtitle: 'Interface en mode sombre',
          icon: 'moon',
          type: 'switch',
          value: darkMode,
          onToggle: setDarkMode,
        },
        {
          id: 'autoSync',
          label: 'Synchronisation auto',
          subtitle: 'Synchroniser automatiquement les données',
          icon: 'sync',
          type: 'switch',
          value: autoSync,
          onToggle: setAutoSync,
        },
      ],
    },
    {
      title: 'Données',
      items: [
        {
          id: 'cache',
          label: 'Vider le cache',
          subtitle: 'Supprimer les données temporaires',
          icon: 'trash',
          type: 'button',
          onPress: () => Alert.alert('Info', 'Fonctionnalité en développement'),
        },
        {
          id: 'export',
          label: 'Exporter les données',
          subtitle: 'Sauvegarder vos données',
          icon: 'download',
          type: 'button',
          onPress: () => Alert.alert('Info', 'Fonctionnalité en développement'),
        },
      ],
    },
    {
      title: 'Compte',
      items: [
        {
          id: 'profile',
          label: 'Modifier le profil',
          subtitle: 'Changer vos informations personnelles',
          icon: 'person',
          type: 'button',
          onPress: () => Alert.alert('Info', 'Fonctionnalité en développement'),
        },
        {
          id: 'password',
          label: 'Changer le mot de passe',
          subtitle: 'Modifier votre mot de passe',
          icon: 'key',
          type: 'button',
          onPress: () => Alert.alert('Info', 'Fonctionnalité en développement'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          label: 'Aide',
          subtitle: 'Guide d\'utilisation et FAQ',
          icon: 'help-circle',
          type: 'button',
          onPress: handleSupport,
        },
        {
          id: 'about',
          label: 'À propos',
          subtitle: 'Informations sur l\'application',
          icon: 'information-circle',
          type: 'button',
          onPress: handleAbout,
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={item.type === 'switch'}
    >
      <View style={styles.itemIcon}>
        <Ionicons name={item.icon as any} size={20} color="#005AA9" />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemLabel}>{item.label}</Text>
        <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
      </View>
      {item.type === 'switch' ? (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: '#767577', true: '#005AA9' }}
          thumbColor={item.value ? '#ffffff' : '#f4f3f4'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      )}
    </TouchableOpacity>
  );

  const renderSection = (section: any) => (
    <View key={section.title} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.items.map(renderSettingItem)}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Paramètres</Text>
          <Text style={styles.subtitle}>{user.fullName}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.fullName}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userClub}>{club.name}</Text>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        {settingsSections.map(renderSection)}

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.versionSubtext}>Rotary Club Mobile</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#005AA9',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#005AA9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userClub: {
    fontSize: 12,
    color: '#005AA9',
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  logoutSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  versionSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});
