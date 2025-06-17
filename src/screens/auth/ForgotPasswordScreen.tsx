/**
 * Forgot Password Screen - Rotary Club Mobile
 * Écran mot de passe oublié avec email validation et resend timer
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Button } from '../../components/ui';
import { AuthInput } from '../../components/auth/AuthInput';
import { THEME } from '../../config/theme';
import { validateEmail } from '../../utils/validation';
import type { AuthStackScreenProps } from '../../navigation/types';

type Props = AuthStackScreenProps<'ForgotPassword'>;

interface FormState {
  email: string;
  isLoading: boolean;
  isEmailSent: boolean;
  resendTimer: number;
  error?: string;
}

const RESEND_COOLDOWN = 60; // 60 secondes

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [formState, setFormState] = useState<FormState>({
    email: '',
    isLoading: false,
    isEmailSent: false,
    resendTimer: 0,
  });

  const [emailError, setEmailError] = useState<string>();

  // Timer pour le resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (formState.resendTimer > 0) {
      interval = setInterval(() => {
        setFormState(prev => ({
          ...prev,
          resendTimer: prev.resendTimer - 1,
        }));
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [formState.resendTimer]);

  // Validation email en temps réel
  useEffect(() => {
    if (formState.email && !validateEmail(formState.email)) {
      setEmailError('Format d\'email invalide');
    } else {
      setEmailError(undefined);
    }
  }, [formState.email]);

  const handleEmailChange = (email: string) => {
    setFormState(prev => ({ ...prev, email, error: undefined }));
  };

  const handleSendResetLink = async () => {
    if (!validateEmail(formState.email)) {
      setEmailError('Veuillez saisir une adresse email valide');
      return;
    }

    setFormState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      // TODO: Implémenter l'envoi du lien de réinitialisation
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulation

      // Simulation d'une réponse réussie
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        isEmailSent: true,
        resendTimer: RESEND_COOLDOWN,
      }));

    } catch (error) {
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Une erreur est survenue. Veuillez réessayer.',
      }));
    }
  };

  const handleResendEmail = async () => {
    if (formState.resendTimer > 0) return;

    setFormState(prev => ({ ...prev, isLoading: true }));

    try {
      // TODO: Implémenter le renvoi du lien
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation

      setFormState(prev => ({
        ...prev,
        isLoading: false,
        resendTimer: RESEND_COOLDOWN,
      }));

      Alert.alert(
        'Email renvoyé',
        'Un nouveau lien de réinitialisation a été envoyé à votre adresse email.',
        [{ text: 'OK' }]
      );

    } catch (error) {
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erreur lors du renvoi. Veuillez réessayer.',
      }));
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  const isFormValid = validateEmail(formState.email) && !emailError;

  if (formState.isEmailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Success State */}
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>📧</Text>
            </View>

            <Text style={styles.successTitle}>
              Email envoyé !
            </Text>

            <Text style={styles.successMessage}>
              Nous avons envoyé un lien de réinitialisation à{' '}
              <Text style={styles.emailHighlight}>{formState.email}</Text>
            </Text>

            <Text style={styles.instructionsText}>
              Vérifiez votre boîte de réception et cliquez sur le lien pour réinitialiser votre mot de passe.
            </Text>

            {/* Resend Button */}
            <Button
              title={
                formState.resendTimer > 0
                  ? `Renvoyer dans ${formState.resendTimer}s`
                  : 'Renvoyer l\'email'
              }
              onPress={handleResendEmail}
              variant="outline"
              size="large"
              disabled={formState.resendTimer > 0}
              loading={formState.isLoading}
              style={styles.resendButton}
              accessibilityLabel="Renvoyer l'email de réinitialisation"
              testID="forgot-resend-button"
            />

            <Button
              title="Retour à la connexion"
              onPress={handleBackToLogin}
              variant="text"
              size="medium"
              style={styles.backButton}
              accessibilityLabel="Retourner à l'écran de connexion"
              testID="forgot-back-button"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>🔑</Text>
            </View>

            <Text style={styles.title}>
              Mot de passe oublié ?
            </Text>

            <Text style={styles.subtitle}>
              Saisissez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </Text>
          </View>

          {/* Formulaire */}
          <View style={styles.form}>
            {/* Erreur générale */}
            {formState.error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{formState.error}</Text>
              </View>
            )}

            {/* Email Input */}
            <AuthInput
              label="Adresse email"
              value={formState.email}
              onChangeText={handleEmailChange}
              error={emailError}
              leftIcon="email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              placeholder="votre@email.com"
              required
              testID="forgot-email-input"
            />

            {/* Send Button */}
            <Button
              title="Envoyer le lien de réinitialisation"
              onPress={handleSendResetLink}
              variant="primary"
              size="large"
              loading={formState.isLoading}
              disabled={!isFormValid}
              style={styles.sendButton}
              accessibilityLabel="Envoyer le lien de réinitialisation du mot de passe"
              testID="forgot-send-button"
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Vous vous souvenez de votre mot de passe ?{' '}
              <Text style={styles.footerLink} onPress={handleBackToLogin}>
                Se connecter
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.BACKGROUND,
  },

  keyboardAvoid: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: THEME.spacing.XXL,
    paddingTop: THEME.spacing.XXL,
    justifyContent: 'center',
  },

  header: {
    alignItems: 'center',
    marginBottom: THEME.spacing.HUGE,
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.colors.PRIMARY_CONTAINER,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: THEME.spacing.LG,
  },

  iconText: {
    fontSize: 40,
  },

  title: {
    fontSize: THEME.typography.FONT_SIZE.XXXL,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_SURFACE,
    marginBottom: THEME.spacing.MD,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: THEME.typography.FONT_SIZE.MD,
    color: THEME.colors.GRAY_600,
    textAlign: 'center',
    lineHeight: THEME.typography.LINE_HEIGHT.MD,
  },

  form: {
    marginBottom: THEME.spacing.XXL,
  },

  errorContainer: {
    backgroundColor: THEME.colors.ERROR_CONTAINER,
    borderRadius: THEME.radius.SM,
    padding: THEME.spacing.MD,
    marginBottom: THEME.spacing.LG,
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.ERROR,
  },

  errorText: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.ERROR,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
  },

  sendButton: {
    marginTop: THEME.spacing.LG,
  },

  footer: {
    alignItems: 'center',
  },

  footerText: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_600,
    textAlign: 'center',
  },

  footerLink: {
    color: THEME.colors.PRIMARY,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
  },

  // Success State Styles
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: THEME.colors.SUCCESS_CONTAINER,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: THEME.spacing.XXL,
  },

  successIconText: {
    fontSize: 50,
  },

  successTitle: {
    fontSize: THEME.typography.FONT_SIZE.XXXL,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_SURFACE,
    marginBottom: THEME.spacing.LG,
    textAlign: 'center',
  },

  successMessage: {
    fontSize: THEME.typography.FONT_SIZE.MD,
    color: THEME.colors.GRAY_600,
    textAlign: 'center',
    marginBottom: THEME.spacing.LG,
    lineHeight: THEME.typography.LINE_HEIGHT.MD,
  },

  emailHighlight: {
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.PRIMARY,
  },

  instructionsText: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_500,
    textAlign: 'center',
    marginBottom: THEME.spacing.XXL,
    lineHeight: THEME.typography.LINE_HEIGHT.SM,
  },

  resendButton: {
    marginBottom: THEME.spacing.LG,
    minWidth: 200,
  },

  backButton: {
    // Styles par défaut du Button
  },
});

export default ForgotPasswordScreen;
