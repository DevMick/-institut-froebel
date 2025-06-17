/**
 * Biometric Button Component - Rotary Club Mobile
 * Composant bouton biométrie avec détection device et animations
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Platform,
  Alert,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { THEME } from '../../config/theme';

interface BiometricButtonProps {
  onPress: () => void;
  disabled?: boolean;
  style?: object;
  testID?: string;
}

type BiometricType = 'fingerprint' | 'face' | 'iris' | 'none';

export const BiometricButton: React.FC<BiometricButtonProps> = ({
  onPress,
  disabled = false,
  style,
  testID,
}) => {
  const [biometricType, setBiometricType] = useState<BiometricType>('none');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  // Animation pulse pendant l'authentification
  useEffect(() => {
    if (isAuthenticating) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
        pulseAnim.setValue(1);
      };
    }
  }, [isAuthenticating, pulseAnim]);

  const checkBiometricAvailability = async () => {
    try {
      // TODO: Implémenter la vérification réelle avec react-native-biometrics
      // const { available, biometryType } = await ReactNativeBiometrics.isSensorAvailable();
      
      // Simulation basée sur la plateforme
      if (Platform.OS === 'ios') {
        // Simulation: 70% chance d'avoir Face ID, 30% Touch ID
        const hasFaceID = Math.random() > 0.3;
        setBiometricType(hasFaceID ? 'face' : 'fingerprint');
        setIsAvailable(true);
      } else {
        // Android: principalement fingerprint
        setBiometricType('fingerprint');
        setIsAvailable(true);
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setBiometricType('none');
      setIsAvailable(false);
    }
  };

  const handlePress = async () => {
    if (disabled || !isAvailable || isAuthenticating) return;

    setIsAuthenticating(true);

    try {
      // TODO: Implémenter l'authentification biométrique réelle
      // const { success } = await ReactNativeBiometrics.simplePrompt({
      //   promptMessage: 'Authentifiez-vous pour vous connecter',
      //   cancelButtonText: 'Annuler',
      // });

      // Simulation de l'authentification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulation: 80% de succès
      const success = Math.random() > 0.2;
      
      if (success) {
        onPress();
      } else {
        throw new Error('Authentification échouée');
      }
    } catch (error) {
      Alert.alert(
        'Authentification échouée',
        'L\'authentification biométrique a échoué. Veuillez réessayer ou utiliser votre mot de passe.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getBiometricIcon = (): string => {
    switch (biometricType) {
      case 'face':
        return 'face';
      case 'fingerprint':
        return 'fingerprint';
      case 'iris':
        return 'visibility';
      default:
        return 'security';
    }
  };

  const getBiometricLabel = (): string => {
    switch (biometricType) {
      case 'face':
        return Platform.OS === 'ios' ? 'Face ID' : 'Reconnaissance faciale';
      case 'fingerprint':
        return Platform.OS === 'ios' ? 'Touch ID' : 'Empreinte digitale';
      case 'iris':
        return 'Reconnaissance iris';
      default:
        return 'Biométrie';
    }
  };

  if (!isAvailable) {
    return null; // Ne pas afficher le bouton si la biométrie n'est pas disponible
  }

  return (
    <Animated.View
      style={[
        { opacity: opacityAnim },
        style,
      ]}
    >
      <TouchableOpacity
        style={[
          styles.container,
          disabled && styles.disabled,
          isAuthenticating && styles.authenticating,
        ]}
        onPress={handlePress}
        disabled={disabled || isAuthenticating}
        accessibilityLabel={`Se connecter avec ${getBiometricLabel()}`}
        accessibilityRole="button"
        accessibilityState={{
          disabled: disabled || isAuthenticating,
          busy: isAuthenticating,
        }}
        testID={testID}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Icon
            name={getBiometricIcon()}
            size={32}
            color={
              disabled
                ? THEME.colors.GRAY_400
                : isAuthenticating
                ? THEME.colors.PRIMARY
                : THEME.colors.PRIMARY
            }
          />
        </Animated.View>

        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              disabled && styles.disabledText,
              isAuthenticating && styles.authenticatingText,
            ]}
          >
            {isAuthenticating ? 'Authentification...' : getBiometricLabel()}
          </Text>
          
          <Text
            style={[
              styles.subtitle,
              disabled && styles.disabledText,
            ]}
          >
            {isAuthenticating
              ? 'Veuillez vous authentifier'
              : 'Touchez pour vous connecter'
            }
          </Text>
        </View>

        {isAuthenticating && (
          <View style={styles.loadingIndicator}>
            <Animated.View
              style={[
                styles.loadingDot,
                { opacity: pulseAnim },
              ]}
            />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.SURFACE,
    borderRadius: THEME.radius.LG,
    padding: THEME.spacing.LG,
    borderWidth: 2,
    borderColor: THEME.colors.OUTLINE_VARIANT,
    minHeight: 72,
  },

  disabled: {
    backgroundColor: THEME.colors.GRAY_100,
    borderColor: THEME.colors.GRAY_300,
  },

  authenticating: {
    borderColor: THEME.colors.PRIMARY,
    backgroundColor: THEME.colors.PRIMARY_CONTAINER,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.colors.PRIMARY_CONTAINER,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.spacing.MD,
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: THEME.typography.FONT_SIZE.MD,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_SURFACE,
    marginBottom: THEME.spacing.XS,
  },

  subtitle: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_600,
    lineHeight: THEME.typography.LINE_HEIGHT.SM,
  },

  disabledText: {
    color: THEME.colors.GRAY_400,
  },

  authenticatingText: {
    color: THEME.colors.PRIMARY,
  },

  loadingIndicator: {
    marginLeft: THEME.spacing.SM,
  },

  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.PRIMARY,
  },
});

export default BiometricButton;
