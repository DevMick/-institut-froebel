/**
 * Login Screen - Rotary Club Mobile
 * Écran de connexion avec form validation, biométrie et error handling
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Button, Checkbox } from '../../components/ui';
import { AuthInput } from '../../components/auth/AuthInput';
import { THEME } from '../../config/theme';
import { useAuth } from '../../hooks/redux';
import { loginAsync } from '../../store/slices/authSlice';
import { validateEmail, validatePassword } from '../../utils/validation';
import type { AuthStackScreenProps } from '../../navigation/types';

type Props = AuthStackScreenProps<'Login'>;

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { dispatch, loading, error } = useAuth();
  
  // État du formulaire
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Validation en temps réel
  useEffect(() => {
    const errors: FormErrors = {};
    
    // Validation email
    if (formData.email && !validateEmail(formData.email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    // Validation password
    if (formData.password && !validatePassword(formData.password)) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    setFormErrors(errors);
    
    // Form valide si pas d'erreurs et champs remplis
    setIsFormValid(
      formData.email.length > 0 &&
      formData.password.length > 0 &&
      Object.keys(errors).length === 0
    );
  }, [formData]);

  // Gérer les erreurs de l'API
  useEffect(() => {
    if (error) {
      setFormErrors(prev => ({ ...prev, general: error }));
    }
  }, [error]);

  const handleInputChange = (field: keyof FormData) => (value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur générale quand l'utilisateur tape
    if (formErrors.general) {
      setFormErrors(prev => ({ ...prev, general: undefined }));
    }
  };

  const handleLogin = async () => {
    if (!isFormValid) return;

    try {
      await dispatch(loginAsync({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      })).unwrap();
      
      // Navigation automatique gérée par AppNavigator
    } catch (err) {
      // Erreur gérée par le useEffect
      console.error('Login error:', err);
    }
  };

  const handleBiometricLogin = () => {
    // TODO: Implémenter l'authentification biométrique
    Alert.alert(
      'Authentification biométrique',
      'Cette fonctionnalité sera disponible prochainement.',
      [{ text: 'OK' }]
    );
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Connexion</Text>
            <Text style={styles.subtitle}>
              Connectez-vous à votre compte Rotary
            </Text>
          </View>

          {/* Formulaire */}
          <View style={styles.form}>
            {/* Erreur générale */}
            {formErrors.general && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{formErrors.general}</Text>
              </View>
            )}

            {/* Email */}
            <AuthInput
              label="Adresse email"
              value={formData.email}
              onChangeText={handleInputChange('email')}
              error={formErrors.email}
              leftIcon="email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              required
              testID="login-email-input"
            />

            {/* Mot de passe */}
            <AuthInput
              label="Mot de passe"
              value={formData.password}
              onChangeText={handleInputChange('password')}
              error={formErrors.password}
              leftIcon="lock"
              secureTextEntry
              showPasswordToggle
              autoComplete="password"
              textContentType="password"
              required
              testID="login-password-input"
            />

            {/* Se souvenir de moi */}
            <View style={styles.rememberMeContainer}>
              <Checkbox
                checked={formData.rememberMe}
                onPress={handleInputChange('rememberMe')}
                label="Se souvenir de moi"
                testID="login-remember-checkbox"
              />
            </View>

            {/* Bouton de connexion */}
            <Button
              title="Se connecter"
              onPress={handleLogin}
              variant="primary"
              size="large"
              loading={loading}
              disabled={!isFormValid}
              style={styles.loginButton}
              accessibilityLabel="Se connecter à votre compte"
              testID="login-submit-button"
            />

            {/* Authentification biométrique */}
            <Button
              title="🔒 Connexion biométrique"
              onPress={handleBiometricLogin}
              variant="outline"
              size="large"
              style={styles.biometricButton}
              accessibilityLabel="Se connecter avec la biométrie"
              testID="login-biometric-button"
            />
          </View>

          {/* Actions secondaires */}
          <View style={styles.secondaryActions}>
            <Button
              title="Mot de passe oublié ?"
              onPress={handleForgotPassword}
              variant="text"
              size="medium"
              style={styles.forgotButton}
              accessibilityLabel="Récupérer votre mot de passe"
              testID="login-forgot-button"
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Pas encore de compte ?{' '}
            <Text style={styles.footerLink} onPress={handleRegister}>
              S'inscrire
            </Text>
          </Text>
        </View>
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
  },

  header: {
    marginBottom: THEME.spacing.HUGE,
    alignItems: 'center',
  },

  title: {
    fontSize: THEME.typography.FONT_SIZE.XXXL,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_SURFACE,
    marginBottom: THEME.spacing.SM,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: THEME.typography.FONT_SIZE.MD,
    color: THEME.colors.GRAY_600,
    textAlign: 'center',
    lineHeight: THEME.typography.LINE_HEIGHT.MD,
  },

  form: {
    flex: 1,
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

  rememberMeContainer: {
    marginBottom: THEME.spacing.XXL,
  },

  loginButton: {
    marginBottom: THEME.spacing.LG,
  },

  biometricButton: {
    marginBottom: THEME.spacing.XXL,
  },

  secondaryActions: {
    alignItems: 'center',
    marginBottom: THEME.spacing.XXL,
  },

  forgotButton: {
    // Styles par défaut du Button
  },

  footer: {
    paddingHorizontal: THEME.spacing.XXL,
    paddingVertical: THEME.spacing.LG,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.OUTLINE_VARIANT,
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
});

export default LoginScreen;
