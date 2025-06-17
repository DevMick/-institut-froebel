/**
 * Welcome Screen - Rotary Club Mobile
 * Écran d'accueil avec branding Rotary, value proposition et boutons navigation
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Button } from '../../components/ui';
import { THEME } from '../../config/theme';
import { getStatusBarStyle } from '../../utils/platform';
import type { AuthStackScreenProps } from '../../navigation/types';

const { width, height } = Dimensions.get('window');

type Props = AuthStackScreenProps<'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animation d'entrée séquentielle
    Animated.sequence([
      // Logo apparition et scale
      Animated.parallel([
        Animated.timing(logoScaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      // Contenu slide up
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, logoScaleAnim]);

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar {...getStatusBarStyle(true)} />
      
      {/* Header avec logo */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ scale: logoScaleAnim }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>⚙️</Text>
          <Text style={styles.logoText}>Rotary Club</Text>
          <Text style={styles.logoSubtext}>Mobile</Text>
        </View>
      </Animated.View>

      {/* Contenu principal */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.valueProposition}>
          <Text style={styles.title}>
            Connectez-vous avec votre club Rotary
          </Text>
          
          <Text style={styles.subtitle}>
            Gérez vos réunions, suivez vos projets et restez en contact avec les membres de votre club.
          </Text>

          <View style={styles.features}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🤝</Text>
              <Text style={styles.featureText}>Réunions et présences</Text>
            </View>
            
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>👥</Text>
              <Text style={styles.featureText}>Annuaire des membres</Text>
            </View>
            
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>💰</Text>
              <Text style={styles.featureText}>Gestion financière</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Boutons d'action */}
      <Animated.View 
        style={[
          styles.actions,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Button
          title="Se connecter"
          onPress={handleLogin}
          variant="primary"
          size="large"
          style={styles.loginButton}
          accessibilityLabel="Se connecter à votre compte Rotary"
          testID="welcome-login-button"
        />
        
        <Button
          title="S'inscrire"
          onPress={handleRegister}
          variant="outline"
          size="large"
          style={styles.registerButton}
          accessibilityLabel="Créer un nouveau compte Rotary"
          testID="welcome-register-button"
        />
        
        <Text style={styles.disclaimer}>
          En continuant, vous acceptez nos{' '}
          <Text style={styles.link}>Conditions d'utilisation</Text>
          {' '}et notre{' '}
          <Text style={styles.link}>Politique de confidentialité</Text>
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.PRIMARY,
  },
  
  header: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: THEME.spacing.XXL,
  },
  
  logoContainer: {
    alignItems: 'center',
  },
  
  logoIcon: {
    fontSize: 80,
    marginBottom: THEME.spacing.MD,
  },
  
  logoText: {
    fontSize: THEME.typography.FONT_SIZE.HUGE,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.WHITE,
    textAlign: 'center',
    marginBottom: THEME.spacing.XS,
  },
  
  logoSubtext: {
    fontSize: THEME.typography.FONT_SIZE.LG,
    color: THEME.colors.SECONDARY,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
  },
  
  content: {
    flex: 0.4,
    paddingHorizontal: THEME.spacing.XXL,
    justifyContent: 'center',
  },
  
  valueProposition: {
    alignItems: 'center',
  },
  
  title: {
    fontSize: THEME.typography.FONT_SIZE.XXL,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.WHITE,
    textAlign: 'center',
    marginBottom: THEME.spacing.LG,
    lineHeight: THEME.typography.LINE_HEIGHT.XXL,
  },
  
  subtitle: {
    fontSize: THEME.typography.FONT_SIZE.MD,
    color: THEME.colors.WHITE,
    textAlign: 'center',
    marginBottom: THEME.spacing.XXL,
    lineHeight: THEME.typography.LINE_HEIGHT.MD,
    opacity: 0.9,
  },
  
  features: {
    width: '100%',
  },
  
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.LG,
    paddingHorizontal: THEME.spacing.MD,
  },
  
  featureIcon: {
    fontSize: 24,
    marginRight: THEME.spacing.MD,
    width: 32,
    textAlign: 'center',
  },
  
  featureText: {
    fontSize: THEME.typography.FONT_SIZE.MD,
    color: THEME.colors.WHITE,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
    flex: 1,
  },
  
  actions: {
    flex: 0.2,
    paddingHorizontal: THEME.spacing.XXL,
    paddingBottom: THEME.spacing.XXL,
    justifyContent: 'flex-end',
  },
  
  loginButton: {
    marginBottom: THEME.spacing.MD,
    backgroundColor: THEME.colors.WHITE,
  },
  
  registerButton: {
    marginBottom: THEME.spacing.LG,
    borderColor: THEME.colors.WHITE,
  },
  
  disclaimer: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    color: THEME.colors.WHITE,
    textAlign: 'center',
    lineHeight: THEME.typography.LINE_HEIGHT.XS,
    opacity: 0.8,
  },
  
  link: {
    textDecorationLine: 'underline',
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
  },
});

export default WelcomeScreen;
