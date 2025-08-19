import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const Dashboard = ({
  user,
  club,
  onLogout,
  onNavigate,
}) => {
  const menuItems = [
    {
      id: 'members',
      title: 'Membres',
      icon: 'people',
      color: '#4CAF50',
      description: 'Gérer les membres du club',
    },
    {
      id: 'reunions',
      title: 'Réunions',
      icon: 'calendar',
      color: '#2196F3',
      description: 'Planifier et gérer les réunions',
    },
    {
      id: 'cotisations',
      title: 'Cotisations',
      icon: 'card',
      color: '#FF9800',
      description: 'Suivre les cotisations',
    },
    {
      id: 'email',
      title: 'Email',
      icon: 'mail',
      color: '#9C27B0',
      description: 'Envoyer des emails',
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      icon: 'chatbubbles',
      color: '#25D366',
      description: 'Envoyer des messages WhatsApp',
    },
    {
      id: 'clubs',
      title: 'Clubs',
      icon: 'business',
      color: '#607D8B',
      description: 'Voir tous les clubs',
    },
    {
      id: 'profile',
      title: 'Profil',
      icon: 'person',
      color: '#795548',
      description: 'Gérer votre profil',
    },
    {
      id: 'settings',
      title: 'Paramètres',
      icon: 'settings',
      color: '#757575',
      description: 'Configurer l\'application',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Bienvenue,</Text>
            <Text style={styles.userName}>{user?.fullName || user?.firstName || 'Utilisateur'}</Text>
            <Text style={styles.clubName}>{club?.name}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Grid */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => onNavigate(item.id)}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={24} color="white" />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </TouchableOpacity>
          ))}
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
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    color: 'white',
    fontSize: 16,
    opacity: 0.8,
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 2,
  },
  clubName: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
    marginTop: 2,
  },
  logoutButton: {
    padding: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  menuDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});
