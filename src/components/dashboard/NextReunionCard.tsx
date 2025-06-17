/**
 * Next Reunion Card Component - Rotary Club Mobile
 * Widget prochaine réunion avec countdown, QR et weather
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { THEME } from '../../config/theme';
import { useReunion } from '../../hooks/redux';

interface NextReunionCardProps {
  onReunionPress?: (reunionId: string) => void;
  onConfirmPress?: (reunionId: string) => void;
  onQRPress?: (reunionId: string) => void;
  style?: object;
}

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const NextReunionCard: React.FC<NextReunionCardProps> = ({
  onReunionPress,
  onConfirmPress,
  onQRPress,
  style,
}) => {
  const { nextReunion, loading } = useReunion();
  
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [reminderEnabled, setReminderEnabled] = useState(true);

  // Calculer le countdown en temps réel
  useEffect(() => {
    if (!nextReunion) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const reunionTime = new Date(nextReunion.date).getTime();
      const difference = reunionTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextReunion]);

  // Formater la date et l'heure
  const formattedDateTime = useMemo(() => {
    if (!nextReunion) return { date: '', time: '' };

    const reunionDate = new Date(nextReunion.date);
    const date = reunionDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    const time = reunionDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return { date, time };
  }, [nextReunion]);

  // Simuler les données météo
  const weatherData = useMemo(() => ({
    temperature: 22,
    condition: 'Ensoleillé',
    icon: 'wb-sunny',
  }), []);

  const handleConfirmPress = () => {
    if (!nextReunion) return;

    Alert.alert(
      'Confirmer votre présence',
      `Voulez-vous confirmer votre présence à la réunion "${nextReunion.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => {
            onConfirmPress?.(nextReunion.id);
          },
        },
      ]
    );
  };

  const handleQRPress = () => {
    if (!nextReunion) return;
    onQRPress?.(nextReunion.id);
  };

  const handleReminderToggle = (value: boolean) => {
    setReminderEnabled(value);
    // TODO: Implémenter la logique de notification
  };

  // Render countdown
  const renderCountdown = () => {
    const { days, hours, minutes, seconds } = countdown;
    
    return (
      <View style={styles.countdownContainer}>
        <Text style={styles.countdownLabel}>Temps restant</Text>
        <View style={styles.countdownValues}>
          <View style={styles.countdownItem}>
            <Text style={styles.countdownNumber}>{days}</Text>
            <Text style={styles.countdownUnit}>j</Text>
          </View>
          <Text style={styles.countdownSeparator}>:</Text>
          <View style={styles.countdownItem}>
            <Text style={styles.countdownNumber}>{hours.toString().padStart(2, '0')}</Text>
            <Text style={styles.countdownUnit}>h</Text>
          </View>
          <Text style={styles.countdownSeparator}>:</Text>
          <View style={styles.countdownItem}>
            <Text style={styles.countdownNumber}>{minutes.toString().padStart(2, '0')}</Text>
            <Text style={styles.countdownUnit}>m</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render weather info
  const renderWeather = () => (
    <View style={styles.weatherContainer}>
      <Icon name={weatherData.icon} size={20} color={THEME.colors.SECONDARY} />
      <Text style={styles.weatherText}>
        {weatherData.temperature}°C • {weatherData.condition}
      </Text>
    </View>
  );

  // Render actions
  const renderActions = () => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={[
          styles.confirmButton,
          nextReunion?.confirmed && styles.confirmedButton,
        ]}
        onPress={handleConfirmPress}
        accessibilityLabel={
          nextReunion?.confirmed 
            ? 'Présence confirmée' 
            : 'Confirmer votre présence'
        }
      >
        <Icon
          name={nextReunion?.confirmed ? 'check-circle' : 'check-circle-outline'}
          size={20}
          color={nextReunion?.confirmed ? THEME.colors.WHITE : THEME.colors.PRIMARY}
        />
        <Text style={[
          styles.confirmButtonText,
          nextReunion?.confirmed && styles.confirmedButtonText,
        ]}>
          {nextReunion?.confirmed ? 'Confirmé' : 'Confirmer'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.qrButton}
        onPress={handleQRPress}
        accessibilityLabel="Scanner QR Code"
      >
        <Icon name="qr-code" size={20} color={THEME.colors.ON_SURFACE} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement de la prochaine réunion...</Text>
        </View>
      </View>
    );
  }

  if (!nextReunion) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.emptyContainer}>
          <Icon name="event-available" size={48} color={THEME.colors.GRAY_400} />
          <Text style={styles.emptyTitle}>Aucune réunion prévue</Text>
          <Text style={styles.emptyText}>
            La prochaine réunion n'est pas encore planifiée.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onReunionPress?.(nextReunion.id)}
      activeOpacity={0.7}
      accessibilityLabel={`Prochaine réunion: ${nextReunion.title}`}
      accessibilityRole="button"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title} numberOfLines={2}>
            {nextReunion.title}
          </Text>
          <Text style={styles.dateTime}>
            {formattedDateTime.date} • {formattedDateTime.time}
          </Text>
        </View>
        
        <View style={styles.statusIndicator}>
          <Icon
            name={nextReunion.confirmed ? 'check-circle' : 'schedule'}
            size={24}
            color={nextReunion.confirmed ? THEME.colors.SUCCESS : THEME.colors.WARNING}
          />
        </View>
      </View>

      {/* Location */}
      <View style={styles.locationContainer}>
        <Icon name="place" size={16} color={THEME.colors.GRAY_600} />
        <Text style={styles.locationText} numberOfLines={1}>
          {nextReunion.location}
        </Text>
      </View>

      {/* Countdown */}
      {renderCountdown()}

      {/* Weather */}
      {renderWeather()}

      {/* Reminder Toggle */}
      <View style={styles.reminderContainer}>
        <View style={styles.reminderInfo}>
          <Icon name="notifications" size={16} color={THEME.colors.GRAY_600} />
          <Text style={styles.reminderText}>Rappel de notification</Text>
        </View>
        <Switch
          value={reminderEnabled}
          onValueChange={handleReminderToggle}
          trackColor={{
            false: THEME.colors.GRAY_300,
            true: THEME.colors.PRIMARY_CONTAINER,
          }}
          thumbColor={reminderEnabled ? THEME.colors.PRIMARY : THEME.colors.GRAY_500}
        />
      </View>

      {/* Actions */}
      {renderActions()}
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
    paddingVertical: THEME.spacing.XXL,
  },

  loadingText: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_500,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.XXL,
  },

  emptyTitle: {
    fontSize: THEME.typography.FONT_SIZE.MD,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.GRAY_600,
    marginTop: THEME.spacing.MD,
    marginBottom: THEME.spacing.SM,
  },

  emptyText: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_500,
    textAlign: 'center',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.MD,
  },

  titleSection: {
    flex: 1,
  },

  title: {
    fontSize: THEME.typography.FONT_SIZE.LG,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_SURFACE,
    marginBottom: THEME.spacing.XS,
  },

  dateTime: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.PRIMARY,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
  },

  statusIndicator: {
    marginLeft: THEME.spacing.SM,
  },

  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.LG,
  },

  locationText: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_600,
    marginLeft: THEME.spacing.XS,
    flex: 1,
  },

  countdownContainer: {
    backgroundColor: THEME.colors.PRIMARY_CONTAINER,
    borderRadius: THEME.radius.MD,
    padding: THEME.spacing.MD,
    marginBottom: THEME.spacing.MD,
    alignItems: 'center',
  },

  countdownLabel: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    color: THEME.colors.ON_PRIMARY_CONTAINER,
    marginBottom: THEME.spacing.SM,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  countdownValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  countdownItem: {
    alignItems: 'center',
    minWidth: 40,
  },

  countdownNumber: {
    fontSize: THEME.typography.FONT_SIZE.XL,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_PRIMARY_CONTAINER,
  },

  countdownUnit: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    color: THEME.colors.ON_PRIMARY_CONTAINER,
    marginTop: -2,
  },

  countdownSeparator: {
    fontSize: THEME.typography.FONT_SIZE.LG,
    color: THEME.colors.ON_PRIMARY_CONTAINER,
    marginHorizontal: THEME.spacing.SM,
  },

  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.MD,
  },

  weatherText: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_600,
    marginLeft: THEME.spacing.XS,
  },

  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.LG,
  },

  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  reminderText: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_600,
    marginLeft: THEME.spacing.XS,
  },

  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.PRIMARY_CONTAINER,
    borderRadius: THEME.radius.MD,
    paddingVertical: THEME.spacing.SM,
    paddingHorizontal: THEME.spacing.MD,
    marginRight: THEME.spacing.SM,
  },

  confirmedButton: {
    backgroundColor: THEME.colors.SUCCESS,
  },

  confirmButtonText: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
    color: THEME.colors.PRIMARY,
    marginLeft: THEME.spacing.XS,
  },

  confirmedButtonText: {
    color: THEME.colors.WHITE,
  },

  qrButton: {
    width: 44,
    height: 44,
    borderRadius: THEME.radius.MD,
    backgroundColor: THEME.colors.OUTLINE_VARIANT,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NextReunionCard;
