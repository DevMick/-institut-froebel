/**
 * App Navigator - Rotary Club Mobile
 * Root navigator avec conditional rendering, deep linking et persistence
 */

import React, { useEffect, useState } from 'react';
import { View, StatusBar, BackHandler, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/redux';
import { THEME } from '../config/theme';
import { LoadingSpinner } from '../components/ui';
import { getStatusBarStyle } from '../utils/platform';
import { navigationRef, isReadyRef } from '../utils/navigation';
import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';
import type { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

// Configuration du thème de navigation
const NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: THEME.colors.PRIMARY,
    background: THEME.colors.BACKGROUND,
    card: THEME.colors.SURFACE,
    text: THEME.colors.ON_SURFACE,
    border: THEME.colors.OUTLINE_VARIANT,
    notification: THEME.colors.ERROR,
  },
};

// Configuration deep linking
const linking = {
  prefixes: ['rotaryclub://', 'https://app.rotaryclub.com'],
  config: {
    screens: {
      AuthStack: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
          ResetPassword: 'reset-password/:token',
        },
      },
      MainTabs: {
        screens: {
          Home: 'home',
          Reunions: {
            screens: {
              ReunionsScreen: 'reunions',
              ReunionDetail: 'reunion/:reunionId',
            },
          },
          Members: {
            screens: {
              MembersScreen: 'members',
              MemberDetail: 'member/:memberId',
            },
          },
          Finance: {
            screens: {
              FinanceScreen: 'finance',
              PayDues: 'pay-dues/:duesId',
            },
          },
          Profile: 'profile',
        },
      },
      // Direct deep link screens
      ReunionDeepLink: 'reunion/:reunionId',
      MemberDeepLink: 'member/:memberId',
      PaymentDeepLink: 'payment/:paymentId',
      
      // Modal screens
      NotificationModal: 'notification/:notificationId',
      QRCodeModal: 'qr/:qrCode',
    },
  },
};

// Clé pour la persistence de navigation
const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';

/**
 * Écran de chargement pendant la vérification auth
 */
const LoadingScreen: React.FC = () => (
  <View style={{ 
    flex: 1, 
    backgroundColor: THEME.colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  }}>
    <LoadingSpinner
      size="large"
      variant="white"
      text="Chargement..."
    />
  </View>
);

/**
 * Écrans modaux temporaires
 */
const NotificationModal = () => (
  <View style={{ flex: 1, backgroundColor: THEME.colors.BACKGROUND, justifyContent: 'center', alignItems: 'center' }}>
    <LoadingSpinner text="Notification Modal" />
  </View>
);

const QRCodeModal = () => (
  <View style={{ flex: 1, backgroundColor: THEME.colors.BACKGROUND, justifyContent: 'center', alignItems: 'center' }}>
    <LoadingSpinner text="QR Code Modal" />
  </View>
);

const ErrorScreen = () => (
  <View style={{ flex: 1, backgroundColor: THEME.colors.BACKGROUND, justifyContent: 'center', alignItems: 'center' }}>
    <LoadingSpinner text="Error Screen" />
  </View>
);

/**
 * App Navigator principal
 */
export const AppNavigator: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();

  // Charger l'état de navigation persisté
  useEffect(() => {
    const restoreState = async () => {
      try {
        const initialUrl = await AsyncStorage.getItem(NAVIGATION_PERSISTENCE_KEY);
        
        if (initialUrl !== null) {
          // Restore navigation state
          setInitialState(JSON.parse(initialUrl));
        }
      } catch (e) {
        // Failed to restore state
        console.warn('Failed to restore navigation state:', e);
      } finally {
        setIsReady(true);
      }
    };

    if (!isReady) {
      restoreState();
    }
  }, [isReady]);

  // Gérer le bouton retour Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (navigationRef.current?.canGoBack()) {
        navigationRef.current.goBack();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, []);

  // Marquer la navigation comme prête
  useEffect(() => {
    return () => {
      isReadyRef.current = false;
    };
  }, []);

  if (!isReady || loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar {...getStatusBarStyle()} />
      <NavigationContainer
        ref={navigationRef}
        theme={NavigationTheme}
        linking={linking}
        initialState={initialState}
        onReady={() => {
          isReadyRef.current = true;
        }}
        onStateChange={(state) => {
          // Persister l'état de navigation
          AsyncStorage.setItem(NAVIGATION_PERSISTENCE_KEY, JSON.stringify(state));
        }}
      >
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            presentation: 'card',
            gestureEnabled: true,
          }}
        >
          {isAuthenticated ? (
            // Utilisateur authentifié - Afficher l'app principale
            <>
              <Stack.Screen
                name="MainTabs"
                component={MainTabNavigator}
                options={{
                  gestureEnabled: false,
                }}
              />
              
              {/* Écrans modaux */}
              <Stack.Group screenOptions={{ presentation: 'modal' }}>
                <Stack.Screen
                  name="NotificationModal"
                  component={NotificationModal}
                  options={{
                    headerShown: true,
                    title: 'Notification',
                  }}
                />
                
                <Stack.Screen
                  name="QRCodeModal"
                  component={QRCodeModal}
                  options={{
                    headerShown: true,
                    title: 'QR Code',
                  }}
                />
              </Stack.Group>
              
              {/* Écrans plein écran */}
              <Stack.Group screenOptions={{ presentation: 'transparentModal' }}>
                <Stack.Screen
                  name="ErrorScreen"
                  component={ErrorScreen}
                />
              </Stack.Group>
            </>
          ) : (
            // Utilisateur non authentifié - Afficher l'auth
            <Stack.Screen
              name="AuthStack"
              component={AuthStack}
              options={{
                gestureEnabled: false,
                animationEnabled: false,
              }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default AppNavigator;
