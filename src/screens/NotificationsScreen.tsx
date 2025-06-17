/**
 * Notifications Screen - Rotary Club Mobile
 * Liste notifications avec grouping par date, mark as read/unread, actions contextuelles
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SwipeRow } from 'react-native-swipe-list-view';
import { THEME } from '../config/theme';
import { Button } from '../components/ui';
import { useNotifications } from '../hooks/redux';
import { navigateFromNotification, executeNotificationAction } from '../utils/notificationHandlers';
import { notificationService } from '../services/notificationService';
import type { RotaryNotification } from '../types/notifications';
import type { MainTabScreenProps } from '../navigation/types';

type Props = MainTabScreenProps<'Notifications'>;

interface GroupedNotifications {
  title: string;
  data: RotaryNotification[];
}

export const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const { notifications, unreadCount, loading } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  // Grouper les notifications par date
  const groupedNotifications = useMemo(() => {
    const groups: GroupedNotifications[] = [];
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayNotifications = notifications.filter(n => 
      n.timestamp.toDateString() === today.toDateString()
    );
    const yesterdayNotifications = notifications.filter(n => 
      n.timestamp.toDateString() === yesterday.toDateString()
    );
    const olderNotifications = notifications.filter(n => 
      n.timestamp < yesterday
    );

    if (todayNotifications.length > 0) {
      groups.push({ title: 'Aujourd\'hui', data: todayNotifications });
    }
    if (yesterdayNotifications.length > 0) {
      groups.push({ title: 'Hier', data: yesterdayNotifications });
    }
    if (olderNotifications.length > 0) {
      groups.push({ title: 'Plus ancien', data: olderNotifications });
    }

    return groups;
  }, [notifications]);

  // Refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // TODO: Refresh notifications from server
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Navigation vers les paramètres
  const handleSettingsPress = useCallback(() => {
    navigation.navigate('NotificationSettings');
  }, [navigation]);

  // Demander les permissions
  const handleRequestPermissions = useCallback(async () => {
    const granted = await notificationService.requestPermissions();
    if (granted) {
      Alert.alert(
        'Notifications activées',
        'Vous recevrez maintenant les notifications importantes du club.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  // Sélection multiple
  const toggleSelection = useCallback((notificationId: string) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  }, []);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => !prev);
    setSelectedNotifications(new Set());
  }, []);

  // Actions groupées
  const handleMarkAllAsRead = useCallback(() => {
    // TODO: Dispatch action to mark all as read
    Alert.alert('Toutes les notifications ont été marquées comme lues');
  }, []);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Supprimer toutes les notifications',
      'Êtes-vous sûr de vouloir supprimer toutes les notifications ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            // TODO: Dispatch action to clear all
            Alert.alert('Toutes les notifications ont été supprimées');
          }
        },
      ]
    );
  }, []);

  // Render notification item
  const renderNotificationItem = useCallback(({ item }: { item: RotaryNotification }) => {
    const isSelected = selectedNotifications.has(item.id);
    
    const getNotificationIcon = () => {
      switch (item.type) {
        case 'reunion_reminder': return 'event';
        case 'finance_due': return 'payment';
        case 'announcement': return 'campaign';
        case 'project_update': return 'work';
        case 'member_joined': return 'person-add';
        default: return 'notifications';
      }
    };

    const getNotificationColor = () => {
      switch (item.priority) {
        case 'urgent': return THEME.colors.ERROR;
        case 'high': return THEME.colors.WARNING;
        case 'normal': return THEME.colors.PRIMARY;
        default: return THEME.colors.GRAY_500;
      }
    };

    const handlePress = () => {
      if (selectionMode) {
        toggleSelection(item.id);
      } else {
        navigateFromNotification(item);
      }
    };

    const handleLongPress = () => {
      if (!selectionMode) {
        setSelectionMode(true);
        toggleSelection(item.id);
      }
    };

    return (
      <SwipeRow
        rightOpenValue={-150}
        disableRightSwipe
        renderHiddenItem={() => (
          <View style={styles.hiddenActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.markReadButton]}
              onPress={() => {
                // TODO: Toggle read status
                console.log('Toggle read:', item.id);
              }}
            >
              <Icon 
                name={item.read ? 'mark-email-unread' : 'mark-email-read'} 
                size={20} 
                color={THEME.colors.WHITE} 
              />
              <Text style={styles.actionButtonText}>
                {item.read ? 'Non lu' : 'Lu'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => {
                // TODO: Delete notification
                console.log('Delete:', item.id);
              }}
            >
              <Icon name="delete" size={20} color={THEME.colors.WHITE} />
              <Text style={styles.actionButtonText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        )}
      >
        <TouchableOpacity
          style={[
            styles.notificationItem,
            !item.read && styles.unreadNotification,
            isSelected && styles.selectedNotification,
          ]}
          onPress={handlePress}
          onLongPress={handleLongPress}
          activeOpacity={0.7}
        >
          {selectionMode && (
            <View style={styles.selectionIndicator}>
              <Icon
                name={isSelected ? 'check-circle' : 'radio-button-unchecked'}
                size={24}
                color={isSelected ? THEME.colors.PRIMARY : THEME.colors.GRAY_400}
              />
            </View>
          )}

          <View style={[styles.iconContainer, { backgroundColor: `${getNotificationColor()}20` }]}>
            <Icon
              name={getNotificationIcon()}
              size={24}
              color={getNotificationColor()}
            />
          </View>

          <View style={styles.notificationContent}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.notificationTime}>
                {formatTime(item.timestamp)}
              </Text>
            </View>
            
            <Text style={styles.notificationBody} numberOfLines={2}>
              {item.body}
            </Text>

            {item.priority === 'urgent' && (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentText}>URGENT</Text>
              </View>
            )}
          </View>

          {!item.read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      </SwipeRow>
    );
  }, [selectionMode, selectedNotifications, toggleSelection]);

  // Render section header
  const renderSectionHeader = useCallback(({ section }: { section: GroupedNotifications }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  ), []);

  // Format time
  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes < 1 ? 'À l\'instant' : `${minutes}min`;
    }
    if (hours < 24) {
      return `${hours}h`;
    }
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={toggleSelectionMode}
        >
          <Icon 
            name={selectionMode ? 'close' : 'checklist'} 
            size={24} 
            color={THEME.colors.ON_SURFACE} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleSettingsPress}
        >
          <Icon name="settings" size={24} color={THEME.colors.ON_SURFACE} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="notifications-none" size={64} color={THEME.colors.GRAY_400} />
      <Text style={styles.emptyTitle}>Aucune notification</Text>
      <Text style={styles.emptyText}>
        Vous recevrez ici les notifications importantes du club.
      </Text>
      
      <Button
        title="Activer les notifications"
        onPress={handleRequestPermissions}
        variant="primary"
        style={styles.enableButton}
      />
    </View>
  );

  // Render selection actions
  const renderSelectionActions = () => {
    if (!selectionMode || selectedNotifications.size === 0) return null;

    return (
      <View style={styles.selectionActions}>
        <Text style={styles.selectionCount}>
          {selectedNotifications.size} sélectionnée(s)
        </Text>
        
        <View style={styles.selectionButtons}>
          <Button
            title="Marquer comme lu"
            onPress={() => {
              // TODO: Mark selected as read
              setSelectionMode(false);
              setSelectedNotifications(new Set());
            }}
            variant="outline"
            size="small"
          />
          
          <Button
            title="Supprimer"
            onPress={() => {
              // TODO: Delete selected
              setSelectionMode(false);
              setSelectedNotifications(new Set());
            }}
            variant="outline"
            size="small"
            style={styles.deleteSelectedButton}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderSelectionActions()}
      
      {notifications.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={groupedNotifications.flatMap(group => [
            { type: 'header', title: group.title },
            ...group.data.map(item => ({ type: 'item', ...item }))
          ])}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return renderSectionHeader({ section: { title: item.title, data: [] } });
            }
            return renderNotificationItem({ item: item as RotaryNotification });
          }}
          keyExtractor={(item, index) => 
            item.type === 'header' ? `header-${index}` : item.id
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[THEME.colors.PRIMARY]}
              tintColor={THEME.colors.PRIMARY}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      {!selectionMode && notifications.length > 0 && (
        <View style={styles.bottomActions}>
          <Button
            title="Tout marquer comme lu"
            onPress={handleMarkAllAsRead}
            variant="outline"
            style={styles.bottomButton}
          />
          
          <Button
            title="Tout supprimer"
            onPress={handleClearAll}
            variant="outline"
            style={styles.bottomButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.BACKGROUND,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.LG,
    paddingVertical: THEME.spacing.MD,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.OUTLINE_VARIANT,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: THEME.typography.FONT_SIZE.XL,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_SURFACE,
  },

  unreadBadge: {
    backgroundColor: THEME.colors.ERROR,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: THEME.spacing.SM,
    minWidth: 20,
    alignItems: 'center',
  },

  unreadBadgeText: {
    color: THEME.colors.WHITE,
    fontSize: THEME.typography.FONT_SIZE.XS,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerButton: {
    padding: THEME.spacing.SM,
    marginLeft: THEME.spacing.XS,
  },

  listContent: {
    paddingBottom: 100,
  },

  sectionHeader: {
    backgroundColor: THEME.colors.SURFACE,
    paddingHorizontal: THEME.spacing.LG,
    paddingVertical: THEME.spacing.SM,
  },

  sectionTitle: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.GRAY_600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: THEME.spacing.LG,
    paddingVertical: THEME.spacing.MD,
    backgroundColor: THEME.colors.BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.OUTLINE_VARIANT,
  },

  unreadNotification: {
    backgroundColor: THEME.colors.PRIMARY_CONTAINER,
  },

  selectedNotification: {
    backgroundColor: THEME.colors.SECONDARY_CONTAINER,
  },

  selectionIndicator: {
    marginRight: THEME.spacing.MD,
    paddingTop: 2,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.spacing.MD,
  },

  notificationContent: {
    flex: 1,
  },

  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.XS,
  },

  notificationTitle: {
    fontSize: THEME.typography.FONT_SIZE.MD,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.ON_SURFACE,
    flex: 1,
    marginRight: THEME.spacing.SM,
  },

  notificationTime: {
    fontSize: THEME.typography.FONT_SIZE.XS,
    color: THEME.colors.GRAY_500,
  },

  notificationBody: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    color: THEME.colors.GRAY_600,
    lineHeight: THEME.typography.LINE_HEIGHT.SM,
  },

  urgentBadge: {
    backgroundColor: THEME.colors.ERROR,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: THEME.spacing.XS,
  },

  urgentText: {
    color: THEME.colors.WHITE,
    fontSize: THEME.typography.FONT_SIZE.XS,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.PRIMARY,
    marginLeft: THEME.spacing.SM,
    marginTop: 6,
  },

  hiddenActions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: THEME.colors.GRAY_200,
  },

  actionButton: {
    width: 75,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  markReadButton: {
    backgroundColor: THEME.colors.INFO,
  },

  deleteButton: {
    backgroundColor: THEME.colors.ERROR,
  },

  actionButtonText: {
    color: THEME.colors.WHITE,
    fontSize: THEME.typography.FONT_SIZE.XS,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
    marginTop: 2,
  },

  selectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.LG,
    paddingVertical: THEME.spacing.SM,
    backgroundColor: THEME.colors.SECONDARY_CONTAINER,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.OUTLINE_VARIANT,
  },

  selectionCount: {
    fontSize: THEME.typography.FONT_SIZE.SM,
    fontWeight: THEME.typography.FONT_WEIGHT.MEDIUM,
    color: THEME.colors.ON_SECONDARY_CONTAINER,
  },

  selectionButtons: {
    flexDirection: 'row',
    gap: THEME.spacing.SM,
  },

  deleteSelectedButton: {
    borderColor: THEME.colors.ERROR,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.XXL,
  },

  emptyTitle: {
    fontSize: THEME.typography.FONT_SIZE.XL,
    fontWeight: THEME.typography.FONT_WEIGHT.BOLD,
    color: THEME.colors.GRAY_600,
    marginTop: THEME.spacing.LG,
    marginBottom: THEME.spacing.SM,
  },

  emptyText: {
    fontSize: THEME.typography.FONT_SIZE.MD,
    color: THEME.colors.GRAY_500,
    textAlign: 'center',
    lineHeight: THEME.typography.LINE_HEIGHT.MD,
    marginBottom: THEME.spacing.XXL,
  },

  enableButton: {
    minWidth: 200,
  },

  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: THEME.spacing.LG,
    paddingVertical: THEME.spacing.MD,
    backgroundColor: THEME.colors.SURFACE,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.OUTLINE_VARIANT,
    gap: THEME.spacing.SM,
  },

  bottomButton: {
    flex: 1,
  },
});

export default NotificationsScreen;
