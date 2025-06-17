/**
 * Navigation Utilities - Rotary Club Mobile
 * Helpers navigation, deep linking, analytics et screen tracking
 */

import React from 'react';
import { createNavigationContainerRef, StackActions, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList, NavigationAnalytics, ScreenTrackingEvent } from '../navigation/types';

// ===== NAVIGATION REF =====
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
export const isReadyRef = React.createRef<boolean>();

// ===== NAVIGATION ANALYTICS =====
let navigationAnalytics: NavigationAnalytics = {
  screenViews: [],
  currentScreen: null,
  sessionStartTime: Date.now(),
  totalScreenTime: {},
};

// Clés de stockage
const STORAGE_KEYS = {
  NAVIGATION_ANALYTICS: 'navigation_analytics',
  LAST_SCREEN: 'last_screen',
  SCREEN_TIME: 'screen_time',
} as const;

// ===== NAVIGATION HELPERS =====

/**
 * Naviguer vers un écran
 */
export function navigate<T extends keyof RootStackParamList>(
  name: T,
  params?: RootStackParamList[T]
): void {
  if (isReadyRef.current && navigationRef.current) {
    navigationRef.current.navigate(name as any, params as any);
  }
}

/**
 * Retour en arrière
 */
export function goBack(): void {
  if (isReadyRef.current && navigationRef.current?.canGoBack()) {
    navigationRef.current.goBack();
  }
}

/**
 * Reset de la navigation
 */
export function reset(
  state: Parameters<typeof CommonActions.reset>[0]
): void {
  if (isReadyRef.current && navigationRef.current) {
    navigationRef.current.dispatch(CommonActions.reset(state));
  }
}

/**
 * Push vers un écran (pour les stacks)
 */
export function push<T extends keyof RootStackParamList>(
  name: T,
  params?: RootStackParamList[T]
): void {
  if (isReadyRef.current && navigationRef.current) {
    navigationRef.current.dispatch(StackActions.push(name as string, params));
  }
}

/**
 * Pop d'un écran (pour les stacks)
 */
export function pop(count: number = 1): void {
  if (isReadyRef.current && navigationRef.current) {
    navigationRef.current.dispatch(StackActions.pop(count));
  }
}

/**
 * Remplacer l'écran actuel
 */
export function replace<T extends keyof RootStackParamList>(
  name: T,
  params?: RootStackParamList[T]
): void {
  if (isReadyRef.current && navigationRef.current) {
    navigationRef.current.dispatch(StackActions.replace(name as string, params));
  }
}

/**
 * Obtenir l'écran actuel
 */
export function getCurrentScreen(): string | null {
  if (isReadyRef.current && navigationRef.current) {
    const route = navigationRef.current.getCurrentRoute();
    return route?.name || null;
  }
  return null;
}

/**
 * Obtenir les paramètres de l'écran actuel
 */
export function getCurrentParams(): Record<string, any> | undefined {
  if (isReadyRef.current && navigationRef.current) {
    const route = navigationRef.current.getCurrentRoute();
    return route?.params;
  }
  return undefined;
}

// ===== DEEP LINKING HELPERS =====

/**
 * Parser une URL de deep link
 */
export function parseDeepLink(url: string): {
  screen?: string;
  params?: Record<string, any>;
} | null {
  try {
    const parsedUrl = new URL(url);
    
    // Vérifier le scheme
    if (!['rotaryclub', 'https'].includes(parsedUrl.protocol.replace(':', ''))) {
      return null;
    }
    
    // Parser le path
    const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
    
    if (pathSegments.length === 0) {
      return { screen: 'Home' };
    }
    
    const [firstSegment, ...rest] = pathSegments;
    
    // Routes spécifiques
    switch (firstSegment) {
      case 'reunion':
        return {
          screen: 'ReunionDeepLink',
          params: { reunionId: rest[0] },
        };
      case 'member':
        return {
          screen: 'MemberDeepLink',
          params: { memberId: rest[0] },
        };
      case 'payment':
        return {
          screen: 'PaymentDeepLink',
          params: { paymentId: rest[0] },
        };
      case 'login':
        return { screen: 'AuthStack', params: { screen: 'Login' } };
      case 'register':
        return { screen: 'AuthStack', params: { screen: 'Register' } };
      default:
        return { screen: 'Home' };
    }
  } catch (error) {
    console.error('Error parsing deep link:', error);
    return null;
  }
}

/**
 * Générer une URL de deep link
 */
