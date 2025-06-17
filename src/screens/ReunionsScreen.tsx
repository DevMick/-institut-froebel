import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { Card } from '../components/ui/Card';
import { theme } from '../theme';
import type { RootState } from '../store';

export default function ReunionsScreen() {
  const meetings = useSelector((state: RootState) => state.meetings.meetings);

  const handleQRScan = () => {
    Alert.alert(
      'Scanner QR',
      'Fonctionnalité de scan QR disponible dans l\'application native complète.',
      [{ text: 'OK' }]
    );
  };

  const renderMeeting = ({ item }: { item: any }) => (
    <Card style={styles.meetingCard}>
      <Text style={styles.meetingTitle}>{item.title}</Text>
      <Text style={styles.meetingDate}>
        {new Date(item.date).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
      <Text style={styles.meetingLocation}>{item.location}</Text>
      <Text style={styles.meetingStatus}>
        {item.attendees.length} participants
      </Text>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={meetings}
        renderItem={renderMeeting}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
      <FAB
        icon="qrcode-scan"
        style={styles.fab}
        onPress={handleQRScan}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    padding: 16,
  },
  meetingCard: {
    marginBottom: 16,
  },
  meetingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: theme.colors.primary,
  },
  meetingDate: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.8,
    marginBottom: 4,
  },
  meetingLocation: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.6,
    marginBottom: 4,
  },
  meetingStatus: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
}); 