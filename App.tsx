/**
 * Rotary Club Mobile App - Version Expo Snack
 * Application simplifiée pour démonstration
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import ReunionsScreen from './src/screens/ReunionsScreen';
import MembersScreen from './src/screens/MembersScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Import store
import { store } from './src/store';

// Import theme
import { theme } from './src/theme';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <ReduxProvider store={store}>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName;

                  if (route.name === 'Home') {
                    iconName = focused ? 'home' : 'home-outline';
                  } else if (route.name === 'Reunions') {
                    iconName = focused ? 'calendar' : 'calendar-outline';
                  } else if (route.name === 'Members') {
                    iconName = focused ? 'people' : 'people-outline';
                  } else if (route.name === 'Profile') {
                    iconName = focused ? 'person' : 'person-outline';
                  }

                  return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: 'gray',
                headerStyle: {
                  backgroundColor: theme.colors.primary,
                },
                headerTintColor: '#fff',
              })}
            >
              <Tab.Screen 
                name="Home" 
                component={HomeScreen}
                options={{ title: 'Accueil' }}
              />
              <Tab.Screen 
                name="Reunions" 
                component={ReunionsScreen}
                options={{ title: 'Réunions' }}
              />
              <Tab.Screen 
                name="Members" 
                component={MembersScreen}
                options={{ title: 'Membres' }}
              />
              <Tab.Screen 
                name="Profile" 
                component={ProfileScreen}
                options={{ title: 'Profil' }}
              />
            </Tab.Navigator>
          </NavigationContainer>
          <StatusBar style="light" />
        </SafeAreaProvider>
      </PaperProvider>
    </ReduxProvider>
  );
}