export function generateDeepLink(
  screen: string,
  params?: Record<string, any>
): string {
  const baseUrl = 'rotaryclub://';
  
  switch (screen) {
    case 'ReunionDetail':
      return `${baseUrl}reunion/${params?.reunionId}`;
    case 'MemberDetail':
      return `${baseUrl}member/${params?.memberId}`;
    case 'PayDues':
      return `${baseUrl}payment/${params?.paymentId}`;
    case 'Login':
      return `${baseUrl}login`;
    case 'Register':
      return `${baseUrl}register`;
    default:
      return `${baseUrl}home`;
  }
}

// ===== SCREEN TRACKING =====

/**
 * Tracker une vue d'écran
 */
export function trackScreenView(
  screenName: string,
  params?: Record<string, any>
): void {
  const now = Date.now();
  const previousScreen = navigationAnalytics.currentScreen;
  
  // Calculer le temps passé sur l'écran précédent
  if (previousScreen) {
    const lastEvent = navigationAnalytics.screenViews
      .filter(event => event.screenName === previousScreen)
      .pop();
    
    if (lastEvent) {
      const duration = now - lastEvent.timestamp;
      navigationAnalytics.totalScreenTime[previousScreen] = 
        (navigationAnalytics.totalScreenTime[previousScreen] || 0) + duration;
    }
  }
  
  // Enregistrer le nouvel événement
  const event: ScreenTrackingEvent = {
    screenName,
    previousScreenName: previousScreen || undefined,
    timestamp: now,
    params,
  };
  
  navigationAnalytics.screenViews.push(event);
  navigationAnalytics.currentScreen = screenName;
  
  // Limiter l'historique à 100 événements
  if (navigationAnalytics.screenViews.length > 100) {
    navigationAnalytics.screenViews = navigationAnalytics.screenViews.slice(-100);
  }
  
  // Sauvegarder les analytics
  saveNavigationAnalytics();
  
  if (__DEV__) {
    console.log('📊 Screen tracked:', screenName, params);
  }
}

/**
 * Obtenir les analytics de navigation
 */
export function getNavigationAnalytics(): NavigationAnalytics {
  return { ...navigationAnalytics };
}

/**
 * Obtenir le temps total passé sur un écran
 */
export function getScreenTime(screenName: string): number {
  return navigationAnalytics.totalScreenTime[screenName] || 0;
}

/**
 * Obtenir les écrans les plus visités
 */
export function getMostVisitedScreens(limit: number = 5): Array<{
  screenName: string;
  visits: number;
  totalTime: number;
}> {
  const screenStats: Record<string, { visits: number; totalTime: number }> = {};
  
  navigationAnalytics.screenViews.forEach(event => {
    if (!screenStats[event.screenName]) {
      screenStats[event.screenName] = { visits: 0, totalTime: 0 };
    }
    screenStats[event.screenName].visits++;
  });
  
  Object.keys(navigationAnalytics.totalScreenTime).forEach(screenName => {
    if (screenStats[screenName]) {
      screenStats[screenName].totalTime = navigationAnalytics.totalScreenTime[screenName];
    }
  });
  
  return Object.entries(screenStats)
    .map(([screenName, stats]) => ({ screenName, ...stats }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, limit);
}

/**
 * Reset des analytics
 */
export function resetNavigationAnalytics(): void {
  navigationAnalytics = {
    screenViews: [],
    currentScreen: null,
    sessionStartTime: Date.now(),
    totalScreenTime: {},
  };
  saveNavigationAnalytics();
}

/**
 * Sauvegarder les analytics
 */
async function saveNavigationAnalytics(): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.NAVIGATION_ANALYTICS,
      JSON.stringify(navigationAnalytics)
    );
  } catch (error) {
    console.error('Error saving navigation analytics:', error);
  }
}

/**
 * Charger les analytics sauvegardées
 */
export async function loadNavigationAnalytics(): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEYS.NAVIGATION_ANALYTICS);
    if (saved) {
      const parsed = JSON.parse(saved);
      navigationAnalytics = {
        ...parsed,
        sessionStartTime: Date.now(), // Nouvelle session
      };
    }
  } catch (error) {
    console.error('Error loading navigation analytics:', error);
  }
}

// ===== EXPORT GROUPÉ =====
export const NavigationUtils = {
  navigate,
  goBack,
  reset,
  push,
  pop,
  replace,
  getCurrentScreen,
  getCurrentParams,
  parseDeepLink,
  generateDeepLink,
  trackScreenView,
  getNavigationAnalytics,
  getScreenTime,
  getMostVisitedScreens,
  resetNavigationAnalytics,
  loadNavigationAnalytics,
};

export default NavigationUtils;
