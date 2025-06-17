/**
 * ErrorBoundary Component - Rotary Club Mobile
 * Gestion gracieuse des erreurs avec UI de fallback
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { THEME } from '../../config/theme';
import Button from './Button';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  /**
   * Composants enfants à protéger
   */
  children: ReactNode;
  
  /**
   * Fonction de callback lors d'une erreur
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  
  /**
   * UI de fallback personnalisée
   */
  fallback?: (error: Error, retry: () => void) => ReactNode;
  
  /**
   * Titre personnalisé pour l'erreur
   */
  title?: string;
  
  /**
   * Message personnalisé pour l'erreur
   */
  message?: string;
  
  /**
   * Afficher les détails techniques de l'erreur
   * @default false en production, true en développement
   */
  showErrorDetails?: boolean;
}

/**
 * ErrorBoundary pour capturer et gérer les erreurs React
 * 
 * @example
 * ```tsx
 * <ErrorBoundary
 *   onError={(error, errorInfo) => {
 *     // Logger l'erreur
 *     console.error('Error caught:', error, errorInfo);
 *   }}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Appeler le callback d'erreur si fourni
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Logger l'erreur en développement
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { 
      children, 
      fallback, 
      title = 'Une erreur est survenue',
      message = 'Nous nous excusons pour ce problème. Veuillez réessayer.',
      showErrorDetails = __DEV__,
    } = this.props;
    
    const { hasError, error } = this.state;

    if (hasError && error) {
      // Utiliser le fallback personnalisé si fourni
      if (fallback) {
        return fallback(error, this.handleRetry);
      }

      // UI de fallback par défaut avec branding Rotary
      return (
        <View style={styles.container}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Logo/Icône d'erreur */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>⚠️</Text>
            </View>

            {/* Titre */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Détails de l'erreur (en développement) */}
            {showErrorDetails && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorDetailsTitle}>
                  Détails techniques :
                </Text>
                <View style={styles.errorDetailsContent}>
                  <Text style={styles.errorDetailsText}>
                    {error.name}: {error.message}
                  </Text>
                  {error.stack && (
                    <Text style={styles.errorStack}>
                      {error.stack}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Boutons d'action */}
            <View style={styles.actions}>
              <Button
                title="Réessayer"
                onPress={this.handleRetry}
                variant="primary"
                size="large"
                style={styles.retryButton}
                accessibilityLabel="Réessayer après l'erreur"
              />
            </View>

            {/* Message de support */}
            <Text style={styles.supportMessage}>
              Si le problème persiste, contactez le support technique de votre club Rotary.
            </Text>
          </ScrollView>
        </View>
      );
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.BACKGROUND,
  },
  
  scrollView: {
    flex: 1,
  },
  
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.XXL,
  },
  
  iconContainer: {
    marginBottom: THEME.spacing.XL,
  },
  
  icon: {
    fontSize: 64,
    textAlign: 'center',
  },
  
  title: {
    fontSize: THEME.typography.FONT_SIZE.XXL,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_SURFACE,
    textAlign: 'center',
    marginBottom: THEME.spacing.LG,
  },
  
  message: {
    fontSize: THEME.typography.FONT_SIZE.MD,
    color: THEME.colors.GRAY_700,
    textAlign: 'center',
    lineHeight: THEME.typography.LINE_HEIGHT.MD,
    marginBottom: THEME.spacing.XXL,
    maxWidth: 300,
  },
  
  errorDetails: {
    width: '100%',
    marginBottom: THEME.spacing.XXL,
    padding: THEME.spacing.LG,
    backgroundColor: THEME.colors.GRAY_50,
    borderRadius: THEME.borderRadius.SM,
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.ERROR,
  },
  
  errorDetailsTitle: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    fontWeight: THEME.typography.FONT_WEIGHT.SEMI_BOLD,
    color: THEME.colors.ERROR,
    marginBottom: THEME.spacing.SM,
  },
  
  errorDetailsContent: {
    backgroundColor: THEME.colors.WHITE,
    padding: THEME.spacing.MD,
    borderRadius: THEME.borderRadius.XS,
  },
  
  errorDetailsText: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_800,
    fontFamily: 'monospace',
    marginBottom: THEME.spacing.SM,
  },
  
  errorStack: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    color: THEME.colors.GRAY_600,
    fontFamily: 'monospace',
    lineHeight: THEME.typography.LINE_HEIGHT.SM,
  },
  
  actions: {
    width: '100%',
    maxWidth: 200,
    marginBottom: THEME.spacing.XL,
  },
  
  retryButton: {
    width: '100%',
  },
  
  supportMessage: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_600,
    textAlign: 'center',
    lineHeight: THEME.typography.LINE_HEIGHT.SM,
    maxWidth: 280,
  },
});

export default ErrorBoundary;
