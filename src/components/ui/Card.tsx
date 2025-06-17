/**
 * Card Component - Rotary Club Mobile
 * Material Design Card avec elevation et variants
 */

import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Card as PaperCard } from 'react-native-paper';
import { theme } from '../../theme';

interface CardProps {
  /**
   * Contenu de la carte
   */
  children: React.ReactNode;
  
  /**
   * Fonction appelée lors du press (rend la carte touchable)
   */
  onPress?: () => void;
  
  /**
   * Styles personnalisés
   */
  style?: ViewStyle;
  
  /**
   * Élévation de la carte
   * @default 2
   */
  elevation?: number;
}

/**
 * Composant Card avec Material Design elevation
 * 
 * @example
 * ```tsx
 * // Carte simple
 * <Card variant="elevated">
 *   <Text>Contenu de la carte</Text>
 * </Card>
 * 
 * // Carte touchable
 * <Card 
 *   variant="outlined" 
 *   onPress={handlePress}
 *   accessibilityLabel="Carte membre"
 * >
 *   <MemberInfo member={member} />
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  elevation = 2,
}) => {
  return (
    <PaperCard
      style={[styles.card, style]}
      onPress={onPress}
      elevation={elevation}
    >
      <PaperCard.Content>{children}</PaperCard.Content>
    </PaperCard>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
  },
});

export default Card;
