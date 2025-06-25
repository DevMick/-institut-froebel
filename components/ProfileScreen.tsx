import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User, Club } from '../types';
import { ApiService } from '../services/ApiService';

interface ProfileScreenProps {
  user: User;
  club: Club;
  onBack: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, club, onBack }) => {
  const [clubDetails, setClubDetails] = useState<Club | null>(null);
  const [loading, setLoading] = useState(false);
  const apiService = new ApiService();

  useEffect(() => {
    loadClubDetails();
  }, [club.id]);

  const loadClubDetails = async () => {
    try {
      setLoading(true);
      // Utiliser les détails du club passé en props ou charger depuis l'API si nécessaire
      setClubDetails(club);
    } catch (error) {
      console.error('Erreur chargement détails club:', error);
      setClubDetails(club); // Fallback sur les données existantes
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'Non définie';
    return timeString;
  };

  const handleCall = (phoneNumber?: string) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleEmail = (email?: string) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  const currentClub = clubDetails || club;

  const profileSections = [
    {
      title: 'Informations personnelles',
      items: [
        { label: 'Nom complet', value: user.fullName, icon: 'person', color: '#005AA9' },
        { label: 'Prénom', value: user.firstName, icon: 'person-outline', color: '#005AA9' },
        { label: 'Nom', value: user.lastName, icon: 'person-outline', color: '#005AA9' },
        { label: 'Email', value: user.email, icon: 'mail', color: '#34C759', action: () => handleEmail(user.email) },
      ],
    },
    {
      title: 'Informations du club',
      items: [
        { label: 'Nom du club', value: currentClub.name, icon: 'business', color: '#005AA9' },
        { label: 'Numéro du club', value: currentClub.numeroClub?.toString(), icon: 'business', color: '#005AA9' },
        { label: 'Date de création', value: currentClub.dateCreation, icon: 'calendar', color: '#005AA9' },
        { label: 'Parrainé par', value: currentClub.parrainePar, icon: 'people', color: '#005AA9' },
      ],
    },
    {
      title: 'Réunions du club',
      items: [
        { label: 'Jour de réunion', value: currentClub.jourReunion, icon: 'calendar', color: '#005AA9' },
        { label: 'Heure de réunion', value: formatTime(currentClub.heureReunion), icon: 'time', color: '#34C759' },
        { label: 'Fréquence', value: currentClub.frequence, icon: 'repeat', color: '#005AA9' },
        { label: 'Lieu de réunion', value: currentClub.lieuReunion, icon: 'location', color: '#FF9500' },
      ],
    },
    {
      title: 'Contact du club',
      items: [
        { label: 'Téléphone', value: currentClub.numeroTelephone, icon: 'call', color: '#34C759', action: () => handleCall(currentClub.numeroTelephone) },
        { label: 'Email', value: currentClub.email, icon: 'mail', color: '#34C759', action: () => handleEmail(currentClub.email) },
        { label: 'Adresse', value: currentClub.adresse, icon: 'home', color: '#005AA9' },
      ],
    },
  ];

  const renderProfileItem = (item: any) => (
    <TouchableOpacity
      key={item.label}
      style={styles.profileItem}
      onPress={item.action}
      disabled={!item.action}
    >
      <View style={styles.itemIcon}>
        <Ionicons name={item.icon as any} size={20} color={item.color || "#005AA9"} />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemLabel}>{item.label}</Text>
        <Text style={[styles.itemValue, item.action && styles.clickableValue]}>
          {item.value || 'Non renseigné'}
        </Text>
      </View>
      {item.action && (
        <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
      )}
    </TouchableOpacity>
  );

  const renderSection = (section: any) => (
    <View key={section.title} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.items.map(renderProfileItem)}
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
          <Text style={styles.title}>Mon Profil</Text>
          <Text style={styles.subtitle}>{user.fullName}</Text>
        </View>
        {loading && (
          <ActivityIndicator size="small" color="white" style={{ marginLeft: 10 }} />
        )}
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Header Card */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </Text>
            </View>
          </View>
          <Text style={styles.profileName}>{user.fullName}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <View style={styles.clubBadge}>
            <Ionicons name="business" size={16} color="white" />
            <Text style={styles.clubBadgeText}>{currentClub.name}</Text>
          </View>
          {currentClub.numeroClub && (
            <Text style={styles.clubNumber}>N° {currentClub.numeroClub}</Text>
          )}
        </View>

        {/* Profile Sections */}
        {profileSections.map(renderSection)}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="create" size={20} color="#005AA9" />
            <Text style={styles.actionText}>Modifier le profil</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="key" size={20} color="#005AA9" />
            <Text style={styles.actionText}>Changer le mot de passe</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="notifications" size={20} color="#005AA9" />
            <Text style={styles.actionText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Rotary Club Mobile v1.0.0</Text>
          <Text style={styles.appInfoSubtext}>Développé pour les clubs Rotary</Text>
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
  profileHeader: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#005AA9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  clubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#005AA9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  clubBadgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  clubNumber: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
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
  profileItem: {
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
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  itemValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  clickableValue: {
    color: '#005AA9',
    textDecorationLine: 'underline',
  },
  actionsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appInfoText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  appInfoSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});
