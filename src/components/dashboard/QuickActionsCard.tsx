/**
 * Quick Actions Card Component - Rotary Club Mobile
 * Widget actions rapides 2x2 avec FAB style et haptic feedback
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HapticFeedback from 'react-native-haptic-feedback';
import { THEME } from '../../config/theme';

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  backgroundColor: string;
  onPress: () => void;
  badge?: number;
  disabled?: boolean;
}

interface QuickActionsCardProps {
  onScanQR?: () => void;
  onPayDues?: () => void;
  onContactOffice?: () => void;
  onViewCalendar?: () => void;
  style?: object;
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  onScanQR,
  onPayDues,
  onContactOffice,
  onViewCalendar,
  style,
}) => {
  // Configuration des actions rapides
  const quickActions: QuickAction[] = [
    {
      id: 'scan-qr',
      title: 'Scanner QR',
      icon: 'qr-code-scanner',
      color: THEME.colors.WHITE,
      backgroundColor: THEME.colors.PRIMARY,
      onPress: () => {
        HapticFeedback.trigger('impactMedium');
        onScanQR?.() || handleScanQR();
      },
    },
    {
      id: 'pay-dues',
      title: 'Payer dues',
      icon: 'payment',
      color: THEME.colors.WHITE,
      backgroundColor: THEME.colors.SUCCESS,
      onPress: () => {
        HapticFeedback.trigger('impactMedium');
        onPayDues?.() || handlePayDues();
      },
      badge: 1, // Indication qu'il y a des dues à payer
    },
    {
      id: 'contact-office',
      title: 'Contacter',
      icon: 'phone',
      color: THEME.colors.WHITE,
      backgroundColor: THEME.colors.SECONDARY,
      onPress: () => {
        HapticFeedback.trigger('impactMedium');
        onContactOffice?.() || handleContactOffice();
      },
    },
    {
      id: 'calendar',
      title: 'Calendrier',
      icon: 'calendar-today',
      color: THEME.colors.WHITE,
      backgroundColor: THEME.colors.INFO,
      onPress: () => {
        HapticFeedback.trigger('impactMedium');
        onViewCalendar?.() || handleViewCalendar();
      },
      badge: 3, // Nombre d'événements à venir
    },
  ];

  // Handlers par défaut
  const handleScanQR = () => {
    Alert.alert(
      'Scanner QR',
      'Ouvrir le scanner QR pour marquer votre présence ou accéder à des informations.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Ouvrir scanner', onPress: () => console.log('Open QR Scanner') },
      ]
    );
  };

  const handlePayDues = () => {
    Alert.alert(
      'Payer les cotisations',
      'Vous avez 1 cotisation en attente de paiement.',
      [
        { text: 'Plus tard', style: 'cancel' },
        { text: 'Payer maintenant', onPress: () => console.log('Navigate to payment') },
      ]
    );
  };

  const handleContactOffice = () => {
    Alert.alert(
      'Contacter le bureau',
      'Choisissez votre méthode de contact préférée.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Appeler', onPress: () => console.log('Call office') },
        { text: 'Email', onPress: () => console.log('Email office') },
      ]
    );
  };

  const handleViewCalendar = () => {
    Alert.alert(
      'Calendrier des événements',
      'Voir tous les événements et réunions à venir.',
      [
        { text: 'Fermer', style: 'cancel' },
        { text: 'Ouvrir calendrier', onPress: () => console.log('Open calendar') },
      ]
    );
  };

  // Render action button
  const renderActionButton = (action: QuickAction) => (
    <TouchableOpacity
      key={action.id}
      style={[
        styles.actionButton,
        { backgroundColor: action.backgroundColor },
        action.disabled && styles.disabledButton,
      ]}
      onPress={action.onPress}
      disabled={action.disabled}
      activeOpacity={0.8}
      accessibilityLabel={action.title}
      accessibilityRole="button"
      accessibilityState={{ disabled: action.disabled }}
    >
      {/* Badge */}
      {action.badge && action.badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {action.badge > 99 ? '99+' : action.badge.toString()}
          </Text>
        </View>
      )}

      {/* Icon */}
      <View style={styles.iconContainer}>
        <Icon
          name={action.icon}
          size={24}
          color={action.disabled ? THEME.colors.GRAY_400 : action.color}
        />
      </View>

      {/* Title */}
      <Text
        style={[
          styles.actionTitle,
          { color: action.disabled ? THEME.colors.GRAY_400 : action.color },
        ]}
        numberOfLines={2}
      >
        {action.title}
      </Text>

      {/* Ripple effect overlay */}
      <View style={styles.rippleOverlay} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name="flash-on" size={20} color={THEME.colors.PRIMARY} />
          <Text style={styles.title}>Actions rapides</Text>
        </View>
      </View>

      {/* Actions Grid */}
      <View style={styles.actionsGrid}>
        {quickActions.map(renderActionButton)}
      </View>

      {/* Footer hint */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Appuyez longuement pour plus d'options
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.SURFACE,
    borderRadius: THEME.radius.LG,
    padding: THEME.spacing.MD,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: THEME.colors.OUTLINE_VARIANT,
  },

  header: {
    marginBottom: THEME.spacing.MD,
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    fontSize: THEME.typography.FONT_SIZE.MD,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_SURFACE,
    marginLeft: THEME.spacing.XS,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.SM,
  },

  actionButton: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: THEME.radius.LG,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: THEME.spacing.SM,
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  disabledButton: {
    backgroundColor: THEME.colors.GRAY_200,
    elevation: 1,
    shadowOpacity: 0.1,
  },

  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: THEME.colors.ERROR,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 1,
  },

  badgeText: {
    color: THEME.colors.WHITE,
    fontSize: THEME.typography.FONT_SIZE.XS,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    textAlign: 'center',
  },

  iconContainer: {
    marginBottom: THEME.spacing.SM,
  },

  actionTitle: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
    textAlign: 'center',
    lineHeight: THEME.typography.LINE_HEIGHT.SM,
  },

  rippleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: THEME.radius.LG,
    backgroundColor: 'transparent',
  },

  footer: {
    alignItems: 'center',
    paddingTop: THEME.spacing.XS,
  },

  footerText: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    color: THEME.colors.GRAY_500,
    textAlign: 'center',
  },
});

export default QuickActionsCard;
