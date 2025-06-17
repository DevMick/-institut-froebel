/**
 * Register Screen - Rotary Club Mobile
 * Écran d'inscription multi-étapes avec validation et upload photo
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
import { Button, Checkbox, ProgressBar } from '../../components/ui';
import { AuthInput } from '../../components/auth/AuthInput';
import { THEME } from '../../config/theme';
import { validateEmail, validatePassword, validatePhone } from '../../utils/validation';
import type { AuthStackScreenProps } from '../../navigation/types';

type Props = AuthStackScreenProps<'Register'>;

interface FormData {
  // Étape 1: Informations personnelles
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Étape 2: Club et rôle
  clubId: string;
  membershipType: string;
  classification: string;
  
  // Étape 3: Mot de passe et conditions
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

interface FormErrors {
  [key: string]: string | undefined;
}

const STEPS = [
  { id: 1, title: 'Informations personnelles', description: 'Vos coordonnées' },
  { id: 2, title: 'Club Rotary', description: 'Sélection de votre club' },
  { id: 3, title: 'Sécurité', description: 'Mot de passe et conditions' },
];

const MEMBERSHIP_TYPES = [
  { value: 'active', label: 'Membre actif' },
  { value: 'honorary', label: 'Membre d\'honneur' },
  { value: 'associate', label: 'Membre associé' },
];

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    clubId: '',
    membershipType: '',
    classification: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptPrivacy: false,
  });
  
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Validation en temps réel
  useEffect(() => {
    const errors: FormErrors = {};
    
    // Validation selon l'étape actuelle
    if (currentStep >= 1) {
      if (formData.firstName && formData.firstName.length < 2) {
        errors.firstName = 'Le prénom doit contenir au moins 2 caractères';
      }
      
      if (formData.lastName && formData.lastName.length < 2) {
        errors.lastName = 'Le nom doit contenir au moins 2 caractères';
      }
      
      if (formData.email && !validateEmail(formData.email)) {
        errors.email = 'Format d\'email invalide';
      }
      
      if (formData.phone && !validatePhone(formData.phone)) {
        errors.phone = 'Format de téléphone invalide';
      }
    }
    
    if (currentStep >= 3) {
      if (formData.password && !validatePassword(formData.password)) {
        errors.password = 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre';
      }
      
      if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }
    
    setFormErrors(errors);
  }, [formData, currentStep]);

  const handleInputChange = (field: keyof FormData) => (value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return (
          formData.firstName.length >= 2 &&
          formData.lastName.length >= 2 &&
          validateEmail(formData.email) &&
          (formData.phone === '' || validatePhone(formData.phone))
        );
      case 2:
        return (
          formData.clubId.length > 0 &&
          formData.membershipType.length > 0
        );
      case 3:
        return (
          validatePassword(formData.password) &&
          formData.password === formData.confirmPassword &&
          formData.acceptTerms &&
          formData.acceptPrivacy
        );
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!isStepValid(3)) return;

    setIsLoading(true);
    
    try {
      // TODO: Implémenter l'inscription
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulation
      
      Alert.alert(
        'Inscription réussie !',
        'Un email de vérification a été envoyé à votre adresse. Veuillez vérifier votre boîte de réception.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Erreur d\'inscription',
        'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <AuthInput
        label="Prénom"
        value={formData.firstName}
        onChangeText={handleInputChange('firstName')}
        error={formErrors.firstName}
        leftIcon="person"
        autoCapitalize="words"
        textContentType="givenName"
        required
        testID="register-firstname-input"
      />

      <AuthInput
        label="Nom"
        value={formData.lastName}
        onChangeText={handleInputChange('lastName')}
        error={formErrors.lastName}
        leftIcon="person"
        autoCapitalize="words"
        textContentType="familyName"
        required
        testID="register-lastname-input"
      />

      <AuthInput
        label="Adresse email"
        value={formData.email}
        onChangeText={handleInputChange('email')}
        error={formErrors.email}
        leftIcon="email"
        keyboardType="email-address"
        autoCapitalize="none"
        textContentType="emailAddress"
        required
        testID="register-email-input"
      />

      <AuthInput
        label="Téléphone (optionnel)"
        value={formData.phone}
        onChangeText={handleInputChange('phone')}
        error={formErrors.phone}
        leftIcon="phone"
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        testID="register-phone-input"
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>
        Sélectionnez votre club Rotary et votre type de membership
      </Text>

      <AuthInput
        label="Club Rotary"
        value={formData.clubId}
        onChangeText={handleInputChange('clubId')}
        error={formErrors.clubId}
        leftIcon="business"
        placeholder="Rechercher votre club..."
        required
        testID="register-club-input"
      />

      <AuthInput
        label="Type de membership"
        value={formData.membershipType}
        onChangeText={handleInputChange('membershipType')}
        error={formErrors.membershipType}
        leftIcon="card-membership"
        placeholder="Sélectionner le type..."
        required
        testID="register-membership-input"
      />

      <AuthInput
        label="Classification (optionnel)"
        value={formData.classification}
        onChangeText={handleInputChange('classification')}
        error={formErrors.classification}
        leftIcon="work"
        placeholder="Ex: Médecin, Avocat, Ingénieur..."
        testID="register-classification-input"
      />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <AuthInput
        label="Mot de passe"
        value={formData.password}
        onChangeText={handleInputChange('password')}
        error={formErrors.password}
        leftIcon="lock"
        secureTextEntry
        showPasswordToggle
        characterCount
        maxLength={50}
        textContentType="newPassword"
        required
        testID="register-password-input"
      />

      <AuthInput
        label="Confirmer le mot de passe"
        value={formData.confirmPassword}
        onChangeText={handleInputChange('confirmPassword')}
        error={formErrors.confirmPassword}
        leftIcon="lock"
        secureTextEntry
        showPasswordToggle
        textContentType="newPassword"
        required
        testID="register-confirm-password-input"
      />

      <View style={styles.termsContainer}>
        <Checkbox
          checked={formData.acceptTerms}
          onPress={handleInputChange('acceptTerms')}
          label="J'accepte les conditions d'utilisation"
          required
          testID="register-terms-checkbox"
        />

        <Checkbox
          checked={formData.acceptPrivacy}
          onPress={handleInputChange('acceptPrivacy')}
          label="J'accepte la politique de confidentialité"
          required
          testID="register-privacy-checkbox"
        />
      </View>
    </View>
  );

  const currentStepData = STEPS[currentStep - 1];
  const progress = currentStep / STEPS.length;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header avec progress */}
        <View style={styles.header}>
          <Text style={styles.title}>{currentStepData.title}</Text>
          <Text style={styles.subtitle}>{currentStepData.description}</Text>
          
          <ProgressBar
            progress={progress}
            style={styles.progressBar}
            testID="register-progress-bar"
          />
          
          <Text style={styles.stepIndicator}>
            Étape {currentStep} sur {STEPS.length}
          </Text>
        </View>

        {/* Contenu de l'étape */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          <View style={styles.actionButtons}>
            {currentStep > 1 && (
              <Button
                title="Précédent"
                onPress={handlePrevious}
                variant="outline"
                size="large"
                style={styles.previousButton}
                testID="register-previous-button"
              />
            )}
            
            {currentStep < STEPS.length ? (
              <Button
                title="Suivant"
                onPress={handleNext}
                variant="primary"
                size="large"
                disabled={!isStepValid(currentStep)}
                style={styles.nextButton}
                testID="register-next-button"
              />
            ) : (
              <Button
                title="S'inscrire"
                onPress={handleSubmit}
                variant="primary"
                size="large"
                loading={isLoading}
                disabled={!isStepValid(currentStep)}
                style={styles.submitButton}
                testID="register-submit-button"
              />
            )}
          </View>
          
          <Button
            title="Déjà un compte ? Se connecter"
            onPress={() => navigation.navigate('Login')}
            variant="text"
            size="medium"
            style={styles.loginLink}
            testID="register-login-link"
          />
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

  header: {
    paddingHorizontal: THEME.spacing.XXL,
    paddingTop: THEME.spacing.LG,
    paddingBottom: THEME.spacing.MD,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.OUTLINE_VARIANT,
  },

  title: {
    fontSize: THEME.typography.FONT_SIZE.XXL,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_SURFACE,
    marginBottom: THEME.spacing.XS,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_600,
    textAlign: 'center',
    marginBottom: THEME.spacing.LG,
  },

  progressBar: {
    marginBottom: THEME.spacing.SM,
  },

  stepIndicator: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    color: THEME.colors.GRAY_500,
    textAlign: 'center',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: THEME.spacing.XXL,
    paddingVertical: THEME.spacing.LG,
  },

  stepContent: {
    // Contenu des étapes
  },

  stepDescription: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_600,
    textAlign: 'center',
    marginBottom: THEME.spacing.LG,
    lineHeight: THEME.typography.LINE_HEIGHT.SM,
  },

  termsContainer: {
    marginTop: THEME.spacing.LG,
  },

  actions: {
    paddingHorizontal: THEME.spacing.XXL,
    paddingVertical: THEME.spacing.LG,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.OUTLINE_VARIANT,
  },

  actionButtons: {
    flexDirection: 'row',
    marginBottom: THEME.spacing.MD,
  },

  previousButton: {
    flex: 1,
    marginRight: THEME.spacing.SM,
  },

  nextButton: {
    flex: 2,
    marginLeft: THEME.spacing.SM,
  },

  submitButton: {
    flex: 1,
  },

  loginLink: {
    alignSelf: 'center',
  },
});

export default RegisterScreen;
