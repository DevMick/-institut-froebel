/**
 * Auth Stack Navigator - Rotary Club Mobile
 * Stack Navigator pour authentification avec animations et header customisé
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createStackNavigator, StackNavigationOptions, TransitionPresets } from '@react-navigation/stack';
import { THEME } from '../config/theme';
import { getStatusBarStyle } from '../utils/platform';
import type { AuthStackParamList } from './types';

// Import des écrans d'authentification
import {
  WelcomeScreen,
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
} from '../screens/auth';

// Écran temporaire pour ResetPassword
const ResetPasswordScreen = () => (
  <View style={styles.tempScreen}>
    <Text style={styles.tempText}>🔄 Reset Password Screen</Text>
    <Text style={styles.tempSubtext}>Nouveau mot de passe</Text>
  </View>
);

const Stack = createStackNavigator<AuthStackParamList>();

/**
 * Header customisé avec logo Rotary
 */
const CustomHeader: React.FC<{ title: string }> = ({ title }) => (
  <View style={styles.headerContainer}>
    <View style={styles.headerContent}>
      <Text style={styles.headerLogo}>⚙️</Text>
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerTitle}>Rotary Club</Text>
        <Text style={styles.headerSubtitle}>{title}</Text>
      </View>
    </View>
  </View>
);

/**
 * Options d'écran par défaut pour l'Auth Stack
 */
const defaultScreenOptions: StackNavigationOptions = {
  headerStyle: {
    backgroundColor: THEME.colors.PRIMARY,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
  headerTintColor: THEME.colors.WHITE,
  headerTitleStyle: {
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    fontSize: THEME.typography.FONT_SIZE.LG,
  },
  headerTitleAlign: 'center',
  headerBackTitleVisible: false,
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  // Animations iOS-like pour Android
  ...Platform.select({
    ios: TransitionPresets.SlideFromRightIOS,
    android: TransitionPresets.SlideFromRightIOS,
  }),
  // Configuration status bar
  statusBarStyle: getStatusBarStyle(true).barStyle,
  statusBarBackgroundColor: THEME.colors.PRIMARY,
};

/**
 * Auth Stack Navigator
 */
export const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={defaultScreenOptions}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          headerShown: false,
          // Animation d'entrée spéciale pour l'écran de bienvenue
          animationEnabled: true,
          gestureEnabled: false,
        }}
      />
      
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          header: () => <CustomHeader title="Connexion" />,
          headerBackTitleVisible: false,
          gestureEnabled: true,
        }}
      />
      
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          header: () => <CustomHeader title="Inscription" />,
          headerBackTitleVisible: false,
          gestureEnabled: true,
        }}
      />
      
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          header: () => <CustomHeader title="Mot de passe oublié" />,
          headerBackTitleVisible: false,
          gestureEnabled: true,
        }}
      />
      
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          header: () => <CustomHeader title="Nouveau mot de passe" />,
          headerBackTitleVisible: false,
          gestureEnabled: false, // Empêcher le retour pendant la réinitialisation
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  // Styles pour l'écran temporaire ResetPassword
  tempScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.BACKGROUND,
    padding: THEME.spacing.XXL,
  },

  tempText: {
    fontSize: THEME.typography.FONT_SIZE.XXXL,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.PRIMARY,
    textAlign: 'center',
    marginBottom: THEME.spacing.LG,
  },

  tempSubtext: {
    fontSize: THEME.typography.FONT_SIZE.MD,
    color: THEME.colors.GRAY_600,
    textAlign: 'center',
    lineHeight: THEME.typography.LINE_HEIGHT.MD,
  },

  // Styles pour le header customisé
  headerContainer: {
    backgroundColor: THEME.colors.PRIMARY,
    paddingTop: Platform.OS === 'android' ? 25 : 0, // Status bar height
    paddingBottom: THEME.spacing.MD,
    paddingHorizontal: THEME.spacing.LG,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // Minimum touch target
  },
  
  headerLogo: {
    fontSize: 32,
    marginRight: THEME.spacing.MD,
  },
  
  headerTextContainer: {
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: THEME.typography.FONT_SIZE.LG,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.WHITE,
    textAlign: 'center',
  },
  
  headerSubtitle: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.SECONDARY,
    textAlign: 'center',
    marginTop: 2,
  },
});

export default AuthStack;
