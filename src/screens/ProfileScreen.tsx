import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Avatar, List, Switch } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { Card } from '../components/ui/Card';
import { theme } from '../theme';
import type { RootState } from '../store';

export default function ProfileScreen() {
  const user = useSelector((state: RootState) => state.user);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={user.name
            .split(' ')
            .map((n: string) => n[0])
            .join('')}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>{user.role}</Text>
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>
        <List.Item
          title="Email"
          description={user.email}
          left={props => <List.Icon {...props} icon="email" />}
        />
        <List.Item
          title="Club"
          description={user.club}
          left={props => <List.Icon {...props} icon="account-group" />}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Préférences</Text>
        <List.Item
          title="Notifications"
          description="Recevoir des notifications"
          left={props => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              color={theme.colors.primary}
            />
          )}
        />
        <List.Item
          title="Mode sombre"
          description="Activer le thème sombre"
          left={props => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => (
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              color={theme.colors.primary}
            />
          )}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <List.Item
          title="Modifier le profil"
          left={props => <List.Icon {...props} icon="account-edit" />}
          onPress={() => {}}
        />
        <List.Item
          title="Changer le mot de passe"
          left={props => <List.Icon {...props} icon="lock" />}
          onPress={() => {}}
        />
        <List.Item
          title="Se déconnecter"
          left={props => <List.Icon {...props} icon="logout" color={theme.colors.error} />}
          onPress={() => {}}
          titleStyle={{ color: theme.colors.error }}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: theme.colors.primary,
  },
  avatar: {
    backgroundColor: theme.colors.secondary,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
}); 