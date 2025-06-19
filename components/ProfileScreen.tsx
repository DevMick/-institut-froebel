import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User, Club } from '../types';

interface ProfileScreenProps {
  user: User;
  club: Club;
  onBack: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, club, onBack }) => {
  const profileSections = [
    {
      title: 'Informations personnelles',
      items: [
        { label: 'Nom complet', value: user.fullName, icon: 'person' },
        { label: 'Email', value: user.email, icon: 'mail' },
        { label: 'Prénom', value: user.firstName, icon: 'person-outline' },
        { label: 'Nom', value: user.lastName, icon: 'person-outline' },
      ],
    },
    {
      title: 'Informations du club',
      items: [
        { label: 'Club', value: club.name, icon: 'business' },
        { label: 'Ville', value: club.city, icon: 'location' },
        { label: 'Pays', value: club.country, icon: 'flag' },
        { label: 'Fondé en', value: new Date(club.foundedDate).getFullYear().toString(), icon: 'calendar' },
      ],
    },
    {
      title: 'Contact du club',
      items: [
        { label: 'Téléphone', value: club.phoneNumber, icon: 'call' },
        { label: 'Email', value: club.email, icon: 'mail' },
        { label: 'Site web', value: club.website, icon: 'globe' },
        { label: 'Adresse', value: `${club.address}, ${club.city}`, icon: 'location-outline' },
      ],
    },
  ];

  const renderProfileItem = (item: any) => (
    <View key={item.label} style={styles.profileItem}>
      <View style={styles.itemIcon}>
        <Ionicons name={item.icon as any} size={20} color="#005AA9" />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemLabel}>{item.label}</Text>
        <Text style={styles.itemValue}>{item.value || 'Non renseigné'}</Text>
      </View>
    </View>
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
            <Text style={styles.clubBadgeText}>{club.name}</Text>
          </View>
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
