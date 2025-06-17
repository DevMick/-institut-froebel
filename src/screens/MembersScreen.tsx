import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Searchbar, Avatar } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { Card } from '../components/ui/Card';
import { theme } from '../theme';
import type { RootState } from '../store';

export default function MembersScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const members = useSelector((state: RootState) => state.members.members);

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMember = ({ item }: { item: any }) => (
    <Card style={styles.memberCard}>
      <View style={styles.memberHeader}>
        <Avatar.Text
          size={40}
          label={item.name
            .split(' ')
            .map((n: string) => n[0])
            .join('')}
          style={styles.avatar}
        />
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.name}</Text>
          <Text style={styles.memberRole}>{item.role}</Text>
        </View>
      </View>
      <View style={styles.memberDetails}>
        <Text style={styles.memberEmail}>{item.email}</Text>
        <Text style={styles.memberPhone}>{item.phone}</Text>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Rechercher un membre..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      <FlatList
        data={filteredMembers}
        renderItem={renderMember}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  list: {
    padding: 16,
  },
  memberCard: {
    marginBottom: 16,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    backgroundColor: theme.colors.primary,
  },
  memberInfo: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  memberRole: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
  },
  memberDetails: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.disabled,
    paddingTop: 12,
  },
  memberEmail: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 4,
  },
  memberPhone: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.7,
  },
}); 