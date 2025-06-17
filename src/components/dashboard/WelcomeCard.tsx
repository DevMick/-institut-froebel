/**
 * Welcome Card Component - Rotary Club Mobile
 * Widget greeting personnalisé avec photo profil et quick stats
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { THEME } from '../../config/theme';
import { useAuth, useClub } from '../../hooks/redux';

interface WelcomeCardProps {
  onProfilePress?: () => void;
  style?: object;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({
  onProfilePress,
  style,
}) => {
  const { user } = useAuth();
  const { currentClub } = useClub();

  // Générer le greeting basé sur l'heure
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }, []);

  // Générer les initiales pour le fallback
  const initials = useMemo(() => {
    if (!user) return 'RC';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }, [user]);

  // Formater la dernière connexion
  const formatLastLogin = (date: Date | null): string => {
    if (!date) return 'Première connexion';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return 'À l\'instant';
    if (hours < 24) return `Il y a ${hours}h`;
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  // Render photo de profil ou initiales
  const renderProfilePhoto = () => {
    if (user?.profilePhoto) {
      return (
        <Image
          source={{ uri: user.profilePhoto }}
          style={styles.profilePhoto}
          resizeMode="cover"
        />
      );
    }

    return (
      <View style={styles.profilePhotoFallback}>
        <Text style={styles.initialsText}>{initials}</Text>
      </View>
    );
  };

  // Render quick stats
  const renderQuickStats = () => (
    <View style={styles.quickStats}>
      <View style={styles.statItem}>
        <Icon name="event" size={16} color={THEME.colors.PRIMARY} />
        <Text style={styles.statValue}>12</Text>
        <Text style={styles.statLabel}>Réunions</Text>
      </View>
      
      <View style={styles.statDivider} />
      
      <View style={styles.statItem}>
        <Icon name="payment" size={16} color={THEME.colors.SUCCESS} />
        <Text style={styles.statValue}>À jour</Text>
        <Text style={styles.statLabel}>Cotisations</Text>
      </View>
      
      <View style={styles.statDivider} />
      
      <View style={styles.statItem}>
        <Icon name="star" size={16} color={THEME.colors.SECONDARY} />
        <Text style={styles.statValue}>85%</Text>
        <Text style={styles.statLabel}>Présence</Text>
      </View>
    </View>
  );

  if (!user) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onProfilePress}
      activeOpacity={0.7}
      accessibilityLabel={`Profil de ${user.firstName} ${user.lastName}`}
      accessibilityRole="button"
    >
      {/* Header avec photo et greeting */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          {renderProfilePhoto()}
          
          <View style={styles.greetingSection}>
            <Text style={styles.greetingText}>
              {greeting}, {user.firstName} !
            </Text>
            
            <View style={styles.clubInfo}>
              <Icon name="business" size={14} color={THEME.colors.GRAY_600} />
              <Text style={styles.clubName} numberOfLines={1}>
                {currentClub?.name || 'Rotary Club'}
              </Text>
            </View>
            
            <View style={styles.roleInfo}>
              <Icon name="badge" size={14} color={THEME.colors.GRAY_600} />
              <Text style={styles.roleText}>
                {user.role || 'Membre'}
              </Text>
            </View>
          </View>
        </View>

        {/* Last login indicator */}
        <View style={styles.lastLoginContainer}>
          <Icon name="schedule" size={12} color={THEME.colors.GRAY_500} />
          <Text style={styles.lastLoginText}>
            {formatLastLogin(user.lastLogin)}
          </Text>
        </View>
      </View>

      {/* Quick Stats */}
      {renderQuickStats()}

      {/* Action indicator */}
      <View style={styles.actionIndicator}>
        <Icon name="chevron-right" size={20} color={THEME.colors.GRAY_400} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.SURFACE,
    borderRadius: THEME.radius.LG,
    padding: THEME.spacing.LG,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: THEME.colors.OUTLINE_VARIANT,
  },

  loadingContainer: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.LG,
  },

  loadingText: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_500,
  },

  header: {
    marginBottom: THEME.spacing.LG,
  },

  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.SM,
  },

  profilePhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: THEME.spacing.MD,
    borderWidth: 2,
    borderColor: THEME.colors.PRIMARY,
  },

  profilePhotoFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.spacing.MD,
  },

  initialsText: {
    fontSize: THEME.typography.FONT_SIZE.LG,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.WHITE,
  },

  greetingSection: {
    flex: 1,
    justifyContent: 'center',
  },

  greetingText: {
    fontSize: THEME.typography.FONT_SIZE.LG,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_SURFACE,
    marginBottom: THEME.spacing.XS,
  },

  clubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.XS,
  },

  clubName: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_600,
    marginLeft: THEME.spacing.XS,
    flex: 1,
  },

  roleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  roleText: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_600,
    marginLeft: THEME.spacing.XS,
  },

  lastLoginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },

  lastLoginText: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    color: THEME.colors.GRAY_500,
    marginLeft: THEME.spacing.XS,
  },

  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: THEME.colors.PRIMARY_CONTAINER,
    borderRadius: THEME.radius.MD,
    paddingVertical: THEME.spacing.MD,
    paddingHorizontal: THEME.spacing.SM,
    marginBottom: THEME.spacing.SM,
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },

  statValue: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_PRIMARY_CONTAINER,
    marginTop: THEME.spacing.XS,
  },

  statLabel: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    color: THEME.colors.ON_PRIMARY_CONTAINER,
    marginTop: 2,
  },

  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: THEME.colors.OUTLINE_VARIANT,
    opacity: 0.5,
  },

  actionIndicator: {
    position: 'absolute',
    top: THEME.spacing.MD,
    right: THEME.spacing.MD,
  },
});

export default WelcomeCard;
