/**
 * LoadingSpinner Component - Rotary Club Mobile
 * Spinner simplifié pour Expo Snack
 */

import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { theme } from '../../theme';

interface LoadingSpinnerProps {
  /**
   * Taille du spinner
   * @default 'medium'
   */
  size?: 'small' | 'large';

  /**
   * Texte affiché sous le spinner
   */
  text?: string;

  /**
   * Visible ou non
   * @default true
   */
  visible?: boolean;

  /**
   * Styles personnalisés
   */
  style?: ViewStyle;
}

/**
 * Composant LoadingSpinner simplifié
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'small',
  text,
  visible = true,
  style,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator
        size={size}
        color={theme.colors.primary}
      />
      {text && (
        <Text style={styles.text}>
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },

  text: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
  },
});

export default LoadingSpinner;
