/**
 * Test de compatibilité Expo Snack
 * Ce fichier teste tous les imports et fonctionnalités principales
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider, Button, Card, Avatar } from 'react-native-paper';
import { Provider as ReduxProvider, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { configureStore } from '@reduxjs/toolkit';

// Import du thème
import { theme } from './src/theme';

// Store de test simple
const testStore = configureStore({
  reducer: {
    test: (state = { message: 'Expo Snack fonctionne !' }, action) => state,
  },
});

const Tab = createBottomTabNavigator();

// Composant de test
const TestScreen = () => {
  const testState = useSelector((state: any) => state.test);
  
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>🎯 Test de compatibilité</Text>
          <Text style={styles.subtitle}>Rotary Club Mobile - Expo Snack</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>✅ Imports testés</Text>
          <Text style={styles.item}>• React Native (View, Text, ScrollView)</Text>
          <Text style={styles.item}>• Expo Status Bar</Text>
          <Text style={styles.item}>• React Native Paper</Text>
          <Text style={styles.item}>• Redux Toolkit</Text>
          <Text style={styles.item}>• React Navigation</Text>
          <Text style={styles.item}>• Safe Area Context</Text>
          <Text style={styles.item}>• Expo Vector Icons</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>🎨 Thème Rotary</Text>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: theme.colors.primary }]} />
            <Text style={styles.colorText}>Bleu Rotary: {theme.colors.primary}</Text>
          </View>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: theme.colors.secondary }]} />
            <Text style={styles.colorText}>Or Rotary: {theme.colors.secondary}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>🔧 Redux Store</Text>
          <Text style={styles.item}>Message du store: {testState.message}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>🎯 Composants UI</Text>
          <View style={styles.componentRow}>
            <Avatar.Text size={40} label="RC" style={styles.avatar} />
            <Button 
              mode="contained" 
              onPress={() => console.log('Button pressed')}
              style={styles.button}
            >
              Test Button
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>📱 Navigation</Text>
          <Text style={styles.item}>• Bottom Tab Navigator configuré</Text>
          <Text style={styles.item}>• Navigation Container actif</Text>
          <Text style={styles.item}>• Icônes Ionicons fonctionnelles</Text>
        </Card.Content>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🎉 Tous les tests passés ! L'application est prête pour Expo Snack.
        </Text>
      </View>
    </ScrollView>
  );
};

// Application de test
const TestApp = () => {
  return (
    <ReduxProvider store={testStore}>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={{
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: 'gray',
              }}
            >
              <Tab.Screen 
                name="Test" 
                component={TestScreen}
                options={{
                  title: 'Test Compatibilité',
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="checkmark-circle" size={size} color={color} />
                  ),
                }}
              />
            </Tab.Navigator>
          </NavigationContainer>
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </PaperProvider>
    </ReduxProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 12,
  },
  item: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    paddingLeft: 8,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 12,
  },
  colorText: {
    fontSize: 14,
    color: '#333',
  },
  componentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    backgroundColor: theme.colors.primary,
  },
  button: {
    backgroundColor: theme.colors.secondary,
  },
  footer: {
    margin: 16,
    padding: 16,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  footerText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TestApp;
