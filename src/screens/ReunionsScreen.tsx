import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { Card } from '../components/ui/Card';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { theme } from '../theme';
import type { RootState } from '../store';

export default function ReunionsScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannerVisible, setScannerVisible] = useState(false);
  const meetings = useSelector((state: RootState) => state.meetings.meetings);

  React.useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScannerVisible(false);
    // Handle scanned QR code data
    console.log('Scanned:', data);
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

  if (scannerVisible) {
    return (
      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        <FAB
          icon="close"
          style={styles.closeButton}
          onPress={() => setScannerVisible(false)}
        />
      </View>
    );
  }

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
        onPress={() => setScannerVisible(true)}
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
  scannerContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  closeButton: {
    position: 'absolute',
    margin: 16,
    right: 0,
    top: 0,
    backgroundColor: theme.colors.error,
  },
}); 