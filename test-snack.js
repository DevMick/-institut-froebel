/**
 * Test simple pour vérifier la compatibilité Expo Snack
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TestSnack() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 Rotary Club Mobile</Text>
      <Text style={styles.subtitle}>Test de compatibilité Expo Snack</Text>
      <Text style={styles.status}>✅ Imports React Native OK</Text>
      <Text style={styles.status}>✅ TypeScript OK</Text>
      <Text style={styles.status}>✅ Styles OK</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#005AA9', // Rotary Blue
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#F7A81B', // Rotary Gold
    marginBottom: 20,
  },
  status: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
  },
});
