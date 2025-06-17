/**
 * Main Tab Navigator - Rotary Club Mobile
 * Bottom Tab Navigator Material Design avec icônes, badges et animations
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { THEME } from '../config/theme';
import { useNotifications } from '../hooks/redux';
import type { MainTabParamList } from './types';

// Import des écrans (à créer)
// import HomeStack from './stacks/HomeStack';
// import ReunionsStack from './stacks/ReunionsStack';
// import MembersStack from './stacks/MembersStack';
// import FinanceStack from './stacks/FinanceStack';
// import ProfileStack from './stacks/ProfileStack';

// Écrans temporaires pour le développement
const HomeScreen = () => (
  <View style={styles.tempScreen}>
    <Text style={styles.tempText}>🏠 Home Screen</Text>
    <Text style={styles.tempSubtext}>Tableau de bord principal</Text>
  </View>
);

const ReunionsScreen = () => (
  <View style={styles.tempScreen}>
    <Text style={styles.tempText}>🤝 Reunions Screen</Text>
    <Text style={styles.tempSubtext}>Gestion des réunions</Text>
  </View>
);

const MembersScreen = () => (
  <View style={styles.tempScreen}>
    <Text style={styles.tempText}>👥 Members Screen</Text>
    <Text style={styles.tempSubtext}>Annuaire des membres</Text>
  </View>
);

const FinanceScreen = () => (
  <View style={styles.tempScreen}>
    <Text style={styles.tempText}>💰 Finance Screen</Text>
    <Text style={styles.tempSubtext}>Gestion financière</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={styles.tempScreen}>
    <Text style={styles.tempText}>👤 Profile Screen</Text>
    <Text style={styles.tempSubtext}>Profil utilisateur</Text>
  </View>
);

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Composant Badge pour les notifications
 */
const TabBadge: React.FC<{ count: number }> = ({ count }) => {
  if (count === 0) return null;
  
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>
        {count > 99 ? '99+' : count.toString()}
      </Text>
    </View>
  );
};

/**
 * Composant Icône de Tab avec animation
 */
const TabIcon: React.FC<{
  name: string;
  focused: boolean;
  color: string;
  size: number;
  badgeCount?: number;
}> = ({ name, focused, color, size, badgeCount = 0 }) => {
  return (
    <View style={styles.tabIconContainer}>
      <Icon
        name={name}
        size={focused ? size + 2 : size}
        color={color}
        style={[
          styles.tabIcon,
          focused && styles.tabIconFocused,
        ]}
      />
      {badgeCount > 0 && <TabBadge count={badgeCount} />}
    </View>
  );
};

/**
 * Main Tab Navigator
 */
export const MainTabNavigator: React.FC = () => {
  const { badgeCount } = useNotifications();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: THEME.colors.PRIMARY,
        tabBarInactiveTintColor: THEME.colors.GRAY_500,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
        tabBarItemStyle: styles.tabBarItem,
        tabBarHideOnKeyboard: true,
        // Animation pour Android
        ...(Platform.OS === 'android' && {
          tabBarBackground: () => (
            <View style={styles.tabBarBackground} />
          ),
        }),
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              name="home"
              focused={focused}
              color={color}
              size={size}
            />
          ),
          tabBarAccessibilityLabel: 'Accueil - Tableau de bord principal',
          tabBarTestID: 'home-tab',
        }}
      />
      
      <Tab.Screen
        name="Reunions"
        component={ReunionsScreen}
        options={{
          tabBarLabel: 'Réunions',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              name="event"
              focused={focused}
              color={color}
              size={size}
            />
          ),
          tabBarAccessibilityLabel: 'Réunions - Gestion des réunions du club',
          tabBarTestID: 'reunions-tab',
        }}
      />
      
      <Tab.Screen
        name="Members"
        component={MembersScreen}
        options={{
          tabBarLabel: 'Membres',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              name="people"
              focused={focused}
              color={color}
              size={size}
            />
          ),
          tabBarAccessibilityLabel: 'Membres - Annuaire des membres du club',
          tabBarTestID: 'members-tab',
        }}
      />
      
      <Tab.Screen
        name="Finance"
        component={FinanceScreen}
        options={{
          tabBarLabel: 'Finance',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              name="account-balance-wallet"
              focused={focused}
              color={color}
              size={size}
            />
          ),
          tabBarAccessibilityLabel: 'Finance - Gestion financière du club',
          tabBarTestID: 'finance-tab',
        }}
      />
      
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              name="person"
              focused={focused}
              color={color}
              size={size}
              badgeCount={badgeCount}
            />
          ),
          tabBarAccessibilityLabel: 'Profil - Paramètres et informations personnelles',
          tabBarTestID: 'profile-tab',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  // Styles pour les écrans temporaires
  tempScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.BACKGROUND,
    padding: THEME.spacing.XXL,
  },
  
  tempText: {
    fontSize: THEME.typography.FONT_SIZE.XXL,
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
  
  // Styles pour la tab bar
  tabBar: {
    backgroundColor: THEME.colors.SURFACE,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.OUTLINE_VARIANT,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    height: Platform.OS === 'ios' ? 84 : 64,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  tabBarBackground: {
    backgroundColor: THEME.colors.SURFACE,
    flex: 1,
  },
  
  tabBarLabel: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
    marginTop: 4,
  },
  
  tabBarIcon: {
    marginBottom: 2,
  },
  
  tabBarItem: {
    paddingVertical: 4,
  },
  
  // Styles pour les icônes de tab
  tabIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  
  tabIcon: {
    textAlign: 'center',
  },
  
  tabIconFocused: {
    // Animation ou effet pour l'état focused
    transform: [{ scale: 1.1 }],
  },
  
  // Styles pour le badge
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: THEME.colors.ERROR,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: THEME.colors.SURFACE,
  },
  
  badgeText: {
    color: THEME.colors.WHITE,
    fontSize: THEME.typography.FONT_SIZE.XS,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default MainTabNavigator;
